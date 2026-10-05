/* oxlint-disable react/set-state-in-effect */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import {
  BoardCardItem,
  getRootBoardGrid,
  getFolderBoardGrid,
  CATEGORY_FOLDERS,
  searchBoard
} from '../data/coreBoard';
import { CommunicationAsset, COMMUNICATION_ASSETS } from '../data/assets';
import { getLexiconEntry } from '../data/lexicon/entries';
import { getIntentsForType } from '../data/intentMatrix';
import { renderSentence } from '../services/sentenceRenderer';
import { buildSentenceFromTray } from '../services/sentenceTray';
import { fetchSentenceOptions, SentenceOption } from '../services/ai';
import { Card } from '../components/Card';
import { Pictogram } from '../components/Pictogram';
import { SentenceStrip, StripToken } from '../components/SentenceStrip';
import { RightRail } from '../components/RightRail';
import { soundService } from '../services/sound';
import { Search, ChevronRight, Wand2, X } from 'lucide-react';

interface CommunicatePageProps {
  initialCategoryId?: string;
  initialAssetId?: string;
}

export const CommunicatePage: React.FC<CommunicatePageProps> = ({
  initialCategoryId,
  initialAssetId
}) => {
  const {
    language,
    userMode,
    speak,
    isSpeaking,
    preferences,
    t
  } = useCommuniq();

  // Navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(() => {
    if (initialCategoryId && initialCategoryId !== 'all' && CATEGORY_FOLDERS[initialCategoryId]) {
      return initialCategoryId;
    }
    return null;
  });

  // Sentence strip tokens
  const [stripTokens, setStripTokens] = useState<StripToken[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected item for "You could say" natural sentence generator
  const [selectedItem, setSelectedItem] = useState<BoardCardItem | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<SentenceOption[]>([]);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  // Helper to extract localized text
  const getItemLabel = useCallback((item: BoardCardItem) => {
    const langKey = language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en';
    return item.labels[langKey] || item.labels.en;
  }, [language]);

  const getItemSpokenText = useCallback((item: BoardCardItem) => {
    const langKey = language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en';
    return item.spokenText[langKey] || item.spokenText.en;
  }, [language]);

  // Handle Card Tap
  const handleCardTap = useCallback((item: BoardCardItem) => {
    if (item.type === 'folder' && item.folderId) {
      setCurrentFolderId(item.folderId);
      setSearchQuery('');
      return;
    }

    const label = getItemLabel(item);
    const spoken = getItemSpokenText(item);

    // 1. Speak immediately if setting is on
    if (preferences.speakOnTap) {
      speak(spoken, { category: item.wordClass, assetId: item.id });
    }

    // 2. Add token to sentence strip (max 8 tokens)
    setStripTokens(prev => {
      if (prev.length >= 8) return prev;
      return [
        ...prev,
        {
          id: item.id,
          label,
          svgIcon: item.svgIcon,
          wordClass: item.wordClass,
          alt: item.alt
        }
      ];
    });

    // 3. Set selected item for "You could say" recommendations
    setSelectedItem(item);
  }, [getItemLabel, getItemSpokenText, preferences.speakOnTap, speak]);

  // Initial category & asset handling if specified
  useEffect(() => {
    if (initialCategoryId && initialCategoryId !== 'all') {
      const folderKey = initialCategoryId === 'food_drink' ? 'food' : initialCategoryId === 'playing' ? 'play' : initialCategoryId === 'health' ? 'body_health' : initialCategoryId;
      if (CATEGORY_FOLDERS[folderKey]) {
        setCurrentFolderId(folderKey);
      }
    }
  }, [initialCategoryId]);

  useEffect(() => {
    if (initialAssetId) {
      const asset = COMMUNICATION_ASSETS.find(a => a.id === initialAssetId);
      if (asset) {
        const item: BoardCardItem = {
          id: asset.id,
          type: 'word',
          wordClass: 'noun',
          labels: asset.labels,
          spokenText: asset.labels,
          svgIcon: asset.svgIcon,
          level: 1,
          adultSlot: 0,
          studentSlot: 0,
          childSlot: 0,
          alt: asset.alt
        };
        handleCardTap(item);
      }
    }
  }, [initialAssetId, handleCardTap]);

  // Strip Actions
  const handleDeleteLast = () => {
    setStripTokens(prev => prev.slice(0, -1));
  };

  const handleClearStrip = () => {
    setStripTokens([]);
    setSelectedItem(null);
    setAiSuggestions([]);
  };

  const handleSayIt = () => {
    if (stripTokens.length === 0) return;
    const fullText = stripTokens.map(t => t.label).join(' ');
    speak(fullText, { category: 'sentence_strip' });
  };

  const handleMakeSentence = () => {
    if (stripTokens.length === 0) return;

    // Convert tokens to communication assets for sentenceTray
    const fauxAssets: CommunicationAsset[] = stripTokens.map(tok => ({
      id: tok.id.replace('core_', '').replace('food_', '').replace('drink_', ''),
      categoryId: 'general',
      labels: { en: tok.label, kn: tok.label, hi: tok.label },
      alt: tok.label,
      svgIcon: tok.svgIcon,
      reviewed: true
    }));

    const naturalSentence = buildSentenceFromTray(
      fauxAssets,
      language,
      userMode,
      'polite',
      preferences.wordingForMe
    );

    speak(naturalSentence, { category: 'sentence_tray' });
  };

  // Right Rail Actions
  const handleGoBack = useCallback(() => {
    if (currentFolderId) {
      setCurrentFolderId(null);
      setSearchQuery('');
    }
  }, [currentFolderId]);

  const handleGoHome = () => {
    setCurrentFolderId(null);
    setSearchQuery('');
  };

  const handleGoCore = () => {
    setCurrentFolderId(null);
    setSearchQuery('');
  };

  const handleAttention = () => {
    soundService.playAttentionChime();
    const attentionPhrase =
      language === 'kn'
        ? 'ಕ್ಷಮಿಸಿ, ನಾನು ಏನೋ ಹೇಳಲು ಬಯಸುತ್ತೇನೆ.'
        : language === 'hi'
        ? 'क्षमा करें, मैं कुछ कहना चाहता हूँ।'
        : 'Excuse me, I want to say something.';
    speak(attentionPhrase, { category: 'attention' });
  };

  // Compute "You could say" sentences for selected item
  const instantOptions = useMemo(() => {
    if (!selectedItem || selectedItem.type === 'folder') return [];

    const assetId = selectedItem.id.replace('core_', '').replace('food_', '').replace('drink_', '');
    const entry = getLexiconEntry(assetId) || getLexiconEntry('pizza');
    if (!entry) return [];

    const intents = getIntentsForType(entry.type);
    const langKey = language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en';

    return intents.slice(0, 4).map(intent => {
      const result = renderSentence({
        entry,
        intentId: intent.id,
        language: langKey,
        ageGroup: userMode,
        tone: 'polite',
        wording: preferences.wordingForMe
      });
      return {
        text: result.text,
        color: intent.color,
        borderColor: intent.borderColor,
        textColor: intent.textColor
      };
    });
  }, [selectedItem, language, userMode, preferences.wordingForMe]);

  // Fetch AI options in background if AI enabled
  useEffect(() => {
    if (!selectedItem || !preferences.enableAI) {
      setAiSuggestions([]);
      return;
    }

    let cancelled = false;
    setLoadingAi(true);

    fetchSentenceOptions({
      assetId: selectedItem.id.replace('core_', ''),
      language,
      userMode,
      tone: 'polite'
    })
      .then(res => {
        if (!cancelled) {
          setAiSuggestions(res.slice(0, 3));
          setLoadingAi(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingAi(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedItem, preferences.enableAI, language, userMode]);

  // Compute Active Grid Cards
  const activeVocabLevel = preferences.vocabLevel || 3;
  const boardGrid = useMemo(() => {
    if (currentFolderId) {
      return getFolderBoardGrid(currentFolderId, userMode, activeVocabLevel);
    }
    return getRootBoardGrid(userMode, activeVocabLevel);
  }, [currentFolderId, userMode, activeVocabLevel]);

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchBoard(searchQuery, language);
  }, [searchQuery, language]);

  // Current folder name for breadcrumbs
  const currentFolder = currentFolderId ? CATEGORY_FOLDERS[currentFolderId] : null;
  const folderTitle = currentFolder
    ? currentFolder.labels[language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en'] || currentFolder.labels.en
    : '';

  // Desktop columns class
  const gridColumnsClass =
    userMode === 'child'
      ? 'grid-cols-4 sm:grid-cols-5'
      : userMode === 'student'
      ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6'
      : 'grid-cols-5 sm:grid-cols-6 md:grid-cols-8';

  // Keyboard Escape navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentFolderId !== null) {
        e.preventDefault();
        handleGoBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFolderId, handleGoBack]);

  return (
    <div className="h-[calc(100vh-48px)] max-h-[calc(100vh-48px)] overflow-hidden flex flex-col gap-1.5 p-1.5 sm:p-2 select-none max-w-7xl mx-auto w-full">
      {/* 1. Sentence Strip at top (72 to 88px tall) */}
      <SentenceStrip
        tokens={stripTokens}
        onDeleteLast={handleDeleteLast}
        onClear={handleClearStrip}
        onSayIt={handleSayIt}
        onMakeSentence={handleMakeSentence}
        isSpeaking={isSpeaking}
        userMode={userMode}
        mascotPose={selectedItem ? 'proud' : 'calm'}
        mascotPrompt={t.communicateInstruction || 'Tap pictures to make a sentence'}
      />

      {/* 2. "You could say" instant full natural sentence suggestions */}
      {instantOptions.length > 0 && (
        <div
          role="region"
          aria-label="Suggested natural sentences"
          className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[10px] p-2 flex flex-wrap items-center gap-1.5 shadow-xs"
        >
          <span className="text-[11px] font-black uppercase text-[#5E564D] mr-1 flex items-center gap-1">
            <Wand2 className="w-3.5 h-3.5 text-[#0A6C6E]" />
            You could say:
          </span>
          {instantOptions.map((opt, i) => (
            <button
              key={`instant-opt-${i}`}
              type="button"
              onClick={() => speak(opt.text, { category: 'suggested_sentence' })}
              style={{ backgroundColor: opt.color, borderColor: opt.borderColor, color: opt.textColor }}
              className="h-8 px-2.5 rounded-[8px] border-2 font-bold text-xs truncate max-w-[280px] hover:brightness-95 transition-transform active:scale-95 cursor-pointer"
            >
              {opt.text}
            </button>
          ))}
          {loadingAi && (
            <span className="text-xs text-[#5E564D] animate-pulse">Loading more ideas...</span>
          )}
          {aiSuggestions.map((aiOpt, i) => (
            <button
              key={`ai-opt-${i}`}
              type="button"
              onClick={() => speak(aiOpt.text, { category: 'ai_sentence' })}
              className="h-8 px-2.5 rounded-[8px] border border-[#0A6C6E] bg-[#E2F3F3] text-[#063D3E] font-bold text-xs hover:bg-[#D0EDED] cursor-pointer active:scale-95"
            >
              {aiOpt.text}
            </button>
          ))}
        </div>
      )}

      {/* 3. Sub-header: Breadcrumb (Home > Folder) & Search Bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs font-bold text-[#5E564D]">
          <button
            type="button"
            onClick={handleGoHome}
            className={`hover:text-[#0A6C6E] cursor-pointer ${!currentFolderId ? 'text-[#0A6C6E] font-black' : ''}`}
          >
            Home
          </button>
          {currentFolder && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-[#A89F95]" />
              <span className="text-[#1F1B16] font-black truncate max-w-[120px]">
                {folderTitle}
              </span>
            </>
          )}
        </nav>

        {/* Search Input */}
        <div className="relative w-48 sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words..."
            aria-label="Search words"
            className="w-full h-8 pl-7 pr-7 bg-white border-2 border-[#E5DACF] rounded-[8px] text-xs font-bold text-[#1F1B16] placeholder:text-[#8C827A] focus:border-[#0A6C6E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E]"
          />
          <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#8C827A] hover:text-[#1F1B16]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Main Body: Fixed Grid + Right Rail */}
      <div className="flex-1 min-h-0 flex items-stretch gap-2 w-full overflow-hidden">
        {/* Board Cards Grid */}
        <main
          role="region"
          aria-label={currentFolder ? `${folderTitle} board` : 'Core Communication Board'}
          className="flex-1 w-full min-w-0 h-full overflow-y-auto pr-1"
        >
          {searchQuery.trim() ? (
            /* Search Results Grid */
            <div>
              <p className="text-xs font-bold text-[#5E564D] mb-2">
                Found {searchResults.length} matching card{searchResults.length === 1 ? '' : 's'}
              </p>
              {searchResults.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-[12px] border-2 border-dashed border-[#E5DACF]">
                  <p className="text-xs font-bold text-[#5E564D]">
                    No words found for &quot;{searchQuery}&quot;. Try another term.
                  </p>
                </div>
              ) : (
                <div className={`grid ${gridColumnsClass} gap-2 sm:gap-2.5`}>
                  {searchResults.map((item) => (
                    <Card
                      key={`search-${item.id}`}
                      title={getItemLabel(item)}
                      image={<Pictogram name={item.svgIcon} alt={item.alt || getItemLabel(item)} size={userMode === 'child' ? 52 : 38} fallbackLabel={getItemLabel(item)} />}
                      wordClass={item.wordClass}
                      isFolder={item.type === 'folder'}
                      userMode={userMode}
                      density={preferences.screenDensity || 'compact'}
                      onClick={() => handleCardTap(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* FIXED MOTOR PLANNING GRID */
            <div className={`grid ${gridColumnsClass} gap-2 sm:gap-2.5`}>
              {boardGrid.map((item, slotIndex) => {
                if (!item) {
                  // Locked/blank slot to preserve exact coordinates
                  return (
                    <Card
                      key={`blank-slot-${slotIndex}`}
                      isEmptySlot
                      userMode={userMode}
                      density={preferences.screenDensity || 'compact'}
                    />
                  );
                }

                return (
                  <Card
                    key={`slot-${slotIndex}-${item.id}`}
                    title={getItemLabel(item)}
                    image={<Pictogram name={item.svgIcon} alt={item.alt || getItemLabel(item)} size={userMode === 'child' ? 52 : 38} fallbackLabel={getItemLabel(item)} />}
                    wordClass={item.wordClass}
                    isFolder={item.type === 'folder'}
                    userMode={userMode}
                    density={preferences.screenDensity || 'compact'}
                    isSelected={selectedItem?.id === item.id}
                    onClick={() => handleCardTap(item)}
                  />
                );
              })}
            </div>
          )}
        </main>

        {/* Right Rail (Desktop vertical rail & Phone bottom bar, hidden in child mode) */}
        {userMode !== 'child' && (
          <RightRail
            canGoBack={currentFolderId !== null}
            onGoBack={handleGoBack}
            onGoHome={handleGoHome}
            onGoCore={handleGoCore}
            onUndoLast={handleDeleteLast}
            onAttention={handleAttention}
          />
        )}
      </div>
    </div>
  );
};
