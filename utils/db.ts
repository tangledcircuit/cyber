// Shared schema types
export interface DBSchema {
  user_tokens: {
    key: string; // userId
    value: number;
  };
  purchases: {
    key: string; // purchaseId
    value: {
      userId: string;
      hours: number;
      tokens: number;
      amount: number;
      status: "pending" | "completed" | "failed";
      createdAt: number;
      completedAt?: number;
    };
  };
  user_purchases: {
    key: string; // `${userId}:${purchaseId}`
    value: boolean;
  };
  transactions: {
    key: string; // `${userId}:${timestamp}`
    value: {
      userId: string;
      type: "purchase" | "usage";
      amount: number;
      timestamp: number;
      description: string;
      balance: number;
    };
  };
}

// Offline queue types
interface QueuedOperation {
  id: string;
  store: keyof DBSchema;
  key: string;
  value: unknown;
  timestamp: number;
}

// Sync status types
export type SyncStatus = "synced" | "syncing" | "unsynced";

// Event emitter for sync status
export const syncEvents = new EventTarget();

// Initialize stores
export function initializeDB(): Promise<IDBDatabase | null> {
  if (typeof globalThis.indexedDB === "undefined") {
    return Promise.resolve(null);
  }

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("cyber", 3);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create stores that match KV structure
      if (!db.objectStoreNames.contains("user_tokens")) {
        db.createObjectStore("user_tokens");
      }
      
      if (!db.objectStoreNames.contains("purchases")) {
        db.createObjectStore("purchases");
      }
      
      if (!db.objectStoreNames.contains("user_purchases")) {
        db.createObjectStore("user_purchases");
      }

      // Add offline queue store
      if (!db.objectStoreNames.contains("offline_queue")) {
        const store = db.createObjectStore("offline_queue", { keyPath: "id" });
        store.createIndex("timestamp", "timestamp");
      }

      // Add transactions store
      if (!db.objectStoreNames.contains("transactions")) {
        const store = db.createObjectStore("transactions", { keyPath: "key" });
        store.createIndex("timestamp", "timestamp");
        store.createIndex("userId", "userId");
      }
    };

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Utility to convert KV key to IndexedDB key
export function kvKeyToIDBKey(key: unknown[]): string {
  return key.join(":");
}

// Queue an operation for offline sync
async function queueOperation(
  store: keyof DBSchema,
  key: string,
  value: unknown
): Promise<void> {
  const db = await initializeDB();
  if (!db) return;

  const operation: QueuedOperation = {
    id: crypto.randomUUID(),
    store,
    key,
    value,
    timestamp: Date.now(),
  };

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("offline_queue", "readwrite");
    const store = tx.objectStore("offline_queue");
    
    const request = store.add(operation);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Process offline queue when online
async function processOfflineQueue(kv: Deno.Kv): Promise<void> {
  const db = await initializeDB();
  if (!db) return;

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction("offline_queue", "readwrite");
    const store = tx.objectStore("offline_queue");
    const index = store.index("timestamp");
    
    const request = index.openCursor();
    const operations: Array<Promise<void>> = [];

    request.onsuccess = async () => {
      const cursor = request.result;
      if (!cursor) {
        // Process all operations
        try {
          await Promise.all(operations);
          resolve();
        } catch (err) {
          reject(err);
        }
        return;
      }

      const op = cursor.value as QueuedOperation;
      
      // Add operation to batch
      operations.push(
        kv.set([op.store, op.key], op.value)
          .then(() => {
            // Remove from queue after successful sync
            const deleteRequest = store.delete(op.id);
            return new Promise<void>((resolve, reject) => {
              deleteRequest.onerror = () => reject(deleteRequest.error);
              deleteRequest.onsuccess = () => resolve();
            });
          })
      );

      cursor.continue();
    };

    request.onerror = () => reject(request.error);
  });
}

