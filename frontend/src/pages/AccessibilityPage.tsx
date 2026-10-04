import React from 'react';
import { ArrowLeft, CheckCircle2, Eye, ShieldCheck, Mail } from 'lucide-react';
import { Button } from '../components/Button';
import siteConfig from '../site.config.json';

interface AccessibilityPageProps {
  onBack: () => void;
}

export const AccessibilityPage: React.FC<AccessibilityPageProps> = ({ onBack }) => {
  return (
    <article className="max-w-4xl mx-auto bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 sm:p-10 shadow-sm space-y-8 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-[#E5DACF] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[12px] bg-[#E2F3F3] border-2 border-[#0A6C6E] flex items-center justify-center text-[#085557]">
            <Eye className="w-6 h-6 text-[#0A6C6E]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1F1B16]">
              Accessibility Statement
            </h1>
            <p className="text-sm font-semibold text-[#0A6C6E]">
              WCAG 2.1 Level AA Compliance and Assistive Technology Support
            </p>
          </div>
        </div>

        <Button variant="secondary" size="normal" onClick={onBack} icon={<ArrowLeft className="w-4 h-4 text-[#5E564D]" />}>
          Back
        </Button>
      </div>

      <div className="space-y-6 text-[#1F1B16] leading-relaxed">
        <p className="text-base font-medium">
          COMMUNIQ is designed from inception to be universally accessible for people with diverse motor, speech, visual, and cognitive needs. We target and test against <strong>WCAG 2.1 Level AA</strong> standards.
        </p>

        {/* Audit Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[12px] p-4 space-y-2">
            <h3 className="font-extrabold text-base text-[#085557] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#1B7A42]" />
              High Color Contrast
            </h3>
            <p className="text-xs text-[#5E564D] leading-relaxed">
              All text meets or exceeds 4.5:1 contrast ratio against its background. Headers and interactive controls exceed 7:1 contrast. We offer dedicated High Contrast and Warm Dark Mode options in Settings.
            </p>
          </div>

          <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[12px] p-4 space-y-2">
            <h3 className="font-extrabold text-base text-[#085557] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#1B7A42]" />
              Large Touch Targets
            </h3>
            <p className="text-xs text-[#5E564D] leading-relaxed">
              Every button, card, and tap target satisfies the minimum 44x44px target standard. Child mode and Large &amp; Simple mode feature oversized cards exceeding 64x64px with prominent margins.
            </p>
          </div>

          <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[12px] p-4 space-y-2">
            <h3 className="font-extrabold text-base text-[#085557] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#1B7A42]" />
              Full Keyboard Navigation
            </h3>
            <p className="text-xs text-[#5E564D] leading-relaxed">
              All features can be operated entirely via keyboard navigation, switch devices, or head pointers. Focus rings are rendered as unmistakable 2px solid outlines.
            </p>
          </div>

          <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[12px] p-4 space-y-2">
            <h3 className="font-extrabold text-base text-[#085557] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#1B7A42]" />
              Screen Reader Support
            </h3>
            <p className="text-xs text-[#5E564D] leading-relaxed">
              Every pictogram includes rich descriptive alternative text. Live announcements (ARIA live regions) inform screen reader users when speech synthesis begins and ends.
            </p>
          </div>
        </div>

        {/* Motion Policy */}
        <section className="bg-white border-2 border-[#E5DACF] rounded-[12px] p-5 space-y-2">
          <h3 className="text-lg font-black text-[#1F1B16] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0A6C6E]" />
            Motion and Vestibular Safety
          </h3>
          <p className="text-xs text-[#5E564D] leading-relaxed">
            COMMUNIQ strictly avoids cursor animations, scroll hijacking, parallax, or flashing effects. Motion is limited to instant tap feedback and brief transitions under 200ms. If your device operating system or browser requests <code>prefers-reduced-motion</code>, all animations and celebrations are automatically suppressed.
          </p>
        </section>

        {/* Feedback Channel */}
        <section className="bg-[#FFF8EF] border border-[#E5DACF] rounded-[12px] p-5 space-y-2 text-xs">
          <h3 className="font-extrabold text-sm text-[#1F1B16] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#0A6C6E]" />
            Accessibility Feedback and Support
          </h3>
          <p className="text-[#5E564D]">
            If you encounter any accessibility barrier or have suggestions for assistive compatibility, please reach out directly:
          </p>
          <p className="font-bold text-[#085557]">
            {siteConfig.contactEmail}
          </p>
        </section>
      </div>
    </article>
  );
};
