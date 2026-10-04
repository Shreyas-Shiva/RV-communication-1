import { describe, it, expect } from 'vitest';
import { buildSentence } from '../data/templates';

describe('Sentence Templates Generation', () => {
  describe('Kannada (kn) Sentence Templates', () => {
    it('generates exact child pizza hungry sentence in Kannada', () => {
      const res = buildSentence('pizza', 'hungry', 'kn', 'child');
      expect(res.text).toBe('ನನಗೆ ಹಸಿವಾಗಿದೆ. ನನಗೆ ಪಿಜ್ಜಾ ಬೇಕು.');
      expect(res.reviewed).toBe(true);
    });

    it('generates exact adult pizza hungry sentence in Kannada', () => {
      const res = buildSentence('pizza', 'hungry', 'kn', 'adult');
      expect(res.text).toBe('ನನಗೆ ಹಸಿವಾಗಿದೆ. ದಯವಿಟ್ಟು ನನಗೆ ಪಿಜ್ಜಾ ಕೊಡುತ್ತೀರಾ?');
      expect(res.reviewed).toBe(true);
    });

    it('generates child water want sentence in Kannada', () => {
      const res = buildSentence('water', 'want', 'kn', 'child');
      expect(res.text).toBe('ನನಗೆ ನೀರು ಬೇಕು.');
    });

    it('generates adult water want sentence in Kannada', () => {
      const res = buildSentence('water', 'want', 'kn', 'adult');
      expect(res.text).toBe('ದಯವಿಟ್ಟು ನನಗೆ ನೀರು ಕೊಡುತ್ತೀರಾ?');
    });

    it('generates student mode sentences in Kannada', () => {
      const res = buildSentence('pizza', 'hungry', 'kn', 'student');
      expect(res.text).toBe('ನನಗೆ ಹಸಿವಾಗಿದೆ, ಪಿಜ್ಜಾ ತಿನ್ನಲು ಬಯಸುತ್ತೇನೆ.');
    });
  });

  describe('English (en) Sentence Templates', () => {
    it('generates child pizza hungry sentence in English', () => {
      const res = buildSentence('pizza', 'hungry', 'en', 'child');
      expect(res.text).toBe('I am hungry. I want pizza.');
    });

    it('generates adult pizza hungry sentence in English', () => {
      const res = buildSentence('pizza', 'hungry', 'en', 'adult');
      expect(res.text).toBe('I am hungry. Could I please have some pizza?');
    });

    it('generates adult pizza polite want sentence in English', () => {
      const res = buildSentence('pizza', 'want', 'en', 'adult');
      expect(res.text).toBe('I would like some pizza, please.');
    });

    it('generates student pizza hungry sentence in English', () => {
      const res = buildSentence('pizza', 'hungry', 'en', 'student');
      expect(res.text).toBe('I am hungry, I would like pizza.');
    });
  });

  describe('Hindi (hi) Sentence Templates', () => {
    it('generates child pizza hungry sentence in Hindi', () => {
      const res = buildSentence('pizza', 'hungry', 'hi', 'child');
      expect(res.text).toBe('मुझे भूख लगी है। मुझे पिज़्ज़ा चाहिए।');
    });

    it('generates adult pizza hungry sentence in Hindi', () => {
      const res = buildSentence('pizza', 'hungry', 'hi', 'adult');
      expect(res.text).toBe('मुझे भूख लगी है। क्या मुझे थोड़ा पिज़्ज़ा मिल सकता है?');
    });

    it('generates child water want sentence in Hindi', () => {
      const res = buildSentence('water', 'want', 'hi', 'child');
      expect(res.text).toBe('मुझे पानी चाहिए।');
    });

    it('generates adult water polite want sentence in Hindi', () => {
      const res = buildSentence('water', 'want', 'hi', 'adult');
      expect(res.text).toBe('कृपया मुझे पानी दीजिए।');
    });
  });
});
