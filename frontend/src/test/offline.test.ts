import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db, logActivity, clearAllUserData } from '../services/db';
import { syncLocalLogsWithBackend } from '../services/sync';

describe('Offline Mode and Sync Resiliency', () => {
  beforeEach(async () => {
    await clearAllUserData();
    vi.restoreAllMocks();
  });

  it('keeps data safe locally when remote backend is offline or unreachable', async () => {
    await logActivity({
      phrase: 'I need water.',
      language: 'en',
      category: 'food_drink',
      speaker: 'user',
      userMode: 'adult',
      isFavorite: false
    });

    // Mock fetch to simulate network offline / backend unreachable
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    const status = await syncLocalLogsWithBackend();

    expect(status.backendConnected).toBe(false);
    expect(status.syncedCount).toBe(0);

    // Verify record remains intact and unsynced in IndexedDB
    const records = await db.activityLogs.toArray();
    expect(records.length).toBe(1);
    expect(records[0].phrase).toBe('I need water.');
    expect(records[0].isSynced).toBe(false);
  });
});
