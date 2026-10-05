import { SemanticType } from './lexicon/types';

export type WordClass =
  | 'pronoun'
  | 'verb'
  | 'descriptor'
  | 'noun'
  | 'social'
  | 'question'
  | 'place_time'
  | 'function'
  | 'emergency'
  | 'folder';

export interface ColorDefinition {
  fill: string;
  border: string;
  text: string;
  label: string;
}

export const WORD_TYPE_PALETTE: Record<WordClass, ColorDefinition> = {
  pronoun: {
    fill: '#FFF1B8',
    border: '#C99A00',
    text: '#4D3A00',
    label: 'Pronoun'
  },
  verb: {
    fill: '#D3F0CB',
    border: '#3F8F32',
    text: '#1B4A15',
    label: 'Verb'
  },
  descriptor: {
    fill: '#D3E8FA',
    border: '#2F78BD',
    text: '#12395E',
    label: 'Descriptor'
  },
  noun: {
    fill: '#FFE0C2',
    border: '#D9731A',
    text: '#592700',
    label: 'Noun'
  },
  social: {
    fill: '#FFD9E0',
    border: '#C23B5E',
    text: '#5E1225',
    label: 'Social & Response'
  },
  question: {
    fill: '#CFEFEF',
    border: '#0A6C6E',
    text: '#063D3E',
    label: 'Question'
  },
  place_time: {
    fill: '#EFE6CF',
    border: '#8F7A3E',
    text: '#3D3315',
    label: 'Place & Time'
  },
  function: {
    fill: '#E9E9E9',
    border: '#777777',
    text: '#222222',
    label: 'Function'
  },
  emergency: {
    fill: '#FFE5E5',
    border: '#D62828',
    text: '#7A0C0C',
    label: 'Emergency'
  },
  folder: {
    fill: '#F7EEDD',
    border: '#C79A42',
    text: '#4A3305',
    label: 'Folder'
  }
};

/**
 * Maps any SemanticType from the lexicon to its exact WordClass.
 */
export function mapSemanticTypeToWordClass(type: SemanticType | string): WordClass {
  switch (type) {
    case 'pronoun':
      return 'pronoun';

    case 'action':
      return 'verb';

    case 'feeling':
    case 'weather':
    case 'descriptor':
      return 'descriptor';

    case 'food':
    case 'drink':
    case 'object':
    case 'person':
    case 'body_part':
    case 'symptom':
    case 'school_item':
    case 'toy':
    case 'vehicle':
    case 'animal':
    case 'clothing':
      return 'noun';

    case 'response':
    case 'greeting':
    case 'social':
      return 'social';

    case 'question':
      return 'question';

    case 'place':
    case 'time':
      return 'place_time';

    case 'function':
    case 'conjunction':
    case 'preposition':
      return 'function';

    case 'emergency':
      return 'emergency';

    case 'folder':
      return 'folder';

    default:
      return 'noun';
  }
}

export function getColorForSemanticType(type: SemanticType | string): ColorDefinition {
  const wordClass = mapSemanticTypeToWordClass(type);
  return WORD_TYPE_PALETTE[wordClass];
}
