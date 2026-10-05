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

export interface CustomCardRecord {
  id: string;
  labels: {
    en: string;
    kn: string;
    hi: string;
  };
  spokenText: {
    en: string;
    kn: string;
    hi: string;
  };
  wordClass: string;
  folderId: string;
  photoDataUrl?: string;
  svgIcon?: string;
  slotIndex?: number;
  createdAt: number;
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
  speakOnTap: boolean;
  screenDensity: 'compact' | 'comfortable' | 'large';
  wordingForMe: 'neutral' | 'masculine' | 'feminine';
  vocabLevel: 1 | 2 | 3;
  gridSize: 'fewer' | 'standard' | 'more';
  pinSalt?: string;
  pinHash?: string;
  failedPinAttempts?: number;
  pinLockUntil?: number;
  tapToSpeak: 'instant' | 'after_say_it';
}

export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + ':' + pin);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let hash = 0;
  const str = salt + ':' + pin;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
}

export class CommuniqDatabase extends Dexie {
  activityLogs!: EntityTable<ActivityRecord, 'id'>;
  userPreferences!: EntityTable<UserPreferences, 'id'>;
  conversationThreads!: EntityTable<ConversationThread, 'id'>;
  customCards!: EntityTable<CustomCardRecord, 'id'>;

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
    this.version(3).stores({
      activityLogs: '++id, timestamp, dateKey, language, category, speaker, isFavorite, isSynced',
      userPreferences: 'id',
      conversationThreads: 'id, updatedAt, language',
      customCards: 'id, folderId, createdAt'
    });
  }
}

export const db = new CommuniqDatabase();

if (typeof window !== 'undefined') {
  (window as unknown as { __communiq_db?: CommuniqDatabase }).__communiq_db = db;
}

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
  soundEffects: false,
  largeAndSimple: false,
  parentConsentGiven: false,
  onboardingCompleted: false,
  dailyStreak: 1,
  starsCount: 0,
  enableAI: false,
  enableGemini: false,
  demoMode: false,
  speakOnTap: true,
  screenDensity: 'compact',
  wordingForMe: 'neutral',
  vocabLevel: 3,
  gridSize: 'standard',
  pinSalt: undefined,
  pinHash: undefined,
  failedPinAttempts: 0,
  pinLockUntil: 0,
  tapToSpeak: 'after_say_it'
};

export async function getPreferences(): Promise<UserPreferences> {
  const prefs = await db.userPreferences.get('current');
  if (prefs) return { ...DEFAULT_PREFERENCES, ...prefs };
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

// Custom Cards management (caregiver-friendly, strictly offline in IndexedDB)
export async function getCustomCards(): Promise<CustomCardRecord[]> {
  return await db.customCards.toArray();
}

export async function saveCustomCard(card: CustomCardRecord): Promise<void> {
  await db.customCards.put(card);
}

export async function deleteCustomCard(id: string): Promise<void> {
  await db.customCards.delete(id);
}

export async function exportBoardJson(): Promise<string> {
  const prefs = await getPreferences();
  const custom = await getCustomCards();
  const exportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    preferences: {
      vocabLevel: prefs.vocabLevel,
      gridSize: prefs.gridSize,
      screenDensity: prefs.screenDensity,
      language: prefs.language,
      userMode: prefs.userMode
    },
    customCards: custom
  };
  return JSON.stringify(exportPayload, null, 2);
}

export async function importBoardJson(jsonStr: string): Promise<number> {
  const payload = JSON.parse(jsonStr);
  let importedCount = 0;
  if (payload.customCards && Array.isArray(payload.customCards)) {
    for (const card of payload.customCards) {
      if (card && card.id && card.labels) {
        await db.customCards.put(card);
        importedCount++;
      }
    }
  }
  if (payload.preferences) {
    await savePreferences(payload.preferences);
  }
  return importedCount;
}

export async function clearAllUserData(): Promise<void> {
  await db.activityLogs.clear();
  await db.conversationThreads.clear();
  await db.customCards.clear();
  await db.userPreferences.clear();
  await db.userPreferences.put(DEFAULT_PREFERENCES);
}
