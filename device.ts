/**
 * device.ts
 * @version 1.0.0
 * @author Koph <kophmail@gmail.com>
 *
 * Identificador persistente do dispositivo (browser)
 * A identificação é gerada apenas uma vez e persistida entre sessões.
 *
 * Uso:
 * import { Device } from "path/to/device";
 * async function init() {
 *   const id = await Device.id();
 *   console.log("ID único do dispositivo:", id);
 * }
 *
 * init();
 * Exemplo de ID: 'f7c93089-4a7e-4a9c-8c52-1b2b4b1f00a1'
 */

const STORAGE_KEY = 'deviceId';
const DB_NAME = 'deviceDb';
const STORE_NAME = 'meta';
const COOKIE_MAX_AGE = 31536000; // 1 ano em segundos

function generateUUID(): string {
  return crypto?.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---------- IndexedDB helpers ----------
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
  });
}
async function saveToIndexedDB(value: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(value, STORAGE_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
async function getFromIndexedDB(): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(STORAGE_KEY);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

// ---------- cookie helpers ----------
function setCookie(name: string, value: string, maxAge = COOKIE_MAX_AGE) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
}
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// ---------- device logic ----------
let cachedDeviceId: string | null = null;

export const Device = {
  async id(): Promise<string> {
    if (cachedDeviceId) return cachedDeviceId;

    // 1. Tenta do localStorage
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage) {
      await persistEverywhere(fromStorage); // reforça redundância
      cachedDeviceId = fromStorage;
      return fromStorage;
    }

    // 2. Tenta do IndexedDB
    const fromIDB = await getFromIndexedDB();
    if (fromIDB) {
      await persistEverywhere(fromIDB);
      cachedDeviceId = fromIDB;
      return fromIDB;
    }

    // 3. Tenta do Cookie
    const fromCookie = getCookie(STORAGE_KEY);
    if (fromCookie) {
      await persistEverywhere(fromCookie);
      cachedDeviceId = fromCookie;
      return fromCookie;
    }

    // 4. Nenhum encontrado: gera novo
    const newId = generateUUID();
    await persistEverywhere(newId);
    cachedDeviceId = newId;
    return newId;
  }
};

async function persistEverywhere(value: string) {
  localStorage.setItem(STORAGE_KEY, value);
  await saveToIndexedDB(value);
  setCookie(STORAGE_KEY, value);
}
