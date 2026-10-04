import { useState, useEffect, useRef, useCallback } from 'react';
import { LanguageCode } from '../translations';

export type SpeechRecognitionState = 'idle' | 'listening' | 'understanding' | 'error';

interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  state: SpeechRecognitionState;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: (langCode?: LanguageCode) => void;
  stopListening: () => void;
  clearTranscript: () => void;
}

export function useSpeechRecognition(onFinalResult?: (finalText: string) => void): UseSpeechRecognitionReturn {
  const [isSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );
  });
  const [state, setState] = useState<SpeechRecognitionState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const onFinalResultRef = useRef(onFinalResult);

  useEffect(() => {
    onFinalResultRef.current = onFinalResult;
  }, [onFinalResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition may already be stopped
      }
    }
    setState('idle');
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    setState('idle');
  }, []);

  const startListening = useCallback((langCode: LanguageCode = 'en') => {
    setError(null);
    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: new () => unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setError('Speech recognition is not supported in this browser. Please type partner text.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition: any = new (SpeechRecognitionClass as any)();
      recognition.continuous = false;
      recognition.interimResults = true;

      // Map language code to BCP 47 locale
      let locale = 'en-IN';
      if (langCode === 'kn') locale = 'kn-IN';
      if (langCode === 'hi') locale = 'hi-IN';
      recognition.lang = locale;

      recognition.onstart = () => {
        setState('listening');
        setError(null);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            final += res[0].transcript;
          } else {
            interim += res[0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
          setState('understanding');
        }

        if (final) {
          const cleanFinal = final.trim();
          setTranscript(cleanFinal);
          setInterimTranscript('');
          setState('idle');
          if (onFinalResultRef.current) {
            onFinalResultRef.current(cleanFinal);
          }
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        setState('error');
        if (event.error === 'not-allowed') {
          setError('Microphone access was denied. Please allow microphone permissions or type instead.');
        } else if (event.error === 'no-speech') {
          setError('No speech was detected. Please tap Listen and try speaking again.');
        } else {
          setError(`Speech recognition notice: ${event.error}. You can type responses instead.`);
        }
      };

      recognition.onend = () => {
        setState((current) => (current === 'listening' || current === 'understanding' ? 'idle' : current));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setState('error');
      setError('Could not start microphone listener. Please type instead.');
    }
  }, []);

  return {
    isSupported,
    state,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    clearTranscript
  };
}
