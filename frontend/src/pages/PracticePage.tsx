import React, { useState } from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Pictogram } from '../components/Pictogram';
import { MascotView } from '../components/MascotView';
import { PRACTICE_SCENARIOS, PracticeScenario } from '../data/practiceScenarios';
import { Star, Flame, Award, ArrowLeft, RotateCcw, Volume2, CheckCircle2, MessageSquare } from 'lucide-react';

export const PracticePage: React.FC = () => {
  const { language, userMode, speak, stars, streak, celebrate } = useCommuniq();
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [completedScenarios, setCompletedScenarios] = useState<string[]>([]);
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);

  const activeScenario = PRACTICE_SCENARIOS.find(s => s.id === activeScenarioId) || null;
  const langKey = language.startsWith('kn') ? 'kn' : language.startsWith('hi') ? 'hi' : 'en';

  const handleSelectScenario = (scenario: PracticeScenario) => {
    setActiveScenarioId(scenario.id);
    setCurrentTurnIndex(0);
    setLastSpoken(null);
  };

  const handleSelectOption = (option: { id: string; pictogram: string; en: string; kn: string; hi: string }) => {
    const textToSpeak = option[langKey] || option.en;
    speak(textToSpeak, { category: 'practice', assetId: option.id });
    setLastSpoken(textToSpeak);

    if (activeScenario) {
      const nextTurn = currentTurnIndex + 1;
      if (nextTurn < activeScenario.turns.length) {
        setCurrentTurnIndex(nextTurn);
      } else {
        // Completed scenario!
        celebrate();
        if (!completedScenarios.includes(activeScenario.id)) {
          setCompletedScenarios(prev => [...prev, activeScenario.id]);
        }
        setCurrentTurnIndex(activeScenario.turns.length); // Finished state
      }
    }
  };

  const handleRestartScenario = () => {
    setCurrentTurnIndex(0);
    setLastSpoken(null);
  };

  const stickers = [
    { title: 'Golden Star', unlocked: stars >= 1 },
    { title: 'Communication Owl', unlocked: stars >= 3 },
    { title: 'Friendly Helper', unlocked: completedScenarios.length >= 1 },
    { title: 'Scenario Master', unlocked: completedScenarios.length >= 4 },
  ];

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Header with Stats */}
      <div className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1F1B16]">Practice Scenarios</h1>
          <p className="text-sm font-semibold text-[#0A6C6E] mt-0.5">
            Roleplay everyday situations and build communication confidence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#FFF4D6] border-2 border-[#FFB703] rounded-[12px] px-4 py-2 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#FFB703] fill-[#FFB703]" />
            <span className="text-lg font-black text-[#7A5400]">{stars} Stars</span>
          </div>

          <div className="bg-[#E2F3F3] border-2 border-[#0A6C6E] rounded-[12px] px-4 py-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#0A6C6E]" />
            <span className="text-lg font-black text-[#0A6C6E]">
              {completedScenarios.length} / {PRACTICE_SCENARIOS.length} Done
            </span>
          </div>

          <div className="bg-[#FEE2E2] border-2 border-[#D62828] rounded-[12px] px-4 py-2 flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#D62828]" />
            <span className="text-lg font-black text-[#991B1B]">{streak} Day Streak</span>
          </div>
        </div>
      </div>

      {/* Mascot encouragement in Child mode */}
      {userMode === 'child' && !activeScenario && (
        <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[16px] p-5 flex items-center gap-4">
          <MascotView
            pose="wave"
            size={88}
            message="Pick a place you want to visit today! We will practice words together."
          />
        </div>
      )}

      {/* SCENARIO ROLEPLAY VIEW */}
      {activeScenario ? (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Bar for Active Scenario */}
          <div className="bg-white border-2 border-[#0A6C6E] rounded-[16px] p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="normal"
                onClick={() => setActiveScenarioId(null)}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Places
              </Button>
              <div>
                <h2 className="text-xl font-black text-[#1F1B16]">
                  {activeScenario.title[langKey] || activeScenario.title.en}
                </h2>
                <p className="text-xs font-semibold text-[#5E564D]">
                  {activeScenario.description[langKey] || activeScenario.description.en}
                </p>
              </div>
            </div>

            {currentTurnIndex < activeScenario.turns.length ? (
              <span className="text-xs font-bold px-3 py-1.5 rounded-[10px] bg-[#E2F3F3] text-[#0A6C6E] border border-[#0A6C6E]">
                Turn {currentTurnIndex + 1} of {activeScenario.turns.length}
              </span>
            ) : (
              <span className="text-xs font-bold px-3 py-1.5 rounded-[10px] bg-[#D4EDDA] text-[#1B7A42] border border-[#1B7A42]">
                Complete
              </span>
            )}
          </div>

          {/* If Still in Dialogue */}
          {currentTurnIndex < activeScenario.turns.length ? (
            <div className="space-y-6">
              {/* Speaking Partner Dialogue Bubble */}
              <div className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0A6C6E]">
                  <MessageSquare className="w-4 h-4" />
                  <span>Speaking Partner says:</span>
                </div>
                <p className="text-2xl font-black text-[#1F1B16] leading-relaxed">
                  "{activeScenario.turns[currentTurnIndex].partnerPrompt[langKey] || activeScenario.turns[currentTurnIndex].partnerPrompt.en}"
                </p>
              </div>

              {/* User AAC Response Options */}
              <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[16px] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-[#1F1B16]">
                    You could say (Tap to speak):
                  </h3>
                  {lastSpoken && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A6C6E]">
                      <Volume2 className="w-4 h-4" />
                      <span>Last: "{lastSpoken}"</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {activeScenario.turns[currentTurnIndex].options.map(option => (
                    <Card
                      key={option.id}
                      title={option[langKey] || option.en}
                      image={<Pictogram name={option.pictogram} alt={option.en} size={64} />}
                      userMode={userMode}
                      onClick={() => handleSelectOption(option)}
                      color="#FFFFFF"
                      borderColor="#0A6C6E"
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Scenario Finished Screen */
            <div className="bg-white border-2 border-[#1B7A42] rounded-[16px] p-8 text-center space-y-6 shadow-sm">
              <div className="w-20 h-20 bg-[#D4EDDA] border-2 border-[#1B7A42] rounded-[14px] mx-auto flex items-center justify-center text-[#1B7A42]">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-black text-[#1F1B16]">
                  Great Job! Scenario Completed!
                </h3>
                <p className="text-base font-medium text-[#5E564D] max-w-md mx-auto">
                  You successfully finished the roleplay for "{activeScenario.title[langKey] || activeScenario.title.en}".
                </p>
              </div>

              {userMode === 'child' && (
                <div className="max-w-md mx-auto">
                  <MascotView
                    pose="celebrate"
                    size={80}
                    message="You did wonderful! You earned two shiny communication stars!"
                  />
                </div>
              )}

              <div className="flex items-center justify-center gap-4 pt-2">
                <Button
                  variant="primary"
                  size="large"
                  onClick={() => setActiveScenarioId(null)}
                  icon={<ArrowLeft className="w-5 h-5 text-white" />}
                >
                  Choose Another Place
                </Button>
                <Button
                  variant="secondary"
                  size="large"
                  onClick={handleRestartScenario}
                  icon={<RotateCcw className="w-5 h-5" />}
                >
                  Practice Again
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* SCENARIO SELECTION GRID */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {PRACTICE_SCENARIOS.map(scenario => {
              const isDone = completedScenarios.includes(scenario.id);
              return (
                <div
                  key={scenario.id}
                  onClick={() => handleSelectScenario(scenario)}
                  className={`cursor-pointer rounded-[14px] border-2 p-5 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-sm ${
                    isDone
                      ? 'bg-[#E2F3F3] border-[#0A6C6E]'
                      : 'bg-white border-[#E5DACF] hover:border-[#0A6C6E]'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleSelectScenario(scenario)}
                  aria-label={`Practice scenario: ${scenario.title.en}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-[10px] bg-[#FFF8EF] border border-[#E5DACF] flex items-center justify-center">
                        <Pictogram name={scenario.turns[0].options[0]?.pictogram || 'home'} alt={scenario.title.en} size={36} />
                      </div>
                      {isDone && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-[8px] bg-[#1B7A42] text-white">
                          Completed
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-lg text-[#1F1B16]">
                      {scenario.title[langKey] || scenario.title.en}
                    </h3>
                    <p className="text-xs font-medium text-[#5E564D] mt-1 line-clamp-2">
                      {scenario.description[langKey] || scenario.description.en}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E5DACF] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0A6C6E]">
                      {scenario.turns.length} turns
                    </span>
                    <Button variant="primary" size="normal">
                      Start
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress & Sticker Collection */}
          <div className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-6 h-6 text-[#FFB703]" />
              <h3 className="text-xl font-bold text-[#1F1B16]">
                Badge and Sticker Milestones
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stickers.map((sticker, idx) => (
                <div
                  key={idx}
                  className={`rounded-[12px] border-2 p-4 text-center transition-all ${
                    sticker.unlocked
                      ? 'bg-[#FFF4D6] border-[#FFB703]'
                      : 'bg-[#F4F1DE] border-[#E5DACF] opacity-60'
                  }`}
                >
                  <div className="w-12 h-12 rounded-[10px] mx-auto mb-2 flex items-center justify-center bg-white border border-[#E5DACF]">
                    {sticker.unlocked ? (
                      <Star className="w-6 h-6 fill-[#FFB703] text-[#FFB703]" />
                    ) : (
                      <Award className="w-6 h-6 text-[#5E564D]" />
                    )}
                  </div>
                  <p className="font-extrabold text-sm text-[#1F1B16]">{sticker.title}</p>
                  <span className="text-xs font-semibold text-[#5E564D] mt-1 block">
                    {sticker.unlocked ? 'Unlocked' : 'Keep practicing'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
