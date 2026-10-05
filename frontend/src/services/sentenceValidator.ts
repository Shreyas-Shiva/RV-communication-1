import { SupportedLanguage, UserAgeGroup } from './sentenceRenderer';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

const BANNED_PATTERNS: RegExp[] = [
  /\blike\s+yes\b/i,
  /\blike\s+no\b/i,
  /\bcare\s+for\s+yes\b/i,
  /\bcare\s+for\s+no\b/i,
  /\bwant\s+yes\b/i,
  /\bwant\s+no\b/i,
  /\blike\s+happy\b/i,
  /\bcare\s+for\s+happy\b/i,
  /\benjoy\s+happy\b/i,
  /\bwant\s+happy\b/i,
  /\blike\s+sad\b/i,
  /\bcare\s+for\s+sad\b/i,
  /\bwant\s+sad\b/i,
  /\blike\s+angry\b/i,
  /\blike\s+calm\b/i,
  /\blike\s+scared\b/i,
  /ಇಷ್ಟ\s+ಹೌದು/,
  /ಇಷ್ಟವಿಲ್ಲ\s+ಹೌದು/,
  /ಬೇಕು\s+ಹೌದು/,
  /ಇಷ್ಟ\s+ಇಲ್ಲ/,
  /ಇಷ್ಟ\s+ಖುಷಿ/,
  /ಇಷ್ಟವಾಗುವುದಿಲ್ಲ\s+ಖುಷಿ/,
  /ಇಷ್ಟವಾಗುವುದಿಲ್ಲ\s+ಸಂತೋಷ/,
  /ಇಷ್ಟ\s+ಸಂತೋಷ/,
  /ಪಸಂದ್\s+ಹೌದು/,
  /पसंद\s+हाँ/i,
  /पसंद\s+नहीं\s+है\s+हाँ/i,
  /चाहिए\s+हाँ/i,
  /पसंद\s+खुश/i,
  /पसंद\s+नहीं\s+है\s+खुश/i
];

const INTERNAL_ID_PATTERN = /\b[a-z]+_[a-z0-9_]+\b/;

export function validateSentence(
  text: string,
  language: SupportedLanguage,
  ageGroup: UserAgeGroup
): ValidationResult {
  if (!text || !text.trim()) {
    return { valid: false, reason: 'Empty text' };
  }

  const trimmed = text.trim();

  // 1. Unfilled slots
  if (/\{|\}|\[|\]|<|>|\bundefined\b|\bnull\b|\bNaN\b/i.test(trimmed)) {
    return { valid: false, reason: 'Contains template markers or undefined values' };
  }

  // 2. Internal IDs leaked
  if (INTERNAL_ID_PATTERN.test(trimmed)) {
    return { valid: false, reason: 'Contains leaked internal identifier' };
  }

  // 3. Script validation
  if (language === 'en') {
    // Should not contain Indic scripts
    if (/[\u0900-\u0D7F]/.test(trimmed)) {
      return { valid: false, reason: 'English sentence contains non-Latin scripts' };
    }
  } else if (language === 'kn') {
    // Should not contain English alphabet or Devanagari
    if (/[a-zA-Z]/.test(trimmed)) {
      return { valid: false, reason: 'Kannada sentence contains Latin characters' };
    }
    if (/[\u0900-\u097F]/.test(trimmed)) {
      return { valid: false, reason: 'Kannada sentence contains Devanagari script' };
    }
  } else if (language === 'hi') {
    // Should not contain English alphabet or Kannada
    if (/[a-zA-Z]/.test(trimmed)) {
      return { valid: false, reason: 'Hindi sentence contains Latin characters' };
    }
    if (/[\u0C80-\u0CFF]/.test(trimmed)) {
      return { valid: false, reason: 'Hindi sentence contains Kannada script' };
    }
  }

  // 4. Age-appropriate length for child (8 words or fewer)
  if (ageGroup === 'child') {
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    if (wordCount > 8) {
      return { valid: false, reason: `Child sentence too long (${wordCount} words > 8 max)` };
    }
  }

  // 5. Banned patterns
  for (const banned of BANNED_PATTERNS) {
    if (banned.test(trimmed)) {
      return { valid: false, reason: `Matches banned nonsensical pattern: ${banned}` };
    }
  }

  return { valid: true };
}
