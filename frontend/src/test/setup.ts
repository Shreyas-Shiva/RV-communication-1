import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// Web Speech API mock for JSDOM test suite
if (typeof window !== 'undefined') {
  class MockSpeechSynthesisUtterance {
    text: string;
    lang: string = 'en-IN';
    rate: number = 1.0;
    pitch: number = 1.0;
    voice: SpeechSynthesisVoice | null = null;
    onstart: (() => void) | null = null;
    onend: (() => void) | null = null;
    onerror: ((err: any) => void) | null = null;

    constructor(text: string = '') {
      this.text = text;
    }
  }

  const mockVoices: SpeechSynthesisVoice[] = [
    { default: true, lang: 'en-IN', localService: true, name: 'Google English India', voiceURI: 'en-in-google' },
    { default: false, lang: 'kn-IN', localService: true, name: 'Kannada India Voice', voiceURI: 'kn-in-google' },
    { default: false, lang: 'hi-IN', localService: true, name: 'Hindi India Voice', voiceURI: 'hi-in-google' },
  ];

  const mockSpeechSynthesis = {
    speaking: false,
    paused: false,
    pending: false,
    onvoiceschanged: null,
    speak: vi.fn((utterance: MockSpeechSynthesisUtterance) => {
      mockSpeechSynthesis.speaking = true;
      if (utterance.onstart) utterance.onstart();
      setTimeout(() => {
        mockSpeechSynthesis.speaking = false;
        if (utterance.onend) utterance.onend();
      }, 50);
    }),
    cancel: vi.fn(() => {
      mockSpeechSynthesis.speaking = false;
    }),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => mockVoices),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    writable: true,
    value: MockSpeechSynthesisUtterance,
  });

  Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    value: mockSpeechSynthesis,
  });

  // Mock AudioContext for gentle sound chimes
  class MockAudioContext {
    currentTime = 0;
    state = 'running';
    createOscillator() {
      return {
        type: 'sine',
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
    }
    createGain() {
      return {
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      };
    }
    destination = {};
    close = vi.fn();
  }

  Object.defineProperty(window, 'AudioContext', {
    writable: true,
    value: MockAudioContext,
  });
  Object.defineProperty(window, 'webkitAudioContext', {
    writable: true,
    value: MockAudioContext,
  });
}
