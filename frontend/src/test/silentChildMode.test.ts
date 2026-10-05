import { describe, it, expect, vi, beforeEach } from 'vitest';
import { soundService } from '../services/sound';

describe('Part 5: Silent Child Mode Audio Rule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('never instantiates AudioContext or plays sound on tap or rewards', () => {
    const audioContextSpy = vi.fn();
    const audioSpy = vi.fn();

    // Mock AudioContext and Audio
    (window as any).AudioContext = audioContextSpy;
    (window as any).Audio = audioSpy;

    // Simulate card tap
    soundService.playTap();
    expect(audioContextSpy).not.toHaveBeenCalled();
    expect(audioSpy).not.toHaveBeenCalled();

    // Simulate celebration/reward
    soundService.playCelebration();
    expect(audioContextSpy).not.toHaveBeenCalled();
    expect(audioSpy).not.toHaveBeenCalled();
  });

  it('only allows audio when Get attention chime is deliberately invoked', () => {
    let contextCreated = false;
    class MockAudioContext {
      currentTime = 0;
      destination = {};
      createOscillator() {
        return {
          type: 'sine',
          frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn()
        };
      }
      createGain() {
        return {
          gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
          connect: vi.fn()
        };
      }
      resume() {
        return Promise.resolve();
      }
    }

    (window as any).AudioContext = vi.fn().mockImplementation(function (this: any) {
      contextCreated = true;
      return new MockAudioContext();
    });

    // Tap must not create context
    soundService.playTap();
    expect(contextCreated).toBe(false);

    // Attention chime will create audio
    soundService.playAttentionChime();
    expect(contextCreated).toBe(true);
  });
});
