import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';

interface PrivacyPageProps {
  onBack: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
  return (
    <article className="max-w-4xl mx-auto bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 sm:p-10 shadow-sm space-y-6 pb-24">
      <div className="flex items-center justify-between border-b-2 border-[#E5DACF] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[12px] bg-[#E2F3F3] border-2 border-[#0A6C6E] flex items-center justify-center text-[#085557]">
            <Shield className="w-6 h-6 text-[#0A6C6E]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1F1B16]">
              Privacy Policy
            </h1>
            <p className="text-xs font-semibold text-[#5E564D]">
              Effective Date: October 3, 2026. Last Updated: October 3, 2026.
            </p>
          </div>
        </div>

        <Button variant="secondary" size="normal" onClick={onBack} icon={<ArrowLeft className="w-4 h-4 text-[#5E564D]" />}>
          Back
        </Button>
      </div>

      <div className="prose text-[#1F1B16] space-y-5 leading-relaxed font-medium">
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#085557]">1. Overview and Core Philosophy</h2>
          <p>
            COMMUNIQ ("we", "our", or "the app") provides assistive augmentative and alternative communication (AAC)
            for non-speaking individuals, children, students, adults and elders. Our foundational commitment is that
            communication is a basic human right, and user privacy must remain inviolable. The human communicator
            is always at the center, while assistive tools and AI operate solely as helpers. Communication never
            depends on an internet connection or external servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#085557]">2. Data Stored Directly on Your Device</h2>
          <p>
            COMMUNIQ is built architecture-first as an offline application. By default, your spoken sentences,
            conversation partner replies, tapped cards, selected categories, star rewards, and custom logs are saved
            exclusively in your browser's local database (IndexedDB via Dexie).
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-[#5E564D]">
            <li>Spoken phrases and timestamps: Saved locally to construct your personal "My Day" activity record.</li>
            <li>Two-way conversation threads: Maintained on-device so you can review previous dialogs.</li>
            <li>Interface preferences: Language selection, font sizes, contrast presets, and audio preferences remain on your device.</li>
            <li>Grown-ups PIN: Stored only as a salted cryptographic hash on your device. It only prevents accidental changes by a child and is not strong security. To reset if forgotten, clear app data in your browser settings.</li>
            <li>Local learning: Tapped replies are counted locally on device to suggest your most useful phrases first. You can reset what Communiq has learned at any time in Settings.</li>
            <li>Custom cards and photos: Kept exclusively on this device in local storage and never transmitted.</li>
            <li>Reward stars and streaks: Tracked locally without external profiling or user telemetry.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#085557]">3. AI Suggestions, Provider Routing, and What Leaves Your Device</h2>
          <p>
            AI response prediction ("You could say") is <strong>strictly disabled by default</strong>. It is only
            activated when you (or a parent/guardian) explicitly turn it on in Settings after reviewing the Plain AI Consent screen.
          </p>
          <p>
            When AI suggestions are enabled, here is precisely what is processed:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-[#5E564D]">
            <li><strong>Text only:</strong> Only the recent conversation text (the last few turns) and selected language are transmitted to generate contextual options.</li>
            <li><strong>No personal identifiers:</strong> We never transmit user names, student IDs, locations, audio recordings, or photos.</li>
            <li><strong>Primary Provider (Groq):</strong> Requests are dispatched primarily to Groq Cloud API, which does not retain or use API inputs for model training.</li>
            <li><strong>Secondary Provider (Google Gemini):</strong> If Groq is unavailable, requests may fall back to Google Gemini Flash. Under Google free-tier terms, Google may use inputs to improve products, and human reviewers may review queries. COMMUNIQ provides a dedicated switch in Settings to disable Google Gemini entirely, allowing you to use Groq exclusively.</li>
            <li><strong>Offline Fallback:</strong> If no internet connection exists, or if API limits are reached, COMMUNIQ falls back immediately to its built-in rule-based offline engine. No error screens or interrupted conversations will occur.</li>
            <li><strong>Server Logs:</strong> Our backend server logs never contain conversation text, user messages, or API credentials.</li>
            <li><strong>Server Data Retention:</strong> The server does not store conversation text unless you explicitly enable optional cloud synchronization.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#085557]">4. Microphone Audio and Media Retention</h2>
          <p>
            When using the "Listen" feature on the conversation screen, audio is converted to text on your device
            using the browser's native Web Speech API. Audio is processed in temporary browser memory and is never recorded,
            saved to disk, or transmitted to any third-party analytics service.
          </p>
          <p>
            Temporary sketches created on the sketchpad remain in volatile browser memory and are discarded as soon as you
            leave the screen, unless you specifically choose to save them to your device.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#085557]">5. Children's Data and Parental Consent</h2>
          <p>
            When Class 1-7 mode is chosen, COMMUNIQ presents a parental or guardian consent screen. We do not solicit personal identifiers
            such as child full names, birth dates, phone numbers, or school locations. Parents or educators can inspect the daily timeline
            or erase all recorded speech at any moment.
          </p>
          <p className="bg-[#FFF4D6] p-3 rounded-[10px] text-xs text-[#7A5400] font-bold">
            Legal notice: This document requires final review by a qualified legal professional to confirm compliance with applicable
            statutes, including the Digital Personal Data Protection Act (DPDP Act, India) and international children privacy regulations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#085557]">6. How to Delete All Data</h2>
          <p>
            You have full ownership of your data. You can delete all history, cached records, conversation threads, and preference profiles permanently
            by opening the "My Day" screen and selecting "Delete all my data". This action instantly empties all local IndexedDB tables.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#085557]">7. Contact and Legal Entity Information</h2>
          <p>
            If you have questions regarding this privacy policy or wish to submit a data inquiry, please contact:
          </p>
          <div className="bg-[#FFF8EF] border border-[#E5DACF] rounded-[10px] p-4 text-sm font-semibold space-y-1">
            <p>Legal Entity Name: [FILL IN: Legal Business Name / Registered Entity]</p>
            <p>Physical Address: [FILL IN: Registered Address, City, State, Country, Postal Code]</p>
            <p>Email Address: [FILL IN: privacy@yourdomain.com]</p>
            <p>Governing Law: [FILL IN: e.g. Laws of India, State of Karnataka]</p>
          </div>
        </section>
      </div>

      <div className="pt-6 border-t-2 border-[#E5DACF] flex justify-end">
        <Button variant="primary" size="normal" onClick={onBack}>
          Understood and Return
        </Button>
      </div>
    </article>
  );
};
