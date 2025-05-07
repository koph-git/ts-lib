/**
 * cache.ts
 * @version 1.0.0
 * @author Fabio Nogueira <fabio.bacabal@gmail.com>
 *
 * CacheJS - Biblioteca de Cache para Armazenamento Temporário e Persistente
 * Esta classe fornece uma implementação flexível de cache para armazenamento de dados
 * em três diferentes tipos de armazenamento:
 *   - **localStorage**  → Armazena os dados de forma persistente no navegador.
 *   - **sessionStorage** → Armazena os dados apenas enquanto a aba estiver aberta.
 *   - **memoryStorage**  → Cache em memória, válido apenas durante a execução da página.
 *
 * Recursos Principais:
 * ✅ Suporte a **expiração automática** dos itens armazenados (timeout configurável).
 * ✅ **Gerenciamento global do cache**, incluindo desativação e limpeza total.
 * ✅ **Prefixo personalizável**, permitindo evitar conflitos com outras chaves no storage.
 * ✅ **Modo seguro**: impede o uso do cache caso seja desativado globalmente.
 * ✅ **Integração com `window.CacheJS`**, permitindo acesso direto via console.
 *
 * -------------------------------------------------------------------------
 * 📌 Métodos da Classe `CacheJS`
 * -------------------------------------------------------------------------
 *
 * 📌 Métodos Estáticos:
 *  - `CacheJS.setPrefix(value: string)` → Define um prefixo para as chaves do cache.
 *  - `CacheJS.clearAll()` → Remove todos os itens armazenados em `localStorage` e `sessionStorage`.
 *  - `CacheJS.disable(flag = true)` → Ativa ou desativa o cache globalmente.
 *  - `CacheJS.version(value: string)` → Controla a versão do cache, limpando-o quando necessário.
 *
 * 📌 Métodos de Instância:
 *  - `new CacheJS(id, timeout, storageType)` → Cria uma nova instância do cache.
 *  - `cache.get(id, _default?, persistent?)` → Obtém um item do cache.
 *  - `cache.set(id, value, timeout?)` → Armazena um item no cache.
 *  - `cache.remove(id)` → Remove um item específico do cache.
 *  - `cache.clear()` → Remove todos os itens armazenados na instância do cache.
 *  - `cache.key(id)` → Gera a chave formatada para um item armazenado.
 *
 * -------------------------------------------------------------------------
 * 📌 Exemplo de Uso:
 * -------------------------------------------------------------------------
 * ```tsx
 * // Criando uma instância de cache que usa localStorage
 * const cache = new CacheJS("user-cache", 10 * 60000, "local"); // 10 minutos
 *
 * // Armazenando um valor
 * cache.set("username", "JohnDoe");
 *
 * // Recuperando um valor
 * console.log(cache.get("username")); // "JohnDoe"
 *
 * // Removendo um item
 * cache.remove("username");
 *
 * // Desativando o cache globalmente
 * CacheJS.disable();
 *
 * // Limpando todo o cache armazenado
 * CacheJS.clearAll();
 * ```
 *
 * -------------------------------------------------------------------------
 * 🚀 Desenvolvido para aplicações que precisam de cache eficiente e flexível no navegador!
 * -------------------------------------------------------------------------
 */

let PREFIX = "__cache__";

type TStorageType = "session" | "local" | "memory";
type TCache = Record<string, any>;

const memoryStorage: {
  _itens: TCache;
  setItem: (key: string, value: any) => void;
  getItem: (key: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
} = {
  _itens: {},
  setItem(key: string, value: any) {
    this._itens[key] = value;
  },
  getItem(key: string) {
    let r = this._itens[key];

    if (r === undefined) {
      r = null;
    }

    return r;
  },
  removeItem(key: string) {
    delete this._itens[key];
  },
  clear() {
    this._itens = {};
  },
};

class CacheJS {
  private static _disabled = false;

  public static setPrefix(value: string) {
    PREFIX = value;
  }
  public static clearAll() {
    clearAll();
  }
  public static disable(flag = true) {
    CacheJS._disabled = flag;

    if (flag) {
      console.warn("CacheJS is disabled.");
    }
  }
  public static version(value: string) {
    let key = `${PREFIX}.version`;
    let ver = window.localStorage.getItem(key);

    if (!value) {
      return ver;
    }

    if (ver != value) {
      console.warn("CLEAR ALL");
      clearAll();
    }

    window.localStorage.setItem(key, value);
  }

  private readonly _id: string | null = null;
  private readonly _timeout: number | null = null;
  private _storage: any = null;
  private _caches: TCache = {};

  constructor(
    id: string | null = null,
    timeout: number = 5 * 60000 /* default = 5 minutos */,
    storage: TStorageType = "local",
  ) {
    this._id = id || "cache";
    this._timeout = timeout; // milliseconds
    this._storage =
      storage == "session" ? window.sessionStorage : storage == "local" ? window.localStorage : memoryStorage;
  }

  timeout() {
    return this._timeout;
  }
  get(id: string, _default = null, persistent = false) {
    let value;
    let k = this.key(id);
    let r = this._caches[k];

    if (CacheJS._disabled) {
      return null;
    }

    if (!r) {
      r = JSON.parse(this._storage.getItem(k));
      this._caches[k] = r;
    }

    if (persistent) {
      value = r?.value;
      return value == null ? _default : value;
    }

    if (r?.timeout && r.timeout !== -1 && Date.now() - r.timestamp > r.timeout) {
      this.remove(id);
    } else {
      value = r?.value;
    }

    return value == null ? _default : value;
  }
  set(id: string, value: any, timeout: number | null = null) {
    let r;
    let k = this.key(id);

    if (CacheJS._disabled) {
      return value;
    }

    if (value === undefined) {
      console.warn(`CacheJS: Ignoring undefined value for key '${id}'`);
      return this;
    }

    timeout = timeout || this._timeout;

    this._caches[k] = r = { timeout, value, timestamp: Date.now() };
    this._storage.setItem(k, JSON.stringify(r));

    return value;
  }
  remove(id: string) {
    let k = this.key(id);

    if (CacheJS._disabled) {
      return this;
    }

    delete this._caches[k];
    this._storage.removeItem(k);

    return this;
  }
  clear() {
    Object.keys(this._caches).forEach((key) => {
      this._storage.removeItem(key);
    });

    this._caches = {};

    return this;
  }
  key(id: string) {
    return `${PREFIX}.${this._id}${id ? "." + id : ""}`;
  }
}

function clearAll() {
  memoryStorage.clear();

  Object.keys(window.localStorage)
    .filter((key) => key.startsWith(PREFIX))
    .forEach((key) => window.localStorage.removeItem(key));

  Object.keys(window.sessionStorage)
    .filter((key) => key.startsWith(PREFIX))
    .forEach((key) => window.sessionStorage.removeItem(key));
}

(window as any).CacheJS = CacheJS;

export { CacheJS };
