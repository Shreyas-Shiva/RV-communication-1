import React, { useState } from 'react';
import { X, Delete, Volume2, Send, LayoutGrid } from 'lucide-react';
import { Pictogram } from './Pictogram';
import { WordClass, WORD_TYPE_PALETTE } from '../data/palette';

interface DrawerToken {
  id: string;
  label: { en: string; kn: string; hi: string };
  svgIcon: string;
  wordClass: WordClass;
}

const QUICK_CORE_TOKENS: DrawerToken[] = [
  // People (Yellow)
  { id: 'tok_i', label: { en: 'I', kn: 'ನಾನು', hi: 'मैं' }, svgIcon: 'core_i', wordClass: 'pronoun' },
  { id: 'tok_you', label: { en: 'You', kn: 'ನೀವು', hi: 'आप' }, svgIcon: 'core_you', wordClass: 'pronoun' },
  { id: 'tok_we', label: { en: 'We', kn: 'ನಾವು', hi: 'हम' }, svgIcon: 'core_we', wordClass: 'pronoun' },

  // Verbs (Green)
  { id: 'tok_want', label: { en: 'Want', kn: 'ಬೇಕು', hi: 'चाहिए' }, svgIcon: 'core_want', wordClass: 'verb' },
  { id: 'tok_need', label: { en: 'Need', kn: 'ಅಗತ್ಯ', hi: 'ज़रूरत' }, svgIcon: 'core_help', wordClass: 'verb' },
  { id: 'tok_like', label: { en: 'Like', kn: 'ಇಷ್ಟ', hi: 'पसंद' }, svgIcon: 'core_like', wordClass: 'verb' },
  { id: 'tok_go', label: { en: 'Go', kn: 'ಹೋಗು', hi: 'जाना' }, svgIcon: 'core_go', wordClass: 'verb' },
  { id: 'tok_eat', label: { en: 'Eat', kn: 'ತಿನ್ನು', hi: 'खाना' }, svgIcon: 'core_eat', wordClass: 'verb' },
  { id: 'tok_stop', label: { en: 'Stop', kn: 'ನಿಲ್ಲಿಸು', hi: 'रुको' }, svgIcon: 'core_stop', wordClass: 'verb' },

  // Descriptors (Blue)
  { id: 'tok_more', label: { en: 'More', kn: 'ಇನ್ನಷ್ಟು', hi: 'और' }, svgIcon: 'core_more', wordClass: 'descriptor' },
  { id: 'tok_good', label: { en: 'Good', kn: 'ಒಳ್ಳೆಯದು', hi: 'अच्छा' }, svgIcon: 'core_good', wordClass: 'descriptor' },
  { id: 'tok_different', label: { en: 'Different', kn: 'ವಿಭಿನ್ನ', hi: 'अलग' }, svgIcon: 'core_different', wordClass: 'descriptor' },

  // Social & Core (Pink)
  { id: 'tok_yes', label: { en: 'Yes', kn: 'ಹೌದು', hi: 'हाँ' }, svgIcon: 'core_yes', wordClass: 'social' },
  { id: 'tok_no', label: { en: 'No', kn: 'ಇಲ್ಲ', hi: 'नहीं' }, svgIcon: 'core_no', wordClass: 'social' },
  { id: 'tok_please', label: { en: 'Please', kn: 'ದಯವಿಟ್ಟು', hi: 'कृपया' }, svgIcon: 'core_please', wordClass: 'social' },
  { id: 'tok_thanks', label: { en: 'Thank you', kn: 'ಧನ್ಯವಾದ', hi: 'धन्यवाद' }, svgIcon: 'core_thanks', wordClass: 'social' },
  { id: 'tok_help', label: { en: 'Help', kn: 'ಸಹಾಯ', hi: 'मदद' }, svgIcon: 'core_help', wordClass: 'social' },

  // Core Needs (Noun / Orange)
  { id: 'tok_water', label: { en: 'Water', kn: 'ನೀರು', hi: 'पानी' }, svgIcon: 'water', wordClass: 'noun' },
  { id: 'tok_food', label: { en: 'Food', kn: 'ಆಹಾರ', hi: 'खाना' }, svgIcon: 'food', wordClass: 'noun' },
  { id: 'tok_bathroom', label: { en: 'Bathroom', kn: 'ಶೌಚಾಲಯ', hi: 'शौचालय' }, svgIcon: 'core_bathroom', wordClass: 'noun' }
];

interface ComposerBoardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSendSentence: (sentence: string) => void;
  language: string;
}

