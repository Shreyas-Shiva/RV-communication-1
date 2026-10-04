import React, { useEffect, useState } from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Pictogram } from '../components/Pictogram';
import { MascotView } from '../components/MascotView';
import { SpeakIndicator } from '../components/SpeakIndicator';
import { CHILD_PLACES } from '../data/places';
import { COMMUNICATION_ASSETS, CommunicationAsset } from '../data/assets';
import { db, ActivityRecord } from '../services/db';
import { MessageSquare, MessagesSquare, ArrowRight, Sparkles, Star } from 'lucide-react';

interface HomePageProps {
  onNavigateToCommunicate: (categoryId?: string, assetId?: string) => void;
  onNavigateToTalk: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToCommunicate,
  onNavigateToTalk
}) => {
  const { userMode, language, speak, t, isSpeaking, activeSpokenText, replaySpokenText, stopSpeaking, preferences } = useCommuniq();
  const [recentPhrases, setRecentPhrases] = useState<ActivityRecord[]>([]);
  const [favoritePhrases, setFavoritePhrases] = useState<ActivityRecord[]>([]);

  useEffect(() => {
    let mounted = true;
    db.activityLogs.orderBy('timestamp').reverse().limit(6).toArray().then(logs => {
      if (mounted) setRecentPhrases(logs);
    });

    db.activityLogs.filter(l => l.isFavorite).limit(6).toArray().then(favs => {
      if (mounted) setFavoritePhrases(favs);
    });

    return () => { mounted = false; };
  }, [activeSpokenText]);

  // Quick Say card presets
  const quickSayAssets: CommunicationAsset[] = [
    COMMUNICATION_ASSETS.find(a => a.id === 'water')!,
    COMMUNICATION_ASSETS.find(a => a.id === 'pizza')!,
    COMMUNICATION_ASSETS.find(a => a.id === 'bathroom')!,
    COMMUNICATION_ASSETS.find(a => a.id === 'happy')!,
    COMMUNICATION_ASSETS.find(a => a.id === 'yes_card')!,
    COMMUNICATION_ASSETS.find(a => a.id === 'no_card')!,
  ].filter(Boolean);

  const getLabel = (asset: CommunicationAsset) => {
    return asset.labels[language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en'] || asset.labels.en;
  };

  const handleQuickSay = (asset: CommunicationAsset) => {
    const label = getLabel(asset);
    // Tapping picture speaks immediately and opens intent builder
    speak(label, { category: asset.categoryId, assetId: asset.id });
    onNavigateToCommunicate(asset.categoryId, asset.id);
  };

  // Helper lines for every mode
  const helperText = userMode === 'child'
    ? t.helperWhatShouldITap
    : userMode === 'student'
    ? t.helperWhatCanISay
    : t.helperWhatHappensNext;

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Speaking Indicator if active phrase exists */}
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

      {/* ============================================================== */}
      {/* 1. CHILD MODE HOME (Class 1-7)                                  */}
      {/* ============================================================== */}
      {userMode === 'child' && (
        <div className="space-y-6">
          {/* Mascot Greeting & One Large "Say Something" Button */}
          <div className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <MascotView
              pose={isSpeaking ? 'celebrate' : 'wave'}
              size={110}
              message={t.childGreeting}
            />

            <div className="w-full md:w-auto">
              <Button
                variant="primary"
                size="child"
                fullWidth
                onClick={() => onNavigateToCommunicate()}
                icon={<Sparkles className="w-7 h-7 text-[#FFB703]" />}
              >
                {t.saySomethingButton}
              </Button>
            </div>
          </div>

          {/* Quick Say Row (large 2-column or 3-column cards) */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h2 className="text-2xl font-black text-[#1F1B16]">{t.quickSayTitle}</h2>
                <p className="text-sm font-bold text-[#0A6C6E]">{t.helperWhatShouldITap}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {quickSayAssets.map((asset) => (
                <Card
                  key={asset.id}
                  title={getLabel(asset)}
                  image={<Pictogram name={asset.svgIcon} alt={asset.alt} size={64} />}
                  userMode="child"
                  onClick={() => handleQuickSay(asset)}
                  color="#FFFFFF"
                  borderColor="#E5DACF"
                />
              ))}
            </div>
          </div>

          {/* Illustrated Map of Places */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h2 className="text-2xl font-black text-[#1F1B16]">{t.placesMapTitle}</h2>
                <p className="text-sm font-bold text-[#0A6C6E]">{t.placesMapDesc}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {CHILD_PLACES.map((place) => {
                const placeTitle = place.labels[language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en'] || place.labels.en;
                const placeDesc = place.desc[language === 'kn' ? 'kn' : language === 'hi' ? 'hi' : 'en'] || place.desc.en;

                return (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => onNavigateToCommunicate(place.relatedCategory)}
                    aria-label={`Enter place: ${placeTitle}`}
                    style={{ backgroundColor: place.color, borderColor: place.borderColor }}
                    className="min-h-[140px] rounded-[16px] border-2 p-4 text-left flex flex-col justify-between select-none cursor-pointer transition-transform duration-100 active:scale-95 focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0A6C6E]"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="w-10 h-10 rounded-[10px] bg-white border border-[#E5DACF] flex items-center justify-center text-[#1F1B16]">
                        <Pictogram name={place.relatedCategory === 'food_drink' ? 'pizza' : place.relatedCategory === 'playing' ? 'ball' : place.relatedCategory === 'health' ? 'doctor' : 'home'} alt="" size={28} />
                      </span>
                      <ArrowRight className="w-5 h-5 text-[#1F1B16]" />
                    </div>

                    <div className="mt-3">
                      <span className="block text-xl sm:text-2xl font-black text-[#1F1B16] leading-tight">
                        {placeTitle}
                      </span>
                      <span className="block text-xs text-[#1F1B16] mt-1 font-bold line-clamp-1">
                        {placeDesc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. STUDENT MODE HOME (Class 8-12)                               */}
      {/* ============================================================== */}
      {userMode === 'student' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1F1B16]">{t.studentGreeting}</h2>
              <p className="text-sm font-bold text-[#0A6C6E] mt-1">{helperText}</p>
            </div>
            <div className="flex gap-2.5 w-full sm:w-auto">
              <Button
                variant="primary"
                size="large"
                onClick={() => onNavigateToCommunicate()}
                icon={<MessageSquare className="w-5 h-5" />}
              >
                {t.chooseAndSay}
              </Button>
              <Button
                variant="secondary"
                size="large"
                onClick={onNavigateToTalk}
                icon={<MessagesSquare className="w-5 h-5 text-[#0F8B8D]" />}
              >
                {t.talkWithSomeone}
              </Button>
            </div>
          </div>

          {/* Quick Say Row */}
          <div>
            <h2 className="text-xl font-bold text-[#1F1B16] mb-3 px-1">{t.quickSayTitle}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {quickSayAssets.map((asset) => (
                <Card
                  key={asset.id}
                  title={getLabel(asset)}
                  image={<Pictogram name={asset.svgIcon} alt={asset.alt} size={54} />}
                  userMode="student"
                  onClick={() => handleQuickSay(asset)}
                />
              ))}
            </div>
          </div>

          {/* Recent Spoken Phrases */}
          {recentPhrases.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-[#1F1B16] mb-3 px-1">{t.recentSpoken}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentPhrases.map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => speak(rec.phrase, { category: rec.category })}
                    className="min-h-[56px] rounded-[12px] border-2 border-[#E5DACF] bg-white p-3.5 text-left font-bold text-base hover:border-[#0F8B8D] transition-transform active:scale-[0.98] flex items-center justify-between gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F8B8D]"
                  >
                    <span className="truncate">{rec.phrase}</span>
                    <ArrowRight className="w-4 h-4 text-[#0F8B8D] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. ADULT AND ELDER MODE HOME (18+)                              */}
      {/* ============================================================== */}
      {userMode === 'adult' && (
        <div className="space-y-6 sm:space-y-8">
          {/* Calm, neutral header with generous spacing */}
          <div className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1F1B16]">
              {t.adultGreeting}
            </h2>
            <p className="text-base text-[#5E564D] mt-1 font-semibold">
              {t.helperWhereAmI} COMMUNIQ Home. {t.helperWhatShouldITap}
            </p>

            {/* Two large main entries */}
            <div className={`grid gap-4 mt-6 ${preferences.largeAndSimple ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
              <button
                type="button"
                onClick={() => onNavigateToCommunicate()}
                className="min-h-[110px] rounded-[16px] border-2 border-[#0F8B8D] bg-[#E2F3F3] hover:bg-[#D5EFEF] p-6 text-left flex items-center justify-between transition-transform duration-100 active:scale-[0.98] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0F8B8D]"
              >
                <div>
                  <span className={`block font-black text-[#0F8B8D] ${preferences.largeAndSimple ? 'text-3xl' : 'text-2xl'}`}>
                    {t.chooseAndSay}
                  </span>
                  <span className="block text-sm sm:text-base font-semibold text-[#1F1B16] mt-1">
                    {t.chooseAndSayDesc}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-[12px] bg-white border border-[#0F8B8D] flex items-center justify-center shrink-0 ml-4">
                  <MessageSquare className="w-6 h-6 text-[#0F8B8D]" />
                </div>
              </button>

              <button
                type="button"
                onClick={onNavigateToTalk}
                className="min-h-[110px] rounded-[16px] border-2 border-[#E5DACF] bg-white hover:bg-[#FFF8EF] p-6 text-left flex items-center justify-between transition-transform duration-100 active:scale-[0.98] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#0F8B8D]"
              >
                <div>
                  <span className={`block font-black text-[#1F1B16] ${preferences.largeAndSimple ? 'text-3xl' : 'text-2xl'}`}>
                    {t.talkWithSomeone}
                  </span>
                  <span className="block text-sm sm:text-base font-semibold text-[#5E564D] mt-1">
                    {t.talkWithSomeoneDesc}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-[12px] bg-[#FFF8EF] border border-[#E5DACF] flex items-center justify-center shrink-0 ml-4">
                  <MessagesSquare className="w-6 h-6 text-[#0F8B8D]" />
                </div>
              </button>
            </div>
          </div>

          {/* Quick Say Row */}
          <div>
            <div className="mb-3 px-1">
              <h2 className="text-xl sm:text-2xl font-black text-[#1F1B16]">{t.quickSayTitle}</h2>
              <p className="text-xs sm:text-sm text-[#5E564D] font-medium">{t.helperWhatHappensNext} Tapping speaks immediately.</p>
            </div>
            <div className={`grid gap-3 sm:gap-4 ${preferences.largeAndSimple ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'}`}>
              {quickSayAssets.map((asset) => (
                <Card
                  key={asset.id}
                  title={getLabel(asset)}
                  image={<Pictogram name={asset.svgIcon} alt={asset.alt} size={preferences.largeAndSimple ? 64 : 52} />}
                  userMode="adult"
                  onClick={() => handleQuickSay(asset)}
                />
              ))}
            </div>
          </div>

          {/* Favorites and Recents Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Favorites */}
            <div className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-[#FFB703] fill-[#FFB703]" />
                <h3 className="text-lg font-bold text-[#1F1B16]">{t.favoritesTitle}</h3>
              </div>
              {favoritePhrases.length === 0 ? (
                <p className="text-sm text-[#5E564D] font-medium py-3">
                  No favorites added yet. Star phrases in My Day to see them here.
                </p>
              ) : (
                <div className="space-y-2">
                  {favoritePhrases.map((fav) => (
                    <button
                      key={fav.id}
                      type="button"
                      onClick={() => speak(fav.phrase, { category: fav.category })}
                      className="w-full min-h-[50px] rounded-[10px] border border-[#E5DACF] bg-[#FFF8EF] px-3.5 py-2 text-left font-bold text-base hover:border-[#0F8B8D] flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{fav.phrase}</span>
                      <ArrowRight className="w-4 h-4 text-[#0F8B8D] shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Recent */}
            <div className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-5">
              <h3 className="text-lg font-bold text-[#1F1B16] mb-3">{t.recentSpoken}</h3>
              {recentPhrases.length === 0 ? (
                <p className="text-sm text-[#5E564D] font-medium py-3">
                  {t.emptyLog}
                </p>
              ) : (
                <div className="space-y-2">
                  {recentPhrases.slice(0, 4).map((rec) => (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => speak(rec.phrase, { category: rec.category })}
                      className="w-full min-h-[50px] rounded-[10px] border border-[#E5DACF] bg-white px-3.5 py-2 text-left font-bold text-base hover:border-[#0F8B8D] flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{rec.phrase}</span>
                      <ArrowRight className="w-4 h-4 text-[#0F8B8D] shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
