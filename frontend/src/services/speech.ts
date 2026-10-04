import { LanguageCode } from '../translations/types';

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  voiceURI?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

const LOCALE_MAP: Record<LanguageCode, string[]> = {
  en: ['en-IN', 'en-GB', 'en-US', 'en'],
  kn: ['kn-IN', 'kn'],
  hi: ['hi-IN', 'hi'],
  ta: ['ta-IN', 'ta'],
  te: ['te-IN', 'te'],
  ml: ['ml-IN', 'ml']
};

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeakingState: boolean = false;
  private activeListeners: Set<(isSpeaking: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices(): void {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.loadVoices();
    }
    return this.voices;
  }

  public isVoiceAvailable(lang: LanguageCode): boolean {
    const voices = this.getVoices();
    if (voices.length === 0) {
      // In environments where voices list is initially empty or unavailable
      return true;
    }
    const targetLocales = LOCALE_MAP[lang] || ['en-IN'];
    return voices.some(v => targetLocales.some(loc => v.lang.toLowerCase().startsWith(loc.toLowerCase())));
  }

  public getVoiceForLanguage(lang: LanguageCode, preferredVoiceURI?: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (voices.length === 0) return null;

    if (preferredVoiceURI) {
      const match = voices.find(v => v.voiceURI === preferredVoiceURI);
      if (match) return match;
    }

    const targetLocales = LOCALE_MAP[lang] || ['en-IN'];
    for (const locale of targetLocales) {
      const match = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(locale.toLowerCase()));
      if (match) return match;
    }

    // Default voice fallback
    return voices[0] || null;
  }

  public speak(text: string, lang: LanguageCode, options: SpeechOptions = {}): boolean {
    if (!this.synth || !text.trim()) {
      return false;
    }

    // Cancel any ongoing utterance before speaking new phrase
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLocale = (LOCALE_MAP[lang] && LOCALE_MAP[lang][0]) || 'en-IN';
    utterance.lang = targetLocale;
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;

    const matchedVoice = this.getVoiceForLanguage(lang, options.voiceURI);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      this.setSpeaking(true);
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.setSpeaking(false);
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (event) => {
      this.setSpeaking(false);
      if (options.onError) options.onError(event);
    };

    this.synth.speak(utterance);
    return true;
  }

  public cancel(): void {
    if (this.synth) {
      this.synth.cancel();
      this.setSpeaking(false);
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public subscribeSpeaking(listener: (isSpeaking: boolean) => void): () => void {
    this.activeListeners.add(listener);
    return () => this.activeListeners.delete(listener);
  }

  private setSpeaking(value: boolean): void {
    this.isSpeakingState = value;
    this.activeListeners.forEach(listener => listener(value));
  }
}

export const speechService = new SpeechService();
