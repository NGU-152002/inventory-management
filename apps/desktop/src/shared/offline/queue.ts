import Database from "@tauri-apps/plugin-sql";

export type OfflineAction = {
  id: string;
  endpoint: string;
  method: "POST";
  payload: unknown;
  createdAt: string;
};

const STORAGE_KEY = "inventory-offline-actions";

async function getDatabase() {
  try {
    return await Database.load("sqlite:offline.db");
  } catch {
    return null;
  }
}

export async function ensureOfflineQueue() {
  const database = await getDatabase();
  if (!database) {
    return;
  }

  await database.execute(`
    CREATE TABLE IF NOT EXISTS offline_queue (
      id TEXT PRIMARY KEY,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
}

export async function enqueueOfflineAction(action: OfflineAction) {
  const database = await getDatabase();
  if (database) {
    await database.execute(
      "INSERT INTO offline_queue (id, endpoint, method, payload, created_at) VALUES (?, ?, ?, ?, ?)",
      [action.id, action.endpoint, action.method, JSON.stringify(action.payload), action.createdAt]
    );
    return;
  }

  const current = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as OfflineAction[];
  current.push(action);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export async function listOfflineActions(): Promise<OfflineAction[]> {
  const database = await getDatabase();
  if (database) {
    const rows = await database.select<Array<Record<string, string>>>("SELECT * FROM offline_queue ORDER BY created_at");
    return rows.flatMap((row) => {
      if (!row.id || !row.endpoint || !row.payload || !row.created_at) {
        return [];
      }

      return [{
        id: row.id,
        endpoint: row.endpoint,
        method: "POST" as const,
        payload: JSON.parse(row.payload),
        createdAt: row.created_at
      }];
    });
  }

  const fallback = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Partial<OfflineAction>[];
  return fallback.flatMap((entry) => {
    if (!entry.id || !entry.endpoint || !entry.createdAt || !entry.method) {
      return [];
    }

    return [{
      id: entry.id,
      endpoint: entry.endpoint,
      method: entry.method,
      payload: entry.payload,
      createdAt: entry.createdAt
    }];
  });
}
