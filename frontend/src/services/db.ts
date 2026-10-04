import Dexie, { type EntityTable } from 'dexie';
import { LanguageCode, UserMode } from '../translations/types';

export interface ActivityRecord {
  id?: number;
  timestamp: number;
  dateKey: string; // YYYY-MM-DD
  phrase: string;
  assetId?: string;
  intentId?: string;
  language: LanguageCode;
  category: string;
  speaker: 'user' | 'partner';
  userMode: UserMode;
  isFavorite: boolean;
  isSynced: boolean;
}

export interface ConversationTurn {
  speaker: 'other' | 'user';
  text: string;
  timestamp: number;
  pictogramKeyword?: string;
}

export interface ConversationThread {
  id: string;
  title: string;
  startedAt: number;
  updatedAt: number;
  language: LanguageCode;
  userMode: UserMode;
  turns: ConversationTurn[];
}

export interface UserPreferences {
  id: string; // key: 'current'
  language: LanguageCode;
  userMode: UserMode;
  speechRate: number;
  speechPitch: number;
  voiceURI: string;
  textSize: 'normal' | 'large' | 'extra-large';
  buttonSize: 'normal' | 'large';
  highContrast: boolean;
  darkMode: boolean;
  reducedMotion: boolean;
  soundEffects: boolean;
  largeAndSimple: boolean;
  parentConsentGiven: boolean;
  onboardingCompleted: boolean;
  dailyStreak: number;
  starsCount: number;
  enableAI: boolean;
  enableGemini: boolean;
  demoMode: boolean;
}

export class CommuniqDatabase extends Dexie {
  activityLogs!: EntityTable<ActivityRecord, 'id'>;
  userPreferences!: EntityTable<UserPreferences, 'id'>;
  conversationThreads!: EntityTable<ConversationThread, 'id'>;

  constructor() {
    super('CommuniqDatabase');
    this.version(1).stores({
      activityLogs: '++id, timestamp, dateKey, language, category, speaker, isFavorite, isSynced',
      userPreferences: 'id'
    });
    this.version(2).stores({
      activityLogs: '++id, timestamp, dateKey, language, category, speaker, isFavorite, isSynced',
      userPreferences: 'id',
      conversationThreads: 'id, updatedAt, language'
    });
  }
}

export const db = new CommuniqDatabase();

export const DEFAULT_PREFERENCES: UserPreferences = {
  id: 'current',
  language: 'en',
  userMode: 'child',
  speechRate: 1.0,
  speechPitch: 1.0,
  voiceURI: '',
  textSize: 'normal',
  buttonSize: 'normal',
  highContrast: false,
  darkMode: false,
  reducedMotion: false,
  soundEffects: true,
  largeAndSimple: false,
  parentConsentGiven: false,
  onboardingCompleted: false,
  dailyStreak: 1,
  starsCount: 0,
  enableAI: false,
  enableGemini: false,
  demoMode: false
};

export async function getPreferences(): Promise<UserPreferences> {
  const prefs = await db.userPreferences.get('current');
  if (prefs) return prefs;
  await db.userPreferences.put(DEFAULT_PREFERENCES);
  return DEFAULT_PREFERENCES;
}

export async function savePreferences(partial: Partial<UserPreferences>): Promise<UserPreferences> {
  const current = await getPreferences();
  const updated: UserPreferences = { ...current, ...partial };
  await db.userPreferences.put(updated);
  return updated;
}

export async function logActivity(entry: Omit<ActivityRecord, 'id' | 'timestamp' | 'dateKey' | 'isSynced'>): Promise<number> {
  const now = new Date();
  const dateKey = now.toISOString().split('T')[0];
  const record: ActivityRecord = {
    ...entry,
    timestamp: now.getTime(),
    dateKey,
    isSynced: false
  };

  const id = await db.activityLogs.add(record);

  // Update star count and streaks for game rewards
  if (entry.userMode === 'child' || entry.userMode === 'student') {
    const prefs = await getPreferences();
    await savePreferences({
      starsCount: (prefs.starsCount || 0) + 1
    });
  }

  return id as number;
}

export async function toggleFavoriteLog(id: number): Promise<boolean> {
  const item = await db.activityLogs.get(id);
  if (!item) return false;
  const newFav = !item.isFavorite;
  await db.activityLogs.update(id, { isFavorite: newFav });
  return newFav;
}

export async function deleteLog(id: number): Promise<void> {
  await db.activityLogs.delete(id);
}

export async function saveConversationThread(thread: ConversationThread): Promise<void> {
  await db.conversationThreads.put(thread);
}

export async function getConversationThreads(): Promise<ConversationThread[]> {
  return await db.conversationThreads.orderBy('updatedAt').reverse().toArray();
}

export async function deleteConversationThread(id: string): Promise<void> {
  await db.conversationThreads.delete(id);
}

export async function clearAllUserData(): Promise<void> {
  await db.activityLogs.clear();
  await db.conversationThreads.clear();
  await db.userPreferences.clear();
  await db.userPreferences.put(DEFAULT_PREFERENCES);
}
