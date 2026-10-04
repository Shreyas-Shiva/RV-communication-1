import React from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import { AlertTriangle, X, Check, PhoneCall } from 'lucide-react';
import { Button } from './Button';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const { t, speak, emergencyConfirmTarget, cancelEmergencyConfirm, executeEmergencyConfirm } = useCommuniq();

  if (!isOpen && !emergencyConfirmTarget) return null;

  const emergencyPhrases = [
    { id: 'help', text: t.iNeedHelp },
    { id: 'doctor', text: t.iNeedDoctor },
    { id: 'ambulance', text: t.callAmbulance },
    { id: 'family', text: t.callFamily },
    { id: 'lost', text: t.iAmLost },
    { id: 'hurt', text: t.iAmHurt },
    { id: 'stay', text: t.pleaseStay },
  ];

  // If a single confirm prompt is active (e.g. from tapping a medical/pain item or emergency button)
  if (emergencyConfirmTarget) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      >
        <div className="w-full max-w-lg bg-white border-2 border-[#D62828] rounded-[16px] p-6 shadow-2xl">
          <div className="flex items-center gap-3 text-[#D62828] mb-4">
            <div className="w-12 h-12 rounded-[12px] bg-[#FEE2E2] border-2 border-[#D62828] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 id="confirm-dialog-title" className="text-xl sm:text-2xl font-black text-[#1F1B16]">
                {t.emergencyTitle}
              </h2>
              <p className="text-sm text-[#5E564D]">{t.emergencyConfirmPrompt}</p>
            </div>
          </div>

          <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[12px] p-4 my-5">
            <p className="text-xl sm:text-2xl font-black text-[#D62828] text-center">
              "{emergencyConfirmTarget.phrase}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button
              variant="secondary"
              size="large"
              onClick={cancelEmergencyConfirm}
              icon={<X className="w-5 h-5 text-[#5E564D]" />}
            >
              {t.cancel}
            </Button>
            <Button
              variant="emergency"
              size="large"
              onClick={executeEmergencyConfirm}
              icon={<Check className="w-5 h-5 text-white" />}
            >
              {t.confirm}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Full emergency modal screen
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto"
    >
      <div className="w-full max-w-2xl bg-white border-3 border-[#D62828] rounded-[16px] p-6 shadow-2xl my-auto">
        <div className="flex items-center justify-between border-b-2 border-[#FEE2E2] pb-4 mb-4">
          <div className="flex items-center gap-3 text-[#D62828]">
            <div className="w-12 h-12 rounded-[12px] bg-[#FEE2E2] border-2 border-[#D62828] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7 text-[#D62828]" />
            </div>
            <div>
              <h2 id="emergency-modal-title" className="text-2xl sm:text-3xl font-black text-[#1F1B16]">
                {t.emergencyTitle}
              </h2>
              <p className="text-sm font-semibold text-[#5E564D]">{t.emergencyHelper}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="w-12 h-12 rounded-[12px] border-2 border-[#E5DACF] bg-[#FFF8EF] hover:bg-[#FEE2E2] flex items-center justify-center text-[#1F1B16] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D62828]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3">
          {emergencyPhrases.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onClose();
                speak(item.text, { category: 'emergency' });
              }}
              className="w-full min-h-[64px] bg-[#FEE2E2] hover:bg-[#FCD2D2] border-2 border-[#D62828] text-[#991B1B] rounded-[12px] p-4 text-left font-black text-xl sm:text-2xl flex items-center justify-between gap-4 transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#D62828]"
            >
              <span>{item.text}</span>
              <PhoneCall className="w-6 h-6 shrink-0 text-[#D62828]" />
            </button>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t-2 border-[#E5DACF] flex justify-end">
          <Button variant="secondary" size="normal" onClick={onClose}>
            {t.close}
          </Button>
        </div>
      </div>
    </div>
  );
};
