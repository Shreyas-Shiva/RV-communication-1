import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  return (
    <article className="max-w-4xl mx-auto bg-white border-2 border-[#E5DACF] rounded-[16px] p-6 sm:p-10 shadow-sm space-y-6 pb-24">
      <div className="flex items-center justify-between border-b-2 border-[#E5DACF] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[12px] bg-[#E2F3F3] border-2 border-[#0A6C6E] flex items-center justify-center text-[#085557]">
            <FileText className="w-6 h-6 text-[#0A6C6E]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1F1B16]">
              Terms of Use
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
          <h2 className="text-xl font-bold text-[#085557]">1. Acceptance of Terms</h2>
          <p>
            By accessing or using COMMUNIQ, you agree to these Terms of Use. If you are a parent, guardian, or educational
            caregiver guiding a child, you agree to these terms on their behalf.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#085557]">2. Nature of the Assistive Software</h2>
          <p>
            COMMUNIQ is designed as an assistive communication tool. It provides picture symbol boards, synthesized speech
            pronunciation, two-way conversation assistance, and activity tracking. The software is provided on an "as is" and "as available" basis.
            While COMMUNIQ includes emergency phrase items, it is not a certified telephone emergency dispatch service and
            must not be relied upon as a sole substitute for standard telecommunications or medical devices.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#085557]">3. Intellectual Property and Open Licenses</h2>
          <p>
            The interface layout, custom source code, brand assets, and original illustrations are owned by the developers.
            Pictographic symbols utilized in communication boards incorporate symbols from the ARASAAC symbol system:
          </p>
          <div className="bg-[#FFF8EF] border border-[#E5DACF] rounded-[10px] p-4 text-xs font-semibold space-y-1">
            <p>
              Attribution: Pictographic symbols used in this software are owned by the Government of Aragon and have been
              created by Sergio Palao for ARASAAC (http://www.arasaac.org), distributed under a Creative Commons License
              BY-NC-SA.
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#085557]">4. AI Assisted Features and Third-Party Services</h2>
          <p>
            COMMUNIQ offers optional AI-predicted suggestions ("You could say") and text enhancement. These features
            are auxiliary. You maintain full autonomy over whether to turn on AI in Settings and which phrases to speak.
            COMMUNIQ does not guarantee that predicted suggestions will reflect the user's intended thought in every circumstance.
            Offline communication boards and local phrase generation remain available at all times without network access.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#085557]">5. Acceptable Conduct</h2>
          <p>
            Users agree not to exploit or tamper with the application, inject prompt attacks, attempt unauthorized database
            intrusions, or disrupt offline accessibility services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#085557]">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted under applicable law, the providers of COMMUNIQ shall not be liable for any indirect,
            punitive, or consequential damages resulting from the inability to pronounce phrases due to local operating system
            sound engine failure or hardware speaker limitations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-[#085557]">7. Legal Entity and Governing Jurisdiction</h2>
          <p>
            These terms are governed by the laws specified below:
          </p>
          <div className="bg-[#FFF8EF] border border-[#E5DACF] rounded-[10px] p-4 text-sm font-semibold space-y-1">
            <p>Legal Entity Name: [FILL IN: Legal Business Name / Registered Entity]</p>
            <p>Physical Address: [FILL IN: Registered Address, City, State, Country, Postal Code]</p>
            <p>Email Contact: [FILL IN: legal@yourdomain.com]</p>
            <p>Governing Law: [FILL IN: e.g. Laws of India, State of Karnataka]</p>
          </div>
          <p className="bg-[#FFF4D6] p-3 rounded-[10px] text-xs text-[#7A5400] font-bold">
            Legal notice: These terms must be reviewed by qualified legal counsel in each applicable operating jurisdiction prior
            to full commercial release.
          </p>
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