export const ComposerBoardDrawer: React.FC<ComposerBoardDrawerProps> = ({
  isOpen,
  onClose,
  onSendSentence,
  language
}) => {
  const [selectedTokens, setSelectedTokens] = useState<DrawerToken[]>([]);

  if (!isOpen) return null;

  const langKey = language.startsWith('kn') ? 'kn' : language.startsWith('hi') ? 'hi' : 'en';

  const handleAddToken = (tok: DrawerToken) => {
    setSelectedTokens((prev) => [...prev, tok]);
  };

  const handleDeleteLast = () => {
    setSelectedTokens((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setSelectedTokens([]);
  };

  const handleSpeakAndSend = () => {
    if (selectedTokens.length === 0) return;
    const fullSentence = selectedTokens.map((t) => t.label[langKey] || t.label.en).join(' ');
    onSendSentence(fullSentence);
    setSelectedTokens([]);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quick AAC Board Drawer"
      className="fixed inset-x-0 bottom-0 z-40 bg-[#FFF8EF] border-t-2 border-[#E5DACF] shadow-2xl rounded-t-3xl max-w-4xl mx-auto p-3 sm:p-4 animate-slideUp select-none"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E5DACF]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0A6C6E] text-white flex items-center justify-center shadow-xs">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-[#1F1B16]">
            Quick AAC Board Drawer
          </h3>
          <span className="text-[11px] font-bold text-[#5E564D] hidden sm:inline">
            Tap cards to build a sentence
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close board drawer"
          className="p-1 rounded-lg text-[#7A7065] hover:text-[#1F1B16] hover:bg-[#EFE6DC] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mini Sentence Strip */}
      <div className="h-16 bg-white border-2 border-[#E5DACF] rounded-xl p-1.5 flex items-center justify-between gap-2 mb-3 shadow-xs">
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto min-w-0 h-full px-1">
          {selectedTokens.length === 0 ? (
            <span className="text-xs text-[#8C8278] italic font-semibold">
              Selected cards will appear here...
            </span>
          ) : (
            selectedTokens.map((tok, idx) => {
              const pal = WORD_TYPE_PALETTE[tok.wordClass];
              return (
                <div
                  key={`drawer-tok-${idx}-${tok.id}`}
                  style={{ backgroundColor: pal.fill, borderColor: pal.border }}
                  className="h-full px-2 py-0.5 rounded-lg border-2 flex flex-col items-center justify-center shrink-0"
                >
                  <Pictogram name={tok.svgIcon} alt={tok.label[langKey]} size={20} fallbackLabel={tok.label[langKey]} />
                  <span
                    style={{ color: pal.text }}
                    className="text-[10px] font-black leading-none mt-0.5"
                  >
                    {tok.label[langKey] || tok.label.en}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-[#E5DACF]">
          <button
            type="button"
            onClick={handleDeleteLast}
            disabled={selectedTokens.length === 0}
            aria-label="Delete last word"
            title="Delete last word"
            className="h-9 px-2 rounded-lg border border-[#E5DACF] bg-[#FFF8EF] text-[#5E564D] hover:text-[#1F1B16] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center cursor-pointer"
          >
            <Delete className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={selectedTokens.length === 0}
            aria-label="Clear sentence"
            title="Clear sentence"
            className="h-9 px-2 rounded-lg border border-[#E5DACF] bg-white text-[#5E564D] hover:text-[#D62828] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleSpeakAndSend}
            disabled={selectedTokens.length === 0}
            aria-label="Speak and Send"
            className="h-9 px-3 rounded-lg border-2 border-[#D97706] bg-[#FFB703] hover:bg-[#F59E0B] text-[#1F1B16] font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-35 disabled:pointer-events-none shadow-xs"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <Send className="w-3 h-3 ml-0.5" />
            <span>Send & Speak</span>
          </button>
        </div>
      </div>

      {/* Cards Palette Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2 max-h-48 overflow-y-auto pr-0.5">
        {QUICK_CORE_TOKENS.map((tok) => {
          const pal = WORD_TYPE_PALETTE[tok.wordClass];
          const text = tok.label[langKey] || tok.label.en;

          return (
            <button
              key={tok.id}
              type="button"
              aria-label={text}
              onClick={() => handleAddToken(tok)}
              style={{ backgroundColor: pal.fill, borderColor: pal.border }}
              className="h-14 sm:h-16 p-1 rounded-xl border-2 flex flex-col items-center justify-center transition-transform hover:scale-102 active:scale-95 cursor-pointer shadow-2xs"
            >
              <div className="w-6 h-6 flex items-center justify-center pointer-events-none">
                <Pictogram name={tok.svgIcon} alt={text} size={22} fallbackLabel={text} />
              </div>
              <span
                style={{ color: pal.text }}
                className="text-[11px] font-black truncate max-w-full leading-tight mt-0.5"
              >
                {text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
