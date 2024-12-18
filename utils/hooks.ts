import { useEffect, useState } from "preact/hooks";
import { DBSchema, initializeDB } from "./db.ts";

export function useIndexedDB<T extends keyof DBSchema>(
  store: T,
  key: string
): [DBSchema[T]["value"] | null, boolean] {
  const [data, setData] = useState<DBSchema[T]["value"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const db = await initializeDB();
        if (!db || !mounted) return;

        const tx = db.transaction(store, "readonly");
        const objStore = tx.objectStore(store);
        const request = objStore.get(key);

        request.onerror = () => {
          console.error("IndexedDB read error:", request.error);
          if (mounted) {
            setLoading(false);
          }
        };

        request.onsuccess = () => {
          if (mounted) {
            setData(request.result);
            setLoading(false);
          }
        };

        // Listen for changes
        const bc = new globalThis.BroadcastChannel("db-updates");
        bc.onmessage = (event) => {
          if (
            event.data.store === store &&
            event.data.key === key
          ) {
            setData(event.data.value);
          }
        };

        return () => {
          mounted = false;
          bc.close();
        };
      } catch (err) {
        console.error("IndexedDB error:", err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [store, key]);

  return [data, loading];
} 