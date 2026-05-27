"use client";

const DB_NAME = "voxa-audio-cache";
const STORE_NAME = "history-audio";
const DB_VERSION = 1;

type AudioRecord = {
  id: string;
  blob: Blob;
  createdAt: string;
};

function openAudioDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openAudioDb();

  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const request = callback(transaction.objectStore(STORE_NAME));

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
  return record?.blob;
}

export async function clearHistoryAudioCache() {
  await withStore("readwrite", (store) => store.clear());
}

export async function pruneHistoryAudioCache(keepIds: string[]) {
  const db = await openAudioDb();
  const keep = new Set(keepIds);

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
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
