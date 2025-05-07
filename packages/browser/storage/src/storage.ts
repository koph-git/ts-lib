const keyPrefix = "_".repeat(2) + "s" + "_".repeat(2) + ".";
const stores: Record<string, any> = {};

export class Storage {
  private readonly _storage;
  private readonly _encrypt: boolean;

  constructor(encrypt = false, useSession = false, private _key: string = "") {
    this._encrypt = encrypt;
    this._storage = useSession ? sessionStorage : localStorage;
  }

  getItem(key: string) {
    return this._storage.getItem(this._key + key);
  }

  setItem(key: string, value: string) {
    return this._storage.setItem(this._key + key, value);
  }

  removeItem(key: string) {
    this._storage.removeItem(this._key + key);
  }

  read<T>(key: string): T | null {
    const encKey = encryptKey(this._key + key);
    let result: any = null;
    let item = this._storage.getItem(encKey);

    if (item) {
      try {
        if (this._encrypt) {
          item = item.substring(3);
          item = atob?.(item);
        }
        result = item ? (item.startsWith("{") || item.startsWith("[") ? JSON.parse(item) : item) : null;
      } catch {
        result = item;
        this.removeItem(encKey);
      }
    }

    return result;
  }

  write(key: string, value?: string | object | Array<any>) {
    const encKey = encryptKey(this._key + key);
    let item: any;

    if (!value) {
      this.remove(key);
    } else {
      item = typeof value == "string" ? value : JSON.stringify(value);
      if (this._encrypt && item.length > 2) {
        const prefix = Math.random().toString(36).slice(2, 5);
        item = prefix + btoa(item).replace(/=/g, "");
      }
      this._storage.setItem(encKey, item);
    }
  }

  remove(key: string) {
    const encKey = encryptKey(this._key + key);
    this._storage.removeItem(encKey);
  }
}

export function createStore<T = {}>(name: string, obj: T): T {
  const storage = new Storage(true, true, name);

  if (stores[name]) {
    return stores[name];
  }

  Object.keys(obj as any).forEach((key) => {
    storage.write(key, (obj as any)[key]);
  });

  const proxy = new Proxy(obj as any, {
    get(target, key) {
      if (key in target) {
        return storage.read(String(key));
      }
    },
    set(target, key, value) {
      if (key in target) {
        storage.write(String(key), value);
        return true;
      }
      return false;
    },
  });

  stores[name] = proxy;

  // 🔄 sincronização entre abas
  window.addEventListener("storage", (event) => {
    if (!event.key) return;

    const prefix = encryptKey(name);
    if (event.key.startsWith(prefix)) {
      const prop = atob(event.key.replace(prefix, "")).replace(`${keyPrefix}${name}`, "");
      if (prop in proxy) {
        proxy[prop] = storage.read(prop);
      }
    }
  });

  return proxy;
}

function encryptKey(key: string) {
  return keyPrefix + btoa(`${keyPrefix}${key}`).replace(/=/g, "");
}
