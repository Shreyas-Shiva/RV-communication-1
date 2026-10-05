/**
 * COMMUNIQ Sentence Tray Service
 * Assembles tapped picture cards into natural grammatical sentences using the typed lexicon.
 */
import { CommunicationAsset } from '../data/assets';
import { getLexiconEntry } from '../data/lexicon/entries';
import { renderSentence, SupportedLanguage } from './sentenceRenderer';
import { validateSentence } from './sentenceValidator';
import { LanguageCode, UserMode } from '../translations/types';

export function buildSentenceFromTray(
  assets: CommunicationAsset[],
  language: LanguageCode,
  userMode: UserMode,
  tone: 'short' | 'polite' | 'casual' = 'polite',
  wording: 'neutral' | 'masculine' | 'feminine' = 'neutral'
): string {
  if (!assets || assets.length === 0) return '';

  const langKey: SupportedLanguage = language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en';

  // 1. Single card: render the natural primary sentence for this item type
  if (assets.length === 1) {
    const asset = assets[0];
    const entry = getLexiconEntry(asset.id);
    if (entry) {
      let defaultIntent = 'request';
      if (entry.type === 'feeling') defaultIntent = 'feel';
      else if (entry.type === 'response') defaultIntent = 'confirm';
      else if (entry.type === 'place') defaultIntent = 'go';
      else if (entry.type === 'symptom' || entry.type === 'body_part') defaultIntent = 'symptom_hurts';
      else if (entry.type === 'action') defaultIntent = 'action_want';
      else if (entry.type === 'person') defaultIntent = 'person_talk';

      const candidate = renderSentence({
        entry,
        intentId: defaultIntent,
        language: langKey,
        ageGroup: userMode,
        tone,
        wording
      }).text;
      const validation = validateSentence(candidate, langKey, userMode);
      if (validation.valid) return candidate;
    }
    return asset.labels[langKey] || asset.labels.en;
  }

  // 2. Multiple cards: detect subject, action/modality, and object
  const entries = assets.map(a => ({ asset: a, entry: getLexiconEntry(a.id) }));

  const hasNo = entries.some(e => e.asset.id === 'no_card' || e.asset.id === 'stop_sign');
  const hasYes = entries.some(e => e.asset.id === 'yes_card');
  const hasPlace = entries.find(e => e.entry?.type === 'place');
  const substantiveItem = entries.find(e => e.entry && !['response'].includes(e.entry.type) && !['want_card', 'more_card', 'stop_sign'].includes(e.asset.id));

  if (substantiveItem?.entry) {
    let intentId = 'request';
    if (hasNo) {
      intentId = substantiveItem.entry.type === 'food' || substantiveItem.entry.type === 'drink' ? 'dislike' : 'no_more';
    } else if (hasYes) {
      intentId = substantiveItem.entry.type === 'food' || substantiveItem.entry.type === 'drink' ? 'like' : 'request';
    } else if (hasPlace) {
      intentId = 'go';
    } else if (substantiveItem.entry.type === 'feeling') {
      intentId = hasNo ? 'feel_not' : 'feel';
    }

    const candidate = renderSentence({
      entry: substantiveItem.entry,
      intentId,
      language: langKey,
      ageGroup: userMode,
      tone,
      wording
    }).text;
    const validation = validateSentence(candidate, langKey, userMode);
    if (validation.valid) return candidate;
  }

  // Fallback: grammatical conjunction of labels
  const labels = assets.map(a => a.labels[langKey] || a.labels.en);
  if (language === 'kn') {
    if (labels.length === 2) return `${labels[0]} ಮತ್ತು ${labels[1]} ಬೇಕು.`;
    return `${labels.join(', ')} ಬೇಕು.`;
  }
  if (language === 'hi') {
    if (labels.length === 2) return `मुझे ${labels[0]} और ${labels[1]} चाहिए।`;
    return `मुझे ${labels.join(', ')} चाहिए।`;
  }

  if (userMode === 'child') {
    return `I want ${labels.join(' and ')}!`;
  }
  return `I would like ${labels.join(' and ')}, please.`;
}
