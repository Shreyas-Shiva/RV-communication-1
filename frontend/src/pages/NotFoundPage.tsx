import React from 'react';
import { Home, MessageSquare, HelpCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';

interface NotFoundPageProps {
  onNavigateHome: () => void;
  onNavigateCommunicate: () => void;
  onNavigateHelp: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onNavigateHome,
  onNavigateCommunicate,
  onNavigateHelp
}) => {
  return (
    <article className="max-w-2xl mx-auto bg-white border-2 border-[#E5DACF] rounded-[16px] p-8 sm:p-12 text-center shadow-sm space-y-6">
      <div className="w-16 h-16 rounded-[14px] bg-[#FFF4D6] border-2 border-[#FFB703] flex items-center justify-center text-[#7A5400] mx-auto">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#D62828]">
          Error 404
        </span>
        <h1 className="text-3xl font-black text-[#1F1B16]">
          Page Not Found
        </h1>
        <p className="text-sm font-semibold text-[#5E564D] max-w-md mx-auto leading-relaxed">
          The page or screen you requested does not exist. Use the buttons below to return to your communication tools.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          variant="primary"
          size="normal"
          onClick={onNavigateHome}
          icon={<Home className="w-4 h-4 text-white" />}
        >
          Go to Home
        </Button>
        <Button
          variant="secondary"
          size="normal"
          onClick={onNavigateCommunicate}
          icon={<MessageSquare className="w-4 h-4 text-[#0A6C6E]" />}
        >
          Open Communicate
        </Button>
        <Button
          variant="secondary"
          size="normal"
          onClick={onNavigateHelp}
          icon={<HelpCircle className="w-4 h-4 text-[#5E564D]" />}
        >
          Help &amp; Guides
        </Button>
      </div>
    </article>
  );
};
