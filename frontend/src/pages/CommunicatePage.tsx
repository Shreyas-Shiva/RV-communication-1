import React, { useState, useEffect, useCallback } from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import { CATEGORIES, Category } from '../data/categories';
import { COMMUNICATION_ASSETS, CommunicationAsset, getAssetsByCategory, getAssetById } from '../data/assets';
import { INTENT_LIST, IntentItem, buildSentence } from '../data/templates';
import { Card } from '../components/Card';
import { Pictogram } from '../components/Pictogram';
import { Button } from '../components/Button';
import { SpeakIndicator } from '../components/SpeakIndicator';
import { MascotView } from '../components/MascotView';
import { DrawingCanvas } from '../components/DrawingCanvas';
import { SignRecognizer } from '../components/SignRecognizer';
import { ArrowLeft, Send, Sparkles, Check, Search, Keyboard, PenTool, Hand, Layers } from 'lucide-react';

interface CommunicatePageProps {
  initialCategoryId?: string;
  initialAssetId?: string;
}

export const CommunicatePage: React.FC<CommunicatePageProps> = ({
  initialCategoryId = 'food_drink',
  initialAssetId
}) => {
  const {
    language,
    userMode,
    speak,
    activeSpokenText,
    isSpeaking,
    replaySpokenText,
    stopSpeaking,
    requestEmergencyConfirm,
    preferences,
    t
  } = useCommuniq();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId);
  const [selectedAsset, setSelectedAsset] = useState<CommunicationAsset | null>(() => {
    return initialAssetId ? getAssetById(initialAssetId) || null : null;
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typedText, setTypedText] = useState<string>('');
  const [somethingElseMode, setSomethingElseMode] = useState<'type' | 'draw' | 'sign' | 'all' | null>(null);
  const [adultSentenceConfirmed, setAdultSentenceConfirmed] = useState<boolean>(false);

  const getAssetLabel = useCallback((asset: CommunicationAsset) => {
    return asset.labels[language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en'] || asset.labels.en;
  }, [language]);

  const handleCardTap = useCallback((asset: CommunicationAsset) => {
    const label = getAssetLabel(asset);

    if (asset.requiresConfirmation) {
      requestEmergencyConfirm(label, () => {
        speak(label, { category: asset.categoryId, assetId: asset.id });
        setSelectedAsset(asset);
        setAdultSentenceConfirmed(false);
      });
    } else {
      speak(label, { category: asset.categoryId, assetId: asset.id });
      setSelectedAsset(asset);
      setAdultSentenceConfirmed(false);
    }
  }, [getAssetLabel, requestEmergencyConfirm, speak]);

  // Pronounce initial asset if navigated directly with assetId
  useEffect(() => {
    if (initialAssetId) {
      const asset = getAssetById(initialAssetId);
      if (asset) {
        const label = asset.labels[language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en'] || asset.labels.en;
        speak(label, { category: asset.categoryId, assetId: asset.id });
      }
    }
  }, [initialAssetId, language, speak]);

  // Filter categories according to user mode
  const visibleCategories = CATEGORIES.filter(c => c.forModes.includes(userMode));
  const currentCategory = CATEGORIES.find(c => c.id === selectedCategoryId) || visibleCategories[0];

  // Filter assets
  const categoryAssets = getAssetsByCategory(selectedCategoryId);
  const filteredAssets = searchQuery.trim()
    ? COMMUNICATION_ASSETS.filter(a => {
        const q = searchQuery.toLowerCase();
        return (
          a.labels.en.toLowerCase().includes(q) ||
          a.labels.kn.toLowerCase().includes(q) ||
          a.labels.hi.toLowerCase().includes(q) ||
          a.alt.toLowerCase().includes(q)
        );
      })
    : categoryAssets;

  // Max 6 cards per screen for child mode
  const displayedAssets = userMode === 'child' ? filteredAssets.slice(0, 6) : filteredAssets;

  const getIntentLabel = (intent: IntentItem) => {
    return intent.labels[language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en'] || intent.labels.en;
  };

  const getCategoryName = (cat: Category) => {
    return cat.name[language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en'] || cat.name.en;
  };

  // STEP 2: Intent Tap -> builds full sentence according to language and age mode, speaks aloud
  const handleIntentTap = (intent: IntentItem) => {
    if (!selectedAsset) return;

    if (intent.id === 'something_else') {
      setSomethingElseMode('type');
      return;
    }

    const sentenceObj = buildSentence(selectedAsset.id, intent.id, language, userMode);
    speak(sentenceObj.text, {
      category: selectedAsset.categoryId,
      assetId: selectedAsset.id,
      intentId: intent.id
    });

    if (userMode === 'adult') {
      setAdultSentenceConfirmed(true);
      setTimeout(() => setAdultSentenceConfirmed(false), 2400);
    }
  };

  const handleSpeakTypedText = () => {
    if (!typedText.trim()) return;
    speak(typedText.trim(), { category: 'typed' });
    setTypedText('');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Helper line */}
      <div className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-4 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0F8B8D]">
            {t.communicate}
          </span>
          <p className="text-base sm:text-lg font-bold text-[#1F1B16]">
            {selectedAsset ? t.whatDoYouWantToSay : t.helperWhatShouldITap}
          </p>
        </div>

        {selectedAsset && (
          <Button
            variant="secondary"
            size="normal"
            onClick={() => setSelectedAsset(null)}
            icon={<ArrowLeft className="w-5 h-5 text-[#5E564D]" />}
          >
            {t.back}
          </Button>
        )}
      </div>

      {/* Active Spoken Sentence & Replay */}
      {activeSpokenText && (
        <SpeakIndicator
          isSpeaking={isSpeaking}
          phrase={activeSpokenText}
          onReplay={replaySpokenText}
          onStop={stopSpeaking}
          replayLabel={t.speakAgain}
          stopLabel={t.stop}
          speakingLabel={t.speaking}
          userMode={userMode}
        />
      )}

      {/* Quiet checkmark badge for adult mode */}
      {userMode === 'adult' && adultSentenceConfirmed && (
        <div
          role="status"
          className="bg-[#DCFCE7] border-2 border-[#2E9E5B] text-[#166534] rounded-[12px] p-3 flex items-center gap-2.5 font-bold animate-fadeIn"
        >
          <Check className="w-5 h-5 text-[#2E9E5B] shrink-0" />
          <span>Sentence spoken clearly and saved to My Day.</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 2 VIEW: Intent Selector ("What do you want to say?")       */}
      {/* ============================================================== */}
      {selectedAsset ? (
        <div className="space-y-6">
          {/* Selected Picture Header Card */}
          <div className="bg-white border-2 border-[#0F8B8D] rounded-[16px] p-5 flex items-center gap-4 shadow-sm">
            <div className="w-20 h-20 rounded-[12px] bg-[#FFF8EF] border-2 border-[#E5DACF] flex items-center justify-center shrink-0">
              <Pictogram name={selectedAsset.svgIcon} alt={selectedAsset.alt} size={64} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-[#0F8B8D] uppercase tracking-wider">
                Selected Word
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1F1B16] truncate">
                {getAssetLabel(selectedAsset)}
              </h2>
              <p className="text-xs sm:text-sm text-[#5E564D] font-medium mt-0.5">
                {t.tapIntentHelper}
              </p>
            </div>
          </div>

          {/* Child mascot helper */}
          {userMode === 'child' && (
            <MascotView
              pose="point"
              size={90}
              message="Choose an intent to say the full sentence!"
            />
          )}

          {/* Intent Cards Grid */}
          <div>
            <h3 className="text-xl font-black text-[#1F1B16] mb-3">
              {t.whatDoYouWantToSay}
            </h3>
            <div className={`grid gap-3.5 ${
              userMode === 'child'
                ? 'grid-cols-1 sm:grid-cols-2'
                : preferences.largeAndSimple
                ? 'grid-cols-1'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            }`}>
              {INTENT_LIST.map((intent) => {
                const intentLabel = getIntentLabel(intent);

                return (
                  <button
                    key={intent.id}
                    type="button"
                    onClick={() => handleIntentTap(intent)}
                    style={{ backgroundColor: intent.color, borderColor: intent.borderColor, color: intent.textColor }}
                    aria-label={`Intent: ${intentLabel}`}
                    className={`min-h-[72px] sm:min-h-[84px] rounded-[12px] border-2 p-4 text-left font-black flex items-center justify-between select-none cursor-pointer transition-transform duration-100 active:scale-95 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0F8B8D] ${
                      userMode === 'child' ? 'text-2xl' : 'text-xl'
                    }`}
                  >
                    <span>{intentLabel}</span>
                    <Sparkles className="w-5 h-5 shrink-0 opacity-70" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* STEP 1 VIEW: Category Selector & Picture Grid                  */
        /* ============================================================== */
        <div className="space-y-6">
          {/* Search bar & Something Else Options */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search}
                aria-label={t.search}
                className="w-full min-h-[56px] pl-11 pr-4 bg-white border-2 border-[#E5DACF] rounded-[12px] text-lg font-bold text-[#1F1B16] placeholder:text-[#5E564D] focus:border-[#0F8B8D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F8B8D]"
              />
              <Search className="w-5 h-5 text-[#5E564D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <Button
              variant="secondary"
              size="normal"
              onClick={() => setSomethingElseMode('type')}
              icon={<Keyboard className="w-5 h-5 text-[#0F8B8D]" />}
            >
              {t.somethingElse}
            </Button>
          </div>

          {/* Categories Horizontal Tabs */}
          {!searchQuery && (
            <div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {visibleCategories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  const catName = getCategoryName(cat);

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      aria-pressed={isSelected}
                      style={{
                        backgroundColor: isSelected ? cat.color : '#FFFFFF',
                        borderColor: isSelected ? cat.borderColor : '#E5DACF',
                        color: isSelected ? cat.textColor : '#1F1B16'
                      }}
                      className={`min-h-[50px] px-4 py-2.5 rounded-[12px] border-2 font-bold text-base shrink-0 select-none cursor-pointer transition-transform duration-100 active:scale-95 flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F8B8D] ${
                        isSelected ? 'ring-2 ring-[#0F8B8D]/30' : 'hover:border-[#0F8B8D]'
                      }`}
                    >
                      <span>{catName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Picture Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xl sm:text-2xl font-black text-[#1F1B16]">
                {searchQuery ? `Search Results (${filteredAssets.length})` : getCategoryName(currentCategory)}
              </h2>
              <span className="text-xs sm:text-sm font-semibold text-[#5E564D]">
                {t.helperWhatHappensNext} Tapping speaks word
              </span>
            </div>

            <div className={`grid gap-3.5 sm:gap-4 ${
              userMode === 'child'
                ? 'grid-cols-2'
                : userMode === 'student'
                ? 'grid-cols-2 sm:grid-cols-3'
                : preferences.largeAndSimple
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            }`}>
              {displayedAssets.map((asset) => (
                <Card
                  key={asset.id}
                  title={getAssetLabel(asset)}
                  image={<Pictogram name={asset.svgIcon} alt={asset.alt} size={userMode === 'child' ? 68 : 56} />}
                  userMode={userMode}
                  onClick={() => handleCardTap(asset)}
                  color="#FFFFFF"
                  borderColor={asset.requiresConfirmation ? '#D62828' : '#E5DACF'}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SOMETHING ELSE MODAL: Type, Draw, Sign, Choose Picture        */}
      {/* ============================================================== */}
      {somethingElseMode && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="something-else-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
        >
          <div className="w-full max-w-2xl bg-white border-2 border-[#0F8B8D] rounded-[16px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-[#E5DACF] pb-4 mb-4">
              <h3 id="something-else-title" className="text-2xl font-black text-[#1F1B16]">
                {t.somethingElse}
              </h3>
              <Button
                variant="secondary"
                size="normal"
                onClick={() => setSomethingElseMode(null)}
              >
                {t.close}
              </Button>
            </div>

            {/* Sub-mode selector tabs */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSomethingElseMode('type')}
                className={`min-h-[46px] px-4 rounded-[10px] border-2 font-bold text-sm flex items-center gap-2 ${
                  somethingElseMode === 'type'
                    ? 'bg-[#0F8B8D] text-white border-[#0F8B8D]'
                    : 'bg-[#FFF8EF] border-[#E5DACF] text-[#1F1B16]'
                }`}
              >
                <Keyboard className="w-4 h-4" />
                <span>Type</span>
              </button>
              <button
                type="button"
                onClick={() => setSomethingElseMode('draw')}
                className={`min-h-[46px] px-4 rounded-[10px] border-2 font-bold text-sm flex items-center gap-2 ${
                  somethingElseMode === 'draw'
                    ? 'bg-[#0F8B8D] text-white border-[#0F8B8D]'
                    : 'bg-[#FFF8EF] border-[#E5DACF] text-[#1F1B16]'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>Draw</span>
              </button>
              <button
                type="button"
                onClick={() => setSomethingElseMode('sign')}
                className={`min-h-[46px] px-4 rounded-[10px] border-2 font-bold text-sm flex items-center gap-2 ${
                  somethingElseMode === 'sign'
                    ? 'bg-[#0F8B8D] text-white border-[#0F8B8D]'
                    : 'bg-[#FFF8EF] border-[#E5DACF] text-[#1F1B16]'
                }`}
              >
                <Hand className="w-4 h-4" />
                <span>Sign</span>
              </button>
              <button
                type="button"
                onClick={() => setSomethingElseMode('all')}
                className={`min-h-[46px] px-4 rounded-[10px] border-2 font-bold text-sm flex items-center gap-2 ${
                  somethingElseMode === 'all'
                    ? 'bg-[#0F8B8D] text-white border-[#0F8B8D]'
                    : 'bg-[#FFF8EF] border-[#E5DACF] text-[#1F1B16]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>All Pictures</span>
              </button>
            </div>

            {/* TAB: Type what you want to say */}
            {somethingElseMode === 'type' && (
              <div className="space-y-4">
                <label htmlFor="custom-type-input" className="block text-lg font-bold text-[#1F1B16]">
                  {t.typeWhatYouWantToSay}
                </label>
                <textarea
                  id="custom-type-input"
                  rows={4}
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  placeholder={t.typePlaceholder}
                  className="w-full p-4 border-2 border-[#E5DACF] rounded-[12px] text-xl font-bold text-[#1F1B16] focus:border-[#0F8B8D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F8B8D]"
                />
                <div className="flex justify-end gap-3">
                  <Button
                    variant="primary"
                    size="large"
                    onClick={handleSpeakTypedText}
                    icon={<Send className="w-5 h-5 text-white" />}
                  >
                    {t.speak}
                  </Button>
                </div>
              </div>
            )}

            {/* TAB: Draw */}
            {somethingElseMode === 'draw' && (
              <DrawingCanvas
                onSpeak={(text) => {
                  speak(text, { category: 'drawing' });
                  setSomethingElseMode(null);
                }}
                onAddToSentence={(asset) => {
                  setSelectedAsset(asset);
                  setSomethingElseMode(null);
                }}
                onClose={() => setSomethingElseMode(null)}
              />
            )}

            {/* TAB: Sign */}
            {somethingElseMode === 'sign' && (
              <SignRecognizer
                onSpeak={(text) => {
                  speak(text, { category: 'sign' });
                  setSomethingElseMode(null);
                }}
                onClose={() => setSomethingElseMode(null)}
              />
            )}

            {/* TAB: All Pictures */}
            {somethingElseMode === 'all' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {COMMUNICATION_ASSETS.slice(0, 12).map(asset => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        setSomethingElseMode(null);
                        handleCardTap(asset);
                      }}
                      className="min-h-[70px] rounded-[12px] border-2 border-[#E5DACF] bg-white p-2 flex items-center gap-2 hover:border-[#0F8B8D]"
                    >
                      <Pictogram name={asset.svgIcon} alt={asset.alt} size={40} />
                      <span className="font-bold text-sm truncate">{getAssetLabel(asset)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
