import React from 'react';
import { ArrowLeft, HelpCircle, MessageSquare, Volume2, PenTool, Hand, WifiOff, Settings } from 'lucide-react';
import { Button } from '../components/Button';

interface HelpPageProps {
  onBack: () => void;
}

export const HelpPage: React.FC<HelpPageProps> = ({ onBack }) => {
  return (
    <article className="max-w-4xl mx-auto bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 sm:p-10 shadow-sm space-y-8 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-[#E5DACF] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[12px] bg-[#E2F3F3] border-2 border-[#0A6C6E] flex items-center justify-center text-[#085557]">
            <HelpCircle className="w-6 h-6 text-[#0A6C6E]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1F1B16]">
              COMMUNIQ Help and Guide
            </h1>
            <p className="text-sm font-semibold text-[#0A6C6E]">
              Simple instructions for communicators, families, teachers, and speech therapists.
            </p>
          </div>
        </div>

        <Button variant="secondary" size="normal" onClick={onBack} icon={<ArrowLeft className="w-4 h-4 text-[#5E564D]" />}>
          Back
        </Button>
      </div>

      <div className="space-y-6 text-[#1F1B16]">
        {/* Guide 1: Picture Cards */}
        <section className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[14px] p-5 space-y-2">
          <h2 className="text-xl font-black text-[#1F1B16] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#0A6C6E]" />
            1. Speaking with Picture Cards
          </h2>
          <p className="text-sm text-[#5E564D] leading-relaxed">
            Go to the <strong>Communicate</strong> screen. Tap any category (Food &amp; Drink, Needs, Feelings, Greetings, etc.) and tap any card. The word is spoken aloud immediately using your device's built-in voice, and saved to <em>My Day</em>.
          </p>
          <p className="text-xs text-[#5E564D]">
            Tip: In Student and Adult mode, you can tap intent buttons (e.g. "I want", "Please give me") to form full natural sentences before speaking.
          </p>
        </section>

        {/* Guide 2: Two-Way Conversation */}
        <section className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[14px] p-5 space-y-2">
          <h2 className="text-xl font-black text-[#1F1B16] flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-[#0A6C6E]" />
            2. Two-Way Conversation ("Talk")
          </h2>
          <p className="text-sm text-[#5E564D] leading-relaxed">
            In the <strong>Talk</strong> screen, a speaking partner talks into the microphone. Their speech is transcribed into clear, large text. COMMUNIQ reads the context and predicts 3 to 6 helpful responses under <em>"You could say"</em>. The non-speaking person taps an option, it speaks aloud, and the conversation continues.
          </p>
          <p className="text-xs text-[#5E564D]">
            If AI suggestions are disabled or offline, COMMUNIQ uses its local rule catalog to provide immediate, contextual options with zero latency.
          </p>
        </section>

        {/* Guide 3: Draw What You Mean */}
        <section className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[14px] p-5 space-y-2">
          <h2 className="text-xl font-black text-[#1F1B16] flex items-center gap-2">
            <PenTool className="w-5 h-5 text-[#0A6C6E]" />
            3. Draw What You Mean
          </h2>
          <p className="text-sm text-[#5E564D] leading-relaxed">
            Tap <em>"Something else" &gt; Draw</em> in the Communicate screen. Sketch what you want with your finger, stylus, or mouse. Tap <em>"What did I draw?"</em>. COMMUNIQ matches your sketch to AAC communication symbols (e.g. Apple, Water, Home, Ball, Pizza, Car) and lets you confirm with one tap to speak it aloud.
          </p>
        </section>

        {/* Guide 4: Sign Language Recognition */}
        <section className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[14px] p-5 space-y-2">
          <h2 className="text-xl font-black text-[#1F1B16] flex items-center gap-2">
            <Hand className="w-5 h-5 text-[#0A6C6E]" />
            4. Sign Language Recognition (Beta)
          </h2>
          <p className="text-sm text-[#5E564D] leading-relaxed">
            Tap <em>"Something else" &gt; Sign</em> to open the camera or upload a gesture picture. COMMUNIQ recognizes essential daily signs (Hello, Thank You, Yes, No, Help, Water, Please) and speaks them aloud. Signers can also record local landmark datasets in the <em>Sign Lab</em> (/dev/sign-samples) to calibrate custom weights.
          </p>
        </section>

        {/* Guide 5: Offline Operation */}
        <section className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[14px] p-5 space-y-2">
          <h2 className="text-xl font-black text-[#1F1B16] flex items-center gap-2">
            <WifiOff className="w-5 h-5 text-[#1B7A42]" />
            5. Using COMMUNIQ Completely Offline
          </h2>
          <p className="text-sm text-[#5E564D] leading-relaxed">
            COMMUNIQ is a Progressive Web App (PWA) with fully offline assets, pictograms, and speech synthesizers. It stores all history inside IndexedDB on your device. You can turn off Wi-Fi or mobile data completely and the application works without interruption.
          </p>
        </section>

        {/* Guide 6: Installing Natural Voices */}
        <section className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[14px] p-5 space-y-2">
          <h2 className="text-xl font-black text-[#1F1B16] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#085557]" />
            6. Setting Up Offline Natural Voices
          </h2>
          <p className="text-sm text-[#5E564D] leading-relaxed">
            To make Kannada and Hindi sound rich and natural offline, download the free language packs from your device operating system settings (see step-by-step guides in the <em>Settings &gt; Speech</em> section).
          </p>
        </section>
      </div>
    </article>
  );
};
