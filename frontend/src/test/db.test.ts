import { describe, it, expect, beforeEach } from 'vitest';
import { db, logActivity, toggleFavoriteLog, deleteLog, clearAllUserData, getPreferences, savePreferences } from '../services/db';

describe('Offline IndexedDB Storage and My Day Log', () => {
  beforeEach(async () => {
    await clearAllUserData();
  });

  it('persists language and age mode preferences', async () => {
    const initial = await getPreferences();
    expect(initial.language).toBe('en');

    await savePreferences({ language: 'kn', userMode: 'child' });
    const updated = await getPreferences();
    expect(updated.language).toBe('kn');
    expect(updated.userMode).toBe('child');
  });

  it('records spoken phrase into activity log with timestamp and metadata', async () => {
    const id = await logActivity({
      phrase: 'I want pizza.',
      language: 'en',
      category: 'food_drink',
      assetId: 'pizza',
      intentId: 'want',
      speaker: 'user',
      userMode: 'child',
      isFavorite: false
    });

    expect(id).toBeDefined();
    const record = await db.activityLogs.get(id);
    expect(record).toBeDefined();
    expect(record?.phrase).toBe('I want pizza.');
    expect(record?.language).toBe('en');
    expect(record?.category).toBe('food_drink');
    expect(record?.speaker).toBe('user');
    expect(record?.isSynced).toBe(false);
  });

  it('toggles favorite status on activity record', async () => {
    const id = await logActivity({
      phrase: 'Thank you',
      language: 'en',
      category: 'greetings',
      speaker: 'user',
      userMode: 'adult',
      isFavorite: false
    });

    const isFavNow = await toggleFavoriteLog(id);
    expect(isFavNow).toBe(true);

    const record = await db.activityLogs.get(id);
    expect(record?.isFavorite).toBe(true);
  });

  it('deletes an individual log entry', async () => {
    const id = await logActivity({
      phrase: 'Water please',
      language: 'en',
      category: 'food_drink',
      speaker: 'user',
      userMode: 'adult',
      isFavorite: false
    });

    await deleteLog(id);
    const record = await db.activityLogs.get(id);
    expect(record).toBeUndefined();
  });

  it('clears all user data completely on request', async () => {
    await logActivity({
      phrase: 'Hello',
      language: 'en',
      category: 'greetings',
      speaker: 'user',
      userMode: 'child',
      isFavorite: false
    });

    await clearAllUserData();
    const count = await db.activityLogs.count();
    expect(count).toBe(0);
  });
});
