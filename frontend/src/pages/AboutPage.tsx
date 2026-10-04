import React from 'react';
import { ArrowLeft, Heart, Shield, Globe, MessageSquare } from 'lucide-react';
import { Button } from '../components/Button';
import siteConfig from '../site.config.json';

interface AboutPageProps {
  onBack: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <article className="max-w-4xl mx-auto bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 sm:p-10 shadow-sm space-y-8 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-[#E5DACF] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[12px] bg-[#E2F3F3] border-2 border-[#0A6C6E] flex items-center justify-center text-[#085557]">
            <Heart className="w-6 h-6 text-[#0A6C6E]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1F1B16]">
              About COMMUNIQ
            </h1>
            <p className="text-sm font-semibold text-[#0A6C6E]">
              Everyone deserves a voice.
            </p>
          </div>
        </div>

        <Button variant="secondary" size="normal" onClick={onBack} icon={<ArrowLeft className="w-4 h-4 text-[#5E564D]" />}>
          Back
        </Button>
      </div>

      {/* Tagline and Supporting Line Callout */}
      <div className="bg-[#FFF8EF] border-2 border-[#0A6C6E] rounded-[14px] p-6 text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-[#1F1B16]">
          "Communicate naturally. Connect confidently."
        </h2>
        <p className="text-base font-semibold text-[#085557] max-w-2xl mx-auto">
          COMMUNIQ is a web application built for people who cannot speak, or who find speaking very hard, to talk with people who can.
        </p>
      </div>

      {/* Who COMMUNIQ Is For */}
      <section className="space-y-4">
        <h3 className="text-xl font-black text-[#1F1B16] flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#0A6C6E]" />
          Who We Built This For
        </h3>
        <p className="text-sm text-[#5E564D] leading-relaxed">
          The communicator is always at the center of the experience. Every interaction is designed to feel calm, dignified, and fully in the user's control:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="bg-white border-2 border-[#E5DACF] rounded-[12px] p-4 space-y-2">
            <span className="text-xs font-bold px-2 py-1 rounded-[6px] bg-[#FFF4D6] text-[#7A5400] border border-[#FFB703] uppercase">
              Class 1 to 7
            </span>
            <h4 className="text-lg font-black text-[#1F1B16]">Children</h4>
            <p className="text-xs text-[#5E564D] leading-relaxed">
              Friendly mascot guidance, playful practice stars, large high-contrast picture cards, and positive reinforcement.
            </p>
          </div>

          <div className="bg-white border-2 border-[#E5DACF] rounded-[12px] p-4 space-y-2">
            <span className="text-xs font-bold px-2 py-1 rounded-[6px] bg-[#E2F3F3] text-[#085557] border border-[#0A6C6E] uppercase">
              Class 8 to 12
            </span>
            <h4 className="text-lg font-black text-[#1F1B16]">Students</h4>
            <p className="text-xs text-[#5E564D] leading-relaxed">
              Clean organized category grid, school and study vocabulary, conversational streaks, and custom sentence assembly.
            </p>
          </div>

          <div className="bg-white border-2 border-[#E5DACF] rounded-[12px] p-4 space-y-2">
            <span className="text-xs font-bold px-2 py-1 rounded-[6px] bg-[#FFF8EF] text-[#1F1B16] border border-[#E5DACF] uppercase">
              18+ &amp; Elders
            </span>
            <h4 className="text-lg font-black text-[#1F1B16]">Adults and Elders</h4>
            <p className="text-xs text-[#5E564D] leading-relaxed">
              Direct practical layout, large and simple 28px text option, medical, daily needs, transit, and emergency quick actions.
            </p>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="space-y-4">
        <h3 className="text-xl font-black text-[#1F1B16] flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#1B7A42]" />
          Our Inviolable Product Principles
        </h3>
        <ul className="space-y-3 text-sm text-[#1F1B16] font-medium leading-relaxed">
          <li className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#0A6C6E] mt-2 shrink-0" />
            <div>
              <strong>Human Centered, AI Optional:</strong> Communication never depends on internet or artificial intelligence. Picture cards, speech output, sketchpad, and the daily log work 100% offline. AI only assists with optional predictions when consented to.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#0A6C6E] mt-2 shrink-0" />
            <div>
              <strong>Native Multilingual First:</strong> Built from the ground up for English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी) in native scripts, with review kits verifying natural localized phrasing.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#0A6C6E] mt-2 shrink-0" />
            <div>
              <strong>Strict Calm Visuals:</strong> Flat accessible palette, zero gradients, no pill buttons, no emoji used as icons, no glassmorphism, no tracking scripts, and no generic marketing noise.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#0A6C6E] mt-2 shrink-0" />
            <div>
              <strong>Absolute Privacy:</strong> Personal logs remain on your local device in IndexedDB. Audio, sketch frames, and camera data are processed ephemerally and never written to server disks.
            </div>
          </li>
        </ul>
      </section>

      {/* Symbol Attribution */}
      <section className="bg-[#FFF8EF] border border-[#E5DACF] rounded-[12px] p-5 space-y-2 text-xs text-[#5E564D]">
        <h4 className="font-extrabold text-sm text-[#1F1B16] flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#0A6C6E]" />
          Symbol and Icon Attribution
        </h4>
        <p>
          The pictographic communication symbols used across COMMUNIQ are property of the Government of Aragon and were created by Sergio Palao for ARASAAC (
          <a href="http://www.arasaac.org" target="_blank" rel="noreferrer" className="underline text-[#0A6C6E]">
            http://www.arasaac.org
          </a>
          ), distributed under the Creative Commons License (BY-NC-SA).
        </p>
        <p>
          UI icons are provided by Lucide.
        </p>
      </section>

      {/* Maker and Organization Information */}
      <section className="border-t-2 border-[#E5DACF] pt-4 space-y-1 text-xs text-[#5E564D]">
        <p>
          <strong>Maintained by:</strong> {siteConfig.makerName}
        </p>
        <p>
          <strong>Contact:</strong> {siteConfig.contactEmail}
        </p>
        <p>
          <strong>Location:</strong> {siteConfig.physicalAddress}
        </p>
      </section>
    </article>
  );
};
