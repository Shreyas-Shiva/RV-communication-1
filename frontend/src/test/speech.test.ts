import { describe, it, expect, vi, beforeEach } from 'vitest';
import { speechService } from '../services/speech';

describe('Web Speech Synthesis Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('triggers speech synthesis on demand', () => {
    const success = speechService.speak('Hello friend', 'en');
    expect(success).toBe(true);
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it('correctly maps Kannada to kn-IN locale', () => {
    speechService.speak('ನನಗೆ ನೀರು ಬೇಕು', 'kn');
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    const calls = (window.speechSynthesis.speak as any).mock.calls;
    const utterance = calls[calls.length - 1][0];
    expect(utterance.lang).toBe('kn-IN');
  });

  it('correctly maps Hindi to hi-IN locale', () => {
    speechService.speak('मुझे पानी चाहिए', 'hi');
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    const calls = (window.speechSynthesis.speak as any).mock.calls;
    const utterance = calls[calls.length - 1][0];
    expect(utterance.lang).toBe('hi-IN');
  });

  it('cancels active speech when requested', () => {
    speechService.cancel();
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });
});
