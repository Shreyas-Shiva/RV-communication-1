import React, { useState } from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import { UserMode } from '../translations';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Pictogram } from '../components/Pictogram';
import { MascotView } from '../components/MascotView';
import { SpeakIndicator } from '../components/SpeakIndicator';
import { COMMUNICATION_ASSETS } from '../data/assets';
import { Layers, ArrowLeft, Volume2, Check, AlertTriangle } from 'lucide-react';

interface DesignShowcasePageProps {
  onBack: () => void;
}

export const DesignShowcasePage: React.FC<DesignShowcasePageProps> = ({ onBack }) => {
  const { userMode, setUserMode, speak } = useCommuniq();
  const [showcaseMode, setShowcaseMode] = useState<UserMode>(userMode);
  const [demoSpeaking, setDemoSpeaking] = useState<boolean>(false);

  const colors = [
    { name: 'Cream (Background)', hex: '#FFF8EF', text: '#1F1B16' },
    { name: 'Teal (Primary)', hex: '#0A6C6E', text: '#FFFFFF' },
    { name: 'Amber (Accent)', hex: '#FFB703', text: '#1F1B16' },
    { name: 'Green (Success)', hex: '#1B7A42', text: '#FFFFFF' },
    { name: 'Red (Emergency only)', hex: '#D62828', text: '#FFFFFF' },
    { name: 'Warm Charcoal', hex: '#1F1B16', text: '#FFFFFF' },
  ];

  return (
    <div className="space-y-10 pb-24 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[12px] bg-[#E2F3F3] border-2 border-[#0A6C6E] flex items-center justify-center text-[#0A6C6E]">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1F1B16]">
              COMMUNIQ Design System
            </h1>
            <p className="text-sm font-bold text-[#0A6C6E]">
              Component showcase and accessibility tokens in all 3 interface modes.
            </p>
          </div>
        </div>

        <Button variant="secondary" size="normal" onClick={onBack} icon={<ArrowLeft className="w-4 h-4 text-[#5E564D]" />}>
          Back
        </Button>
      </div>

      {/* Mode Switcher for the Showcase */}
      <div className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-black text-lg text-[#1F1B16]">
          Inspect Mode Specific Layouts:
        </span>
        <div className="flex gap-2">
          {(['child', 'student', 'adult'] as UserMode[]).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setShowcaseMode(mode);
                setUserMode(mode);
              }}
              className={`min-h-[48px] px-5 rounded-[10px] border-2 font-black text-base uppercase tracking-wider transition-all ${
                showcaseMode === mode
                  ? 'bg-[#0A6C6E] text-white border-[#0A6C6E]'
                  : 'bg-[#FFF8EF] border-[#E5DACF] text-[#1F1B16] hover:border-[#0A6C6E]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Flat Color Palette */}
      <section className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 space-y-4">
        <h2 className="text-2xl font-black text-[#1F1B16]">
          1. Flat Color System (Pure Flat Tones)
        </h2>
        <p className="text-sm text-[#5E564D] font-medium">
          Pure flat tones engineered for WCAG AA compliance with distinct functional assignments.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {colors.map((c) => (
            <div
              key={c.name}
              style={{ backgroundColor: c.hex }}
              className="rounded-[12px] border-2 border-[#E5DACF] p-4 min-h-[110px] flex flex-col justify-between shadow-sm"
            >
              <span style={{ color: c.text }} className="text-xs font-black uppercase tracking-wider">
                {c.name}
              </span>
              <span style={{ color: c.text }} className="font-mono text-sm font-bold mt-2">
                {c.hex}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Shape and Touch Targets */}
      <section className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 space-y-4">
        <h2 className="text-2xl font-black text-[#1F1B16]">
          2. Shape Geometry and Touch Target Standards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-medium">
          <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[16px] p-4">
            <span className="font-black text-lg text-[#0A6C6E] block">Cards: 16px Radius</span>
            <p className="text-xs text-[#423C35] mt-1 font-bold">
              2px solid border, subtle elevation, large pictogram on top, 1 to 2 word label.
            </p>
          </div>
          <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[12px] p-4">
            <span className="font-black text-lg text-[#0A6C6E] block">Buttons: 10 to 12px Radius</span>
            <p className="text-xs text-[#423C35] mt-1 font-bold">
              Rectangular radius only. Zero pill shapes, zero rounded-full buttons.
            </p>
          </div>
          <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[12px] p-4">
            <span className="font-black text-lg text-[#0A6C6E] block">Touch Targets</span>
            <p className="text-xs text-[#423C35] mt-1 font-bold">
              Child mode min 80px. Student and Adult modes min 56px.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Button Component States */}
      <section className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 space-y-4">
        <h2 className="text-2xl font-black text-[#1F1B16]">
          3. Button Variants (Rectangular with 12px Radius)
        </h2>
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="primary" size={showcaseMode === 'child' ? 'child' : 'normal'}>
            Primary Action
          </Button>
          <Button variant="secondary" size={showcaseMode === 'child' ? 'child' : 'normal'}>
            Secondary Action
          </Button>
          <Button variant="accent" size={showcaseMode === 'child' ? 'child' : 'normal'}>
            Accent Action
          </Button>
          <Button variant="success" size={showcaseMode === 'child' ? 'child' : 'normal'} icon={<Check className="w-4 h-4" />}>
            Success Action
          </Button>
          <Button variant="emergency" size={showcaseMode === 'child' ? 'child' : 'normal'} icon={<AlertTriangle className="w-4 h-4" />}>
            Emergency Only
          </Button>
        </div>
      </section>

      {/* 4. Mascot Poses (Owl) */}
      <section className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 space-y-4">
        <h2 className="text-2xl font-black text-[#1F1B16]">
          4. Friendly Mascot: Ollie the Owl (4 Clean SVG Poses)
        </h2>
        <p className="text-sm text-[#5E564D] font-medium">
          Simple flat SVG owl (not a robot). Waves, points, celebrates, and listens calmly.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[16px] p-4 text-center flex flex-col items-center">
            <MascotView pose="wave" size={88} />
            <span className="font-extrabold text-sm text-[#1F1B16] mt-2">1. Waving Pose</span>
            <span className="text-xs text-[#5E564D]">Greets the child</span>
          </div>

          <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[16px] p-4 text-center flex flex-col items-center">
            <MascotView pose="point" size={88} />
            <span className="font-extrabold text-sm text-[#1F1B16] mt-2">2. Pointing Pose</span>
            <span className="text-xs text-[#5E564D]">Directs to next card</span>
          </div>

          <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[16px] p-4 text-center flex flex-col items-center">
            <MascotView pose="celebrate" size={88} />
            <span className="font-extrabold text-sm text-[#1F1B16] mt-2">3. Celebrate Pose</span>
            <span className="text-xs text-[#5E564D]">Sentence completion joy</span>
          </div>

          <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[16px] p-4 text-center flex flex-col items-center">
            <MascotView pose="calm" size={88} />
            <span className="font-extrabold text-sm text-[#1F1B16] mt-2">4. Calm / Idle Pose</span>
            <span className="text-xs text-[#5E564D]">Patient listening</span>
          </div>
        </div>
      </section>

      {/* 5. Communication Cards Gallery */}
      <section className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 space-y-4">
        <h2 className="text-2xl font-black text-[#1F1B16]">
          5. Picture Communication Cards (Current Mode: {showcaseMode})
        </h2>
        <div className={`grid gap-4 ${
          showcaseMode === 'child'
            ? 'grid-cols-2 sm:grid-cols-3'
            : showcaseMode === 'student'
            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-2 sm:grid-cols-4'
        }`}>
          {COMMUNICATION_ASSETS.slice(0, 8).map(asset => (
            <Card
              key={asset.id}
              title={asset.labels.en}
              image={<Pictogram name={asset.svgIcon} alt={asset.alt} size={showcaseMode === 'child' ? 68 : 54} />}
              userMode={showcaseMode}
              onClick={() => speak(asset.labels.en, { category: asset.categoryId })}
            />
          ))}
        </div>
      </section>

      {/* 6. Active Speaking Indicator Demo */}
      <section className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 space-y-4">
        <h2 className="text-2xl font-black text-[#1F1B16]">
          6. Speaking Indicator Component
        </h2>
        <div className="flex gap-3 mb-3">
          <Button
            variant="accent"
            size="normal"
            onClick={() => setDemoSpeaking(!demoSpeaking)}
            icon={<Volume2 className="w-4 h-4" />}
          >
            Toggle Indicator State ({demoSpeaking ? 'Speaking' : 'Idle'})
          </Button>
        </div>

        <SpeakIndicator
          isSpeaking={demoSpeaking}
          phrase="I would like some pizza, please."
          onReplay={() => speak("I would like some pizza, please.")}
          onStop={() => setDemoSpeaking(false)}
          replayLabel="Say it again"
          stopLabel="Stop"
          speakingLabel="Speaking aloud..."
          userMode={showcaseMode}
        />
      </section>
    </div>
  );
};