// Sync utilities
export async function syncToIDB<T extends keyof DBSchema>(
  store: T,
  key: string,
  value: DBSchema[T]["value"]
) {
  const db = await initializeDB();
  if (!db) return;

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    const objStore = tx.objectStore(store);
    
    const request = objStore.put(value, key);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Safe broadcast utility
export function createBroadcastChannel(channelName: string): {
  postMessage: (message: unknown) => void;
  close: () => void;
} {
  if (typeof globalThis.BroadcastChannel !== "undefined") {
    const bc = new globalThis.BroadcastChannel(channelName);
    return {
      postMessage: (message: unknown) => bc.postMessage(message),
      close: () => bc.close(),
    };
  }
  // Return no-op implementation for non-browser environments
  return {
    postMessage: () => {},
    close: () => {},
  };
}

// Enhanced SyncedKv with offline support
export class SyncedKv {
  private isOnline = true;
  private syncStatus: SyncStatus = "synced";
  private isServer: boolean;

  constructor(private kv: Deno.Kv | null) {
    this.isServer = typeof Deno !== "undefined";

    if (!this.isServer) {
      // Listen for online/offline events in browser
      globalThis.addEventListener("online", this.handleOnline.bind(this));
      globalThis.addEventListener("offline", () => {
        this.isOnline = false;
        this.setSyncStatus("unsynced");
      });
      
      // Initial state
      this.isOnline = globalThis.navigator?.onLine ?? true;
      this.checkSyncStatus();
    }
  }

  // Protected method to update KV instance
  protected updateKv(newKv: Deno.Kv | null): void {
    this.kv = newKv;
  }

  private setSyncStatus(status: SyncStatus) {
    this.syncStatus = status;
    if (!this.isServer) {
      syncEvents.dispatchEvent(new CustomEvent("syncStatusChange", { 
        detail: { status } 
      }));
    }
  }

  private async checkSyncStatus() {
    if (this.isServer) return;

    const db = await initializeDB();
    if (!db) return;

    const tx = db.transaction("offline_queue", "readonly");
    const store = tx.objectStore("offline_queue");
    const count = await new Promise<number>((resolve) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(0);
    });

    this.setSyncStatus(count > 0 ? "unsynced" : "synced");
  }

  private async handleOnline() {
    this.isOnline = true;
    if (!this.isServer) {
      this.setSyncStatus("syncing");
      try {
        await processOfflineQueue(this.kv!);
        this.setSyncStatus("synced");
      } catch (error) {
        console.error("Sync error:", error);
        this.setSyncStatus("unsynced");
      }
    }
  }

  async get<T extends keyof DBSchema>(
    store: T,
    key: string
  ): Promise<Deno.KvEntryMaybe<DBSchema[T]["value"]>> {
    if (this.isServer && this.kv) {
      return this.kv.get([store, key]);
    } else {
      // Read from IndexedDB when offline or in browser
      const db = await initializeDB();
      if (!db) throw new Error("IndexedDB not available");

      return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readonly");
        const objStore = tx.objectStore(store);
        const request = objStore.get(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve({
          key: [store, key],
          value: request.result,
          versionstamp: "offline",
        });
      });
    }
  }

  async set<T extends keyof DBSchema>(
    store: T,
    key: string,
    value: DBSchema[T]["value"]
  ): Promise<void> {
    // Always update IndexedDB if in browser
    if (!this.isServer) {
      await syncToIDB(store, key, value);
    }

    if (this.isServer && this.kv) {
      await this.kv.set([store, key], value);
    } else if (!this.isServer) {
      if (this.isOnline && this.kv) {
        await this.kv.set([store, key], value);
      } else {
        // Queue for later if offline
        await queueOperation(store, key, value);
        this.setSyncStatus("unsynced");
      }
    }
  }

  atomic() {
    const atomic = this.kv?.atomic() ?? null;
    const operations: Array<() => Promise<void>> = [];
    const offlineOperations: Array<{
      store: keyof DBSchema;
      key: string;
      value: unknown;
    }> = [];

    return {
      set: <T extends keyof DBSchema>(
        store: T,
        key: string,
        value: DBSchema[T]["value"]
      ) => {
        if (this.isServer && atomic) {
          atomic.set([store, key], value);
        } else if (!this.isServer) {
          if (this.isOnline && atomic) {
            atomic.set([store, key], value);
          }
          operations.push(() => syncToIDB(store, key, value));
          offlineOperations.push({
            store,
            key,
            value,
          });
        }
        return this;
      },
      commit: async () => {
        if (this.isServer && atomic) {
          await atomic.commit();
        } else if (!this.isServer) {
          if (this.isOnline && atomic) {
            await atomic.commit();
          } else {
            // Queue all operations for offline sync
            await Promise.all(
              offlineOperations.map(op => 
                queueOperation(op.store, op.key, op.value)
              )
            );
            if (offlineOperations.length > 0) {
              this.setSyncStatus("unsynced");
            }
          }
          await Promise.all(operations.map(op => op()));
        }
      }
    };
  }
}

// Initialize KV instance
let kvInstance: Deno.Kv | null = null;

// Create and export db instance
export const db = new SyncedKv(kvInstance);

// Initialize KV if on server
if (typeof Deno !== "undefined") {
  Deno.openKv().then(kv => {
    kvInstance = kv;
    // Use protected method to update KV
    (db as unknown as { updateKv(kv: Deno.Kv): void }).updateKv(kv);
  });
} 