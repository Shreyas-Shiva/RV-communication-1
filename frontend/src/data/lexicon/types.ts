export type WordType =
  | 'food'
  | 'drink'
  | 'object'
  | 'place'
  | 'person'
  | 'feeling'
  | 'body_part'
  | 'symptom'
  | 'action'
  | 'response'
  | 'time'
  | 'school_item'
  | 'toy'
  | 'vehicle'
  | 'animal'
  | 'clothing'
  | 'weather';

export type SemanticType = WordType;

export interface EnglishForms {
  singular: string;
  plural: string;
  countability: 'countable' | 'mass';
  articleRule: 'a' | 'an' | 'some' | 'the' | 'none' | 'my';
  verbForms?: {
    base: string;
    ing: string;
  };
}

export type HindiGender = 'm' | 'f';
export type HindiSpeakerWording = 'neutral' | 'masculine' | 'feminine';

export interface HindiForms {
  gender: HindiGender;
  number: 'sg' | 'pl';
  base: string;
  oblique?: string;
  adjective?: {
    neutral: string;
    masculine: string;
    feminine: string;
  };
}

export interface KannadaForms {
  base: string;
  dative: string;     // e.g. ಪಿಜ್ಜಾಕ್ಕೆ, ನೀರಿಗೆ, ಮನೆಗೆ, ಶಾಲೆಗೆ, ವೈದ್ಯರಿಗೆ
  accusative: string; // e.g. ಪಿಜ್ಜಾವನ್ನು, ನೀರನ್ನು, ಮನೆಯನ್ನು, ಶಾಲೆಯನ್ನು, ವೈದ್ಯರನ್ನು
  locative: string;   // e.g. ಮನೆಯಲ್ಲಿ, ಶಾಲೆಯಲ್ಲಿ, ನೀರಿನಲ್ಲಿ
  sandhi?: string;
}

export interface LexiconEntry {
  id: string;
  type: WordType;
  english: EnglishForms;
  hindi: HindiForms;
  kannada: KannadaForms;
  reviewed: boolean; // false until reviewed by a qualified native speaker
}
