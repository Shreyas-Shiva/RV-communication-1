import { db } from './db';

export interface SyncStatus {
  backendConnected: boolean;
  syncedCount: number;
  message: string;
}

export async function syncLocalLogsWithBackend(): Promise<SyncStatus> {
  const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  try {
    // 1. Check health
    const healthRes = await fetch(`${backendBase}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(2000)
    });

    if (!healthRes.ok) {
      return {
        backendConnected: false,
        syncedCount: 0,
        message: 'Backend server not responding. All logs preserved locally in IndexedDB.'
      };
    }

    // 2. Fetch unsynced records
    const unsynced = await db.activityLogs.filter(item => !item.isSynced).toArray();
    if (unsynced.length === 0) {
      return {
        backendConnected: true,
        syncedCount: 0,
        message: 'All local records are up to date.'
      };
    }

    // 3. Post to /api/sync
    const payload = {
      user_id: 'local-user',
      entries: unsynced.map(record => ({
        client_id: String(record.id),
        timestamp: new Date(record.timestamp).toISOString(),
        language: record.language,
        category: record.category,
        speaker: record.speaker,
        phrase: record.phrase,
        picture_id: record.assetId,
        intent: record.intentId,
        user_mode: record.userMode,
        is_favorite: record.isFavorite
      }))
    };

    const syncRes = await fetch(`${backendBase}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4000)
    });

    if (syncRes.ok) {
      const data = await syncRes.json();
      // Mark local logs as synced
      const ids = unsynced.map(i => i.id!).filter(Boolean);
      for (const id of ids) {
        await db.activityLogs.update(id, { isSynced: true });
      }

      return {
        backendConnected: true,
        syncedCount: data.synced_count ?? ids.length,
        message: `Successfully synchronized ${ids.length} records.`
      };
    }

    return {
      backendConnected: true,
      syncedCount: 0,
      message: 'Backend accepted connection but could not complete sync. Data remains safe locally.'
    };
  } catch {
    return {
      backendConnected: false,
      syncedCount: 0,
      message: 'Offline mode active. Data is stored safely on device.'
    };
  }
}
