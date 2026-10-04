import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  extractSpeechTokens,
  predictConversationResponses,
  improveUserText
} from '../services/ai';
import {
  saveConversationThread,
  getConversationThreads,
  deleteConversationThread,
  clearAllUserData,
  ConversationThread
} from '../services/db';

describe('Phase 2 Conversation Engine and AI Client', () => {
  beforeEach(async () => {
    await clearAllUserData();
    vi.restoreAllMocks();
  });

  describe('extractSpeechTokens keyword-to-pictogram mapping', () => {
    it('extracts English speech keywords and identifies matching pictograms', () => {
      const text = "Would you like some water or pizza to eat?";
      const tokens = extractSpeechTokens(text);

      expect(tokens.length).toBeGreaterThan(0);
      const waterToken = tokens.find(t => t.word.toLowerCase().includes('water'));
      expect(waterToken).toBeDefined();
      expect(waterToken?.pictogram).toBe('water');

      const pizzaToken = tokens.find(t => t.word.toLowerCase().includes('pizza'));
      expect(pizzaToken).toBeDefined();
      expect(pizzaToken?.pictogram).toBe('pizza');

      const eatToken = tokens.find(t => t.word.toLowerCase().includes('eat'));
      expect(eatToken?.pictogram).toBe('food');
    });

    it('extracts Kannada speech keywords and identifies matching pictograms', () => {
      const text = "ನೀವು ಊಟ ಮತ್ತು ನೀರು ಸೇವಿಸುವಿರಾ?";
      const tokens = extractSpeechTokens(text);

      const foodToken = tokens.find(t => t.word.includes('ಊಟ'));
      expect(foodToken?.pictogram).toBe('food');

      const waterToken = tokens.find(t => t.word.includes('ನೀರು'));
      expect(waterToken?.pictogram).toBe('water');
    });

    it('extracts Hindi speech keywords and identifies matching pictograms', () => {
      const text = "क्या आपको भूख लगी है और खाना चाहिए?";
      const tokens = extractSpeechTokens(text);

      const foodToken = tokens.find(t => t.word.includes('खाना'));
      expect(foodToken?.pictogram).toBe('food');
    });
  });

  describe('predictConversationResponses local offline rule engine', () => {
    it('returns offline local fallback predictions when AI is disabled', async () => {
      const result = await predictConversationResponses({
        language: 'en',
        ageGroup: 'child',
        conversationId: 'test_convo_1',
        messages: [{ speaker: 'other', text: 'Are you hungry?', time: Date.now() }],
        currentTopic: 'hunger',
        enableAI: false,
        demoMode: false
      });

      expect(result.providerUsed).toBe('local_fallback');
      expect(result.responses.length).toBeGreaterThanOrEqual(3);
      expect(result.responses.length).toBeLessThanOrEqual(6);

      // Verify "Something else" card is present
      const somethingElse = result.responses.find(r => r.intent === 'custom');
      expect(somethingElse).toBeDefined();
      expect(somethingElse?.label).toBe('Something else');
    });

    it('adapts phrasing for child mode vs adult mode', async () => {
      const childResult = await predictConversationResponses({
        language: 'en',
        ageGroup: 'child',
        conversationId: 'test_convo_child',
        messages: [{ speaker: 'other', text: 'Are you hungry?', time: Date.now() }],
        currentTopic: 'hunger',
        enableAI: false
      });

      const adultResult = await predictConversationResponses({
        language: 'en',
        ageGroup: 'adult',
        conversationId: 'test_convo_adult',
        messages: [{ speaker: 'other', text: 'Are you hungry?', time: Date.now() }],
        currentTopic: 'hunger',
        enableAI: false
      });

      const childFirst = childResult.responses[0].spokenText;
      const adultFirst = adultResult.responses[0].spokenText;

      expect(childFirst).toContain('hungry');
      expect(adultFirst).toContain('hungry');
      expect(childResult.responses.length).toBeLessThanOrEqual(5);
    });

    it('provides native script responses in Kannada', async () => {
      const result = await predictConversationResponses({
        language: 'kn',
        ageGroup: 'child',
        conversationId: 'test_convo_kn',
        messages: [{ speaker: 'other', text: 'ಹಸಿವಾಗಿದೆಯೇ?', time: Date.now() }],
        currentTopic: 'hunger',
        enableAI: false
      });

      expect(result.providerUsed).toBe('local_fallback');
      expect(result.responses[0].spokenText).toMatch(/[\u0C80-\u0CFF]/);
      expect(result.responses[0].label).toMatch(/[\u0C80-\u0CFF]/);
    });

    it('provides native script responses in Hindi', async () => {
      const result = await predictConversationResponses({
        language: 'hi',
        ageGroup: 'student',
        conversationId: 'test_convo_hi',
        messages: [{ speaker: 'other', text: 'क्या आपको भूख लगी है?', time: Date.now() }],
        currentTopic: 'hunger',
        enableAI: false
      });

      expect(result.providerUsed).toBe('local_fallback');
      expect(result.responses[0].spokenText).toMatch(/[\u0900-\u097F]/);
      expect(result.responses[0].label).toMatch(/[\u0900-\u097F]/);
    });

    it('returns scripted scenario in Demo Mode', async () => {
      const result = await predictConversationResponses({
        language: 'en',
        ageGroup: 'child',
        conversationId: 'demo_convo',
        messages: [{ speaker: 'other', text: 'Are you hungry?', time: Date.now() }],
        currentTopic: 'hunger',
        demoMode: true
      });

      expect(result.providerUsed).toBe('demo_mode');
      expect(result.responses.length).toBeGreaterThanOrEqual(4);
      expect(result.responses[0].spokenText).toBe('Yes I am hungry.');
    });
  });

  describe('improveUserText natural expansion', () => {
    it('expands single words into courteous sentences for adult mode', async () => {
      const improved = await improveUserText('water', 'en', 'adult');
      expect(improved).toBe('I would like some water, please.');
    });

    it('expands single words into friendly sentences for child mode', async () => {
      const improved = await improveUserText('water', 'en', 'child');
      expect(improved).toBe('I want water!');
    });

    it('expands Kannada terms in native script', async () => {
      const improved = await improveUserText('ನೀರು', 'kn', 'child');
      expect(improved).toContain('ನೀರು');
      expect(improved).toMatch(/[\u0C80-\u0CFF]/);
    });

    it('expands Hindi terms in native script', async () => {
      const improved = await improveUserText('पानी', 'hi', 'child');
      expect(improved).toContain('पानी');
      expect(improved).toMatch(/[\u0900-\u097F]/);
    });
  });

  describe('Conversation thread persistence', () => {
    it('saves and retrieves conversation threads from IndexedDB', async () => {
      const thread: ConversationThread = {
        id: 'test_thread_101',
        title: 'Lunch dialog with partner',
        startedAt: 1727960000000,
        updatedAt: 1727960060000,
        language: 'en',
        userMode: 'adult',
        turns: [
          { speaker: 'other', text: 'Are you hungry?', timestamp: 1727960000000 },
          { speaker: 'user', text: 'Yes, I would like some food, please.', timestamp: 1727960010000, pictogramKeyword: 'food' }
        ]
      };

      await saveConversationThread(thread);

      const threads = await getConversationThreads();
      expect(threads.length).toBe(1);
      expect(threads[0].id).toBe('test_thread_101');
      expect(threads[0].turns.length).toBe(2);
      expect(threads[0].turns[1].speaker).toBe('user');

      // Delete thread
      await deleteConversationThread('test_thread_101');
      const remaining = await getConversationThreads();
      expect(remaining.length).toBe(0);
    });
  });
});
