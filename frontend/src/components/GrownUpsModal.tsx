/* oxlint-disable react/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react';
import { useCommuniq } from '../hooks/useCommuniq';
import {
  CustomCardRecord,
  getCustomCards,
  saveCustomCard,
  deleteCustomCard,
  exportBoardJson,
  importBoardJson,
  clearAllUserData,
  generateSalt,
  hashPin
} from '../services/db';
import { WordClass } from '../data/palette';
import { CATEGORY_FOLDERS } from '../data/coreBoard';
import { Button } from './Button';
import { ShieldCheck, Plus, Trash2, Download, Upload, X, Lock, Check } from 'lucide-react';

interface GrownUpsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GrownUpsModal: React.FC<GrownUpsModalProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences } = useCommuniq();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [lockRemaining, setLockRemaining] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'levels' | 'cards' | 'backup'>('levels');

  // Custom cards state
  const [customCardsList, setCustomCardsList] = useState<CustomCardRecord[]>([]);
  const [isAddingCard, setIsAddingCard] = useState<boolean>(false);
  const [newCardEn, setNewCardEn] = useState<string>('');
  const [newCardKn, setNewCardKn] = useState<string>('');
  const [newCardHi, setNewCardHi] = useState<string>('');
  const [newCardType, setNewCardType] = useState<WordClass>('noun');
  const [newCardFolder, setNewCardFolder] = useState<string>('things');
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [backupStatus, setBackupStatus] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadCards = async () => {
    const list = await getCustomCards();
    setCustomCardsList(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadCards();
      setPinInput('');
      setNewPin('');
      setConfirmPin('');
      setPinError('');
    } else {
      setIsAuthenticated(false);
      setPinInput('');
      setPinError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      if (preferences.pinLockUntil && preferences.pinLockUntil > Date.now()) {
        setLockRemaining(Math.ceil((preferences.pinLockUntil - Date.now()) / 1000));
      } else {
        setLockRemaining(0);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isOpen, preferences.pinLockUntil]);

  if (!isOpen) return null;

  const handleCreatePin = async () => {
    if (newPin.length !== 4) {
      setPinError('PIN must be exactly 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PINs do not match. Please re-enter.');
      return;
    }
    const salt = generateSalt();
    const hash = await hashPin(newPin, salt);
    await updatePreferences({
      pinSalt: salt,
      pinHash: hash,
      failedPinAttempts: 0,
      pinLockUntil: 0
    });
    setIsAuthenticated(true);
    setPinError('');
  };

  const handleVerifyPin = async () => {
    if (lockRemaining > 0) return;
    if (!preferences.pinHash || !preferences.pinSalt) {
      setIsAuthenticated(true);
      return;
    }
    const enteredHash = await hashPin(pinInput, preferences.pinSalt);
    if (enteredHash === preferences.pinHash) {
      await updatePreferences({ failedPinAttempts: 0, pinLockUntil: 0 });
      setIsAuthenticated(true);
      setPinError('');
    } else {
      const failed = (preferences.failedPinAttempts || 0) + 1;
      if (failed >= 5) {
        const lockUntil = Date.now() + 30000;
        await updatePreferences({ failedPinAttempts: 0, pinLockUntil: lockUntil });
        setLockRemaining(30);
        setPinError('Locked for 30 seconds after 5 incorrect attempts.');
      } else {
        await updatePreferences({ failedPinAttempts: failed });
        setPinError(`Incorrect PIN. ${5 - failed} attempt(s) remaining before 30-second lockout.`);
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPhotoDataUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCard = async () => {
    if (!newCardEn.trim()) return;

    const newRecord: CustomCardRecord = {
      id: `custom_${Date.now()}`,
      labels: {
        en: newCardEn.trim(),
        kn: newCardKn.trim() || newCardEn.trim(),
        hi: newCardHi.trim() || newCardEn.trim()
      },
      spokenText: {
        en: newCardEn.trim(),
        kn: newCardKn.trim() || newCardEn.trim(),
        hi: newCardHi.trim() || newCardEn.trim()
      },
      wordClass: newCardType,
      folderId: newCardFolder,
      photoDataUrl: photoDataUrl || undefined,
      svgIcon: 'cart',
      createdAt: Date.now()
    };

    await saveCustomCard(newRecord);
    await loadCards();

    // Reset form
    setNewCardEn('');
    setNewCardKn('');
    setNewCardHi('');
    setPhotoDataUrl('');
    setIsAddingCard(false);
  };

  const handleDeleteCard = async (id: string) => {
    await deleteCustomCard(id);
    await loadCards();
  };

  const handleExportJson = async () => {
    const json = await exportBoardJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `communiq_board_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupStatus('Board exported successfully.');
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      try {
        const count = await importBoardJson(text);
        await loadCards();
        setBackupStatus(`Imported ${count} cards successfully.`);
      } catch {
        setBackupStatus('Failed to parse JSON file.');
      }
    }
  };

  const handleDeleteAllData = async () => {
    const confirmed = window.confirm('Are you sure you want to delete all activity logs and custom cards from this device?');
    if (confirmed) {
      await clearAllUserData();
      await loadCards();
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="grownups-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60"
    >
      <div className="w-full max-w-2xl bg-white border-2 border-[#0A6C6E] rounded-[16px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#E2F3F3] border-b-2 border-[#E5DACF] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#0A6C6E]" />
            <h2 id="grownups-title" className="text-lg sm:text-xl font-black text-[#1F1B16]">
              Grown-ups Area
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Grown-ups modal"
            className="w-9 h-9 rounded-[10px] border border-[#E5DACF] bg-white flex items-center justify-center text-[#5E564D] hover:text-[#1F1B16] hover:border-[#1F1B16] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          !preferences.pinHash ? (
            /* First-time PIN Setup Screen */
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-[12px] bg-[#FFF8EF] border-2 border-[#E5DACF] flex items-center justify-center mx-auto text-[#0A6C6E]">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1F1B16]">
                  Set Up Grown-ups PIN
                </h3>
                <p className="text-xs sm:text-sm text-[#5E564D] mt-1 max-w-md mx-auto">
                  Create a 4-digit PIN. Only a salted hash is stored on this device.
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F1B16] mb-1 text-left">
                    Enter New 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="****"
                    aria-label="Enter new 4-digit PIN"
                    className="w-full h-11 text-center text-xl font-black tracking-widest bg-white border-2 border-[#E5DACF] rounded-[10px] focus:border-[#0A6C6E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F1B16] mb-1 text-left">
                    Confirm 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreatePin(); }}
                    placeholder="****"
                    aria-label="Confirm 4-digit PIN"
                    className="w-full h-11 text-center text-xl font-black tracking-widest bg-white border-2 border-[#E5DACF] rounded-[10px] focus:border-[#0A6C6E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E]"
                  />
                </div>
                {pinError && (
                  <p className="text-xs font-bold text-[#D62828] mt-1">
                    {pinError}
                  </p>
                )}
              </div>

              <div className="bg-[#FFF8EF] border border-[#E5DACF] rounded-[8px] p-2.5 max-w-md mx-auto text-[11px] text-[#5E564D]">
                Notice: This PIN only prevents accidental changes by a child and is not strong security. To reset if forgotten, clear app data in browser settings.
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleCreatePin}>
                  Create PIN
                </Button>
              </div>
            </div>
          ) : (
            /* PIN Entry Screen */
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-[12px] bg-[#FFF8EF] border-2 border-[#E5DACF] flex items-center justify-center mx-auto text-[#0A6C6E]">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1F1B16]">
                  Caregiver Verification
                </h3>
                <p className="text-xs sm:text-sm text-[#5E564D] mt-1">
                  Enter your 4-digit PIN to access Grown-ups controls.
                </p>
              </div>

              {lockRemaining > 0 && (
                <div className="p-2.5 bg-[#FFE5E5] border border-[#D62828] rounded-[8px] max-w-xs mx-auto text-xs font-bold text-[#D62828]">
                  Locked for {lockRemaining} seconds after 5 incorrect attempts.
                </div>
              )}

              <div className="max-w-xs mx-auto">
                <input
                  type="password"
                  maxLength={4}
                  disabled={lockRemaining > 0}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleVerifyPin(); }}
                  placeholder="****"
                  aria-label="Enter 4-digit PIN"
                  className="w-full h-12 text-center text-2xl font-black tracking-widest bg-white border-2 border-[#E5DACF] rounded-[10px] focus:border-[#0A6C6E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0A6C6E] disabled:bg-[#F3ECE1] disabled:cursor-not-allowed"
                />
                {pinError && lockRemaining === 0 && (
                  <p className="text-xs font-bold text-[#D62828] mt-2">
                    {pinError}
                  </p>
                )}
              </div>

              <div className="bg-[#FFF8EF] border border-[#E5DACF] rounded-[8px] p-2.5 max-w-md mx-auto text-[11px] text-[#5E564D]">
                Notice: This PIN only prevents accidental changes by a child and is not strong security. To reset if forgotten, clear app data in browser settings.
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleVerifyPin} disabled={lockRemaining > 0}>
                  Unlock Settings
                </Button>
              </div>
            </div>
          )
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Nav Tabs */}
            <div className="flex border-b-2 border-[#E5DACF] gap-2 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('levels')}
                className={`px-3 py-1.5 rounded-[8px] font-bold text-xs sm:text-sm cursor-pointer ${
                  activeTab === 'levels'
                    ? 'bg-[#0A6C6E] text-white'
                    : 'bg-[#FFF8EF] text-[#5E564D] hover:bg-[#E5DACF]'
                }`}
              >
                Levels & Layout
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cards')}
                className={`px-3 py-1.5 rounded-[8px] font-bold text-xs sm:text-sm cursor-pointer ${
                  activeTab === 'cards'
                    ? 'bg-[#0A6C6E] text-white'
                    : 'bg-[#FFF8EF] text-[#5E564D] hover:bg-[#E5DACF]'
                }`}
              >
                Custom Cards ({customCardsList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('backup')}
                className={`px-3 py-1.5 rounded-[8px] font-bold text-xs sm:text-sm cursor-pointer ${
                  activeTab === 'backup'
                    ? 'bg-[#0A6C6E] text-white'
                    : 'bg-[#FFF8EF] text-[#5E564D] hover:bg-[#E5DACF]'
                }`}
              >
                Backup & Privacy
              </button>
            </div>

            {/* TAB 1: Levels & Layout */}
            {activeTab === 'levels' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-black text-[#1F1B16] mb-1">
                    Vocabulary Level
                  </label>
                  <p className="text-xs text-[#5E564D] mb-2">
                    Controls how many cards are visible. Slots remain fixed so motor memory is never broken.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { level: 1, title: 'Level 1', desc: '9 core cards (3x3)' },
                      { level: 2, title: 'Level 2', desc: 'About 20 cards' },
                      { level: 3, title: 'Level 3', desc: 'Full core board' }
                    ].map((lvl) => (
                      <button
                        key={lvl.level}
                        type="button"
                        onClick={() => updatePreferences({ vocabLevel: lvl.level as 1 | 2 | 3 })}
                        className={`p-3 rounded-[10px] border-2 text-left cursor-pointer transition-transform active:scale-95 ${
                          preferences.vocabLevel === lvl.level
                            ? 'bg-[#E2F3F3] border-[#0A6C6E] text-[#0A6C6E] ring-2 ring-[#0A6C6E]'
                            : 'bg-white border-[#E5DACF] text-[#1F1B16] hover:border-[#0A6C6E]'
                        }`}
                      >
                        <span className="block font-black text-sm">{lvl.title}</span>
                        <span className="block text-[11px] text-[#5E564D] mt-0.5">{lvl.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-[#1F1B16] mb-1">
                    Grid Density
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'fewer', title: 'Fewer', desc: 'Larger buttons' },
                      { val: 'standard', title: 'Standard', desc: 'Balanced layout' },
                      { val: 'more', title: 'More', desc: 'Maximum cards visible' }
                    ].map((sz) => (
                      <button
                        key={sz.val}
                        type="button"
                        onClick={() => updatePreferences({ gridSize: sz.val as 'fewer' | 'standard' | 'more' })}
                        className={`p-3 rounded-[10px] border-2 text-left cursor-pointer transition-transform active:scale-95 ${
                          preferences.gridSize === sz.val
                            ? 'bg-[#E2F3F3] border-[#0A6C6E] text-[#0A6C6E] ring-2 ring-[#0A6C6E]'
                            : 'bg-white border-[#E5DACF] text-[#1F1B16] hover:border-[#0A6C6E]'
                        }`}
                      >
                        <span className="block font-black text-sm">{sz.title}</span>
                        <span className="block text-[11px] text-[#5E564D] mt-0.5">{sz.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Custom Cards */}
            {activeTab === 'cards' && (
              <div className="space-y-4">
                {!isAddingCard ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#5E564D]">
                        Personal cards for family members, favorite toys, or pets.
                      </span>
                      <Button
                        variant="primary"
                        size="normal"
                        onClick={() => setIsAddingCard(true)}
                        icon={<Plus className="w-4 h-4" />}
                      >
                        Add Custom Card
                      </Button>
                    </div>

                    {customCardsList.length === 0 ? (
                      <div className="p-8 text-center bg-[#FFF8EF] rounded-[12px] border-2 border-dashed border-[#E5DACF]">
                        <p className="text-sm font-bold text-[#5E564D]">
                          No custom cards added yet.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {customCardsList.map((card) => (
                          <div
                            key={card.id}
                            className="bg-white border-2 border-[#E5DACF] rounded-[10px] p-2 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              {card.photoDataUrl ? (
                                <img
                                  src={card.photoDataUrl}
                                  alt={card.labels.en}
                                  className="w-10 h-10 rounded-[6px] object-cover shrink-0 border border-[#E5DACF]"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-[6px] bg-[#E2F3F3] flex items-center justify-center font-black text-[#0A6C6E] text-xs">
                                  {card.labels.en.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="block text-xs font-black text-[#1F1B16] truncate">
                                  {card.labels.en}
                                </span>
                                <span className="block text-[10px] text-[#5E564D] truncate">
                                  {card.folderId}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteCard(card.id)}
                              aria-label={`Delete ${card.labels.en}`}
                              className="text-[#D62828] hover:bg-[#FFE5E5] p-1.5 rounded-[6px] cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  /* Add Custom Card Form */
                  <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[12px] p-4 space-y-3">
                    <h4 className="text-sm font-black text-[#1F1B16]">
                      New Custom Card
                    </h4>

                    {/* Privacy notice banner */}
                    <div className="bg-white border border-[#0A6C6E] rounded-[8px] p-2.5 text-xs text-[#063D3E] font-semibold">
                      Privacy notice: Photos and spoken text stay entirely on this device. They are never uploaded or shared.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-[#1F1B16] mb-1">
                          English Word *
                        </label>
                        <input
                          type="text"
                          value={newCardEn}
                          onChange={(e) => setNewCardEn(e.target.value)}
                          placeholder="e.g. Grandma"
                          className="w-full h-9 px-2.5 bg-white border border-[#E5DACF] rounded-[8px] text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1F1B16] mb-1">
                          Kannada (Optional)
                        </label>
                        <input
                          type="text"
                          value={newCardKn}
                          onChange={(e) => setNewCardKn(e.target.value)}
                          placeholder="e.g. ಅಜ್ಜಿ"
                          className="w-full h-9 px-2.5 bg-white border border-[#E5DACF] rounded-[8px] text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1F1B16] mb-1">
                          Hindi (Optional)
                        </label>
                        <input
                          type="text"
                          value={newCardHi}
                          onChange={(e) => setNewCardHi(e.target.value)}
                          placeholder="e.g. दादी"
                          className="w-full h-9 px-2.5 bg-white border border-[#E5DACF] rounded-[8px] text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-[#1F1B16] mb-1">
                          Word Type (determines color)
                        </label>
                        <select
                          value={newCardType}
                          onChange={(e) => setNewCardType(e.target.value as WordClass)}
                          className="w-full h-9 px-2 bg-white border border-[#E5DACF] rounded-[8px] text-xs font-bold"
                        >
                          <option value="noun">Noun (Orange)</option>
                          <option value="pronoun">Pronoun (Yellow)</option>
                          <option value="verb">Verb (Green)</option>
                          <option value="descriptor">Descriptor (Blue)</option>
                          <option value="social">Social & Response (Rose)</option>
                          <option value="question">Question (Teal)</option>
                          <option value="place_time">Place & Time (Sand)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1F1B16] mb-1">
                          Folder Location
                        </label>
                        <select
                          value={newCardFolder}
                          onChange={(e) => setNewCardFolder(e.target.value)}
                          className="w-full h-9 px-2 bg-white border border-[#E5DACF] rounded-[8px] text-xs font-bold"
                        >
                          {Object.values(CATEGORY_FOLDERS).map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.labels.en}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Photo upload */}
                    <div>
                      <label className="block text-xs font-bold text-[#1F1B16] mb-1">
                        Photo from device (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-[6px] file:border-0 file:bg-[#0A6C6E] file:text-white file:font-bold cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="secondary" size="normal" onClick={() => setIsAddingCard(false)}>
                        Cancel
                      </Button>
                      <Button variant="primary" size="normal" onClick={handleSaveCard} icon={<Check className="w-4 h-4" />}>
                        Save Card
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Backup & Privacy */}
            {activeTab === 'backup' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-black text-[#1F1B16] mb-1">
                    Export and Import Board Configuration
                  </h4>
                  <p className="text-xs text-[#5E564D] mb-3">
                    Backup all custom cards and level settings as a JSON file, or restore on another device.
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <Button variant="secondary" onClick={handleExportJson} icon={<Download className="w-4 h-4" />}>
                      Export Board as JSON
                    </Button>
                    <label className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[10px] border-2 border-[#E5DACF] bg-white text-[#1F1B16] hover:border-[#0A6C6E] font-bold text-xs cursor-pointer active:scale-95">
                      <Upload className="w-4 h-4 text-[#0A6C6E]" />
                      <span>Import Board from JSON</span>
                      <input
                        type="file"
                        accept="application/json"
                        onChange={handleImportJson}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {backupStatus && (
                    <p className="text-xs font-bold text-[#0A6C6E] mt-2">
                      {backupStatus}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t-2 border-[#E5DACF]">
                  <h4 className="text-sm font-black text-[#D62828] mb-1">
                    Delete All Data
                  </h4>
                  <p className="text-xs text-[#5E564D] mb-3">
                    Completely erases all saved phrases, custom photos, conversation logs, and resets settings to default.
                  </p>
                  <Button variant="emergency" onClick={handleDeleteAllData} icon={<Trash2 className="w-4 h-4" />}>
                    Delete All My Data
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
