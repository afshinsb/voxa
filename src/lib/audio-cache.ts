"use client";

const DB_NAME = "voxa-generated-media";
const STORE_NAME = "generated-media";
const LEGACY_DB_NAME = "voxa-audio-cache";
const LEGACY_STORE_NAME = "history-audio";
const DB_VERSION = 1;

type AudioRecord = {
  id: string;
  blob: Blob;
  createdAt: string;
};

function openAudioDb(dbName = DB_NAME, storeName = STORE_NAME) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, DB_VERSION);

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) {
        request.result.createObjectStore(storeName, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<T>, dbName = DB_NAME, storeName = STORE_NAME) {
  const db = await openAudioDb(dbName, storeName);

  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const request = callback(transaction.objectStore(storeName));

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export function blobFromBase64(mimeType: string, base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

export async function saveHistoryAudio(id: string, blob: Blob) {
  await withStore("readwrite", (store) => store.put({ id, blob, createdAt: new Date().toISOString() } satisfies AudioRecord));
}

export async function getHistoryAudioBlob(id: string) {
  const record = await withStore<AudioRecord | undefined>("readonly", (store) => store.get(id));
  if (record?.blob) return record.blob;

  const legacyRecord = await withStore<AudioRecord | undefined>("readonly", (store) => store.get(id), LEGACY_DB_NAME, LEGACY_STORE_NAME).catch(() => undefined);
  return legacyRecord?.blob;
}

export async function clearHistoryAudioCache() {
  await withStore("readwrite", (store) => store.clear());
  await withStore("readwrite", (store) => store.clear(), LEGACY_DB_NAME, LEGACY_STORE_NAME).catch(() => undefined);
}

export async function pruneHistoryAudioCache(keepIds: string[]) {
  await pruneAudioDb(DB_NAME, STORE_NAME, keepIds);
  await pruneAudioDb(LEGACY_DB_NAME, LEGACY_STORE_NAME, keepIds).catch(() => undefined);
}

async function pruneAudioDb(dbName: string, storeName: string, keepIds: string[]) {
  const db = await openAudioDb(dbName, storeName);
  const keep = new Set(keepIds);

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.getAllKeys();

    request.onsuccess = () => {
      for (const key of request.result) {
        if (typeof key === "string" && !keep.has(key)) {
          store.delete(key);
        }
      }
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}
