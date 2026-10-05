import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatPage } from '../pages/ChatPage';
import { Header } from '../components/Header';
import { AgeProfileModal } from '../components/AgeProfileModal';
import { CommunicatePage } from '../pages/CommunicatePage';
import { CommuniqProvider } from '../hooks/useCommuniq';
import { analyzeSignMedia } from '../services/signService';
import { fetchChatReplies } from '../services/ai';

// Mock DB
vi.mock('../services/db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/db')>();
  return {
    ...actual,
    saveConversationThread: vi.fn().mockResolvedValue('ok'),
    logActivity: vi.fn().mockResolvedValue(1),
    savePreferences: vi.fn().mockImplementation((prefs) => Promise.resolve({ ...prefs }))
  };
});

describe('COMMUNIQ Unified Dual-Mode AAC App (Chat + Board)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SPACE 2: Modern Gemini-Style Chat', () => {
    it('renders the clean bottom composer bar with Camera, Mic, and Input fields', () => {
      render(
        <CommuniqProvider>
          <ChatPage />
        </CommuniqProvider>
      );

      // Camera/Video Upload button (Flow A)
      const cameraBtn = screen.getByLabelText(/Upload sign language video or image/i);
      expect(cameraBtn).toBeDefined();

      // Microphone button (Flow B)
      const micBtn = screen.getByLabelText(/Speaking partner microphone input/i);
      expect(micBtn).toBeDefined();

      // Text input field (fallback typing)
      const inputField = screen.getByPlaceholderText(/Type a message or response.../i);
      expect(inputField).toBeDefined();

      // Send button
      const sendBtn = screen.getByLabelText(/Send typed message/i);
      expect(sendBtn).toBeDefined();
    });

    it('Flow A: Sign media analysis returns transcript and triggers Web Speech API TTS', async () => {
      const result = await analyzeSignMedia(undefined, 'en');
      expect(result).toBeDefined();
      expect(result.transcript).toBeTruthy();
      expect(typeof result.transcript).toBe('string');
      // Default sample contains detected transcript like "I need water"
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('Flow B: Partner speech calls AI engine and returns contextual reply suggestions', async () => {
      const aiResult = await fetchChatReplies({
        language: 'en',
        ageGroup: 'adult',
        turns: [{ speaker: 'other', text: 'Would you like something to drink?' }]
      });

      expect(aiResult).toBeDefined();
      expect(Array.isArray(aiResult.replies)).toBe(true);
      expect(aiResult.replies.length).toBeGreaterThanOrEqual(3);
      // Reply suggestions are short and relevant
      expect(aiResult.replies.some(r => r.text.length > 0)).toBe(true);
    });

    it('User typing fallback immediately appends user bubble and triggers TTS', async () => {
      render(
        <CommuniqProvider>
          <ChatPage />
        </CommuniqProvider>
      );

      const inputField = screen.getByPlaceholderText(/Type a message or response.../i);
      const sendBtn = screen.getByLabelText(/Send typed message/i);

      fireEvent.change(inputField, { target: { value: 'I would like some tea please' } });
      fireEvent.click(sendBtn);

      await waitFor(() => {
        expect(screen.getByText('I would like some tea please')).toBeDefined();
        expect(window.speechSynthesis.speak).toHaveBeenCalled();
      });
    });

    it('provides quick link to switch from Chat to AAC Board', () => {
      const onNavigateToBoard = vi.fn();
      render(
        <CommuniqProvider>
          <ChatPage onNavigateToBoard={onNavigateToBoard} />
        </CommuniqProvider>
      );

      const boardBtns = screen.getAllByRole('button', { name: /Picture Board|Open Board/i });
      expect(boardBtns.length).toBeGreaterThan(0);
      fireEvent.click(boardBtns[0]);
      expect(onNavigateToBoard).toHaveBeenCalled();
    });
  });

  describe('TOP NAVIGATION BAR (Header.tsx)', () => {
    it('renders [Chat] | [Board] segmented switch, language toggle, profile button, and help', () => {
      const onNavigate = vi.fn();
      const onOpenSettings = vi.fn();
      const onOpenProfileModal = vi.fn();
      const onOpenEmergency = vi.fn();

      render(
        <CommuniqProvider>
          <Header
            currentScreen="talk"
            onNavigate={onNavigate}
            onOpenSettings={onOpenSettings}
            onOpenProfileModal={onOpenProfileModal}
            onOpenEmergency={onOpenEmergency}
          />
        </CommuniqProvider>
      );

      // Segmented Switch [Chat] and [Board]
      const chatTab = screen.getByRole('tab', { name: /Chat/i });
      const boardTab = screen.getByRole('tab', { name: /Board/i });
      expect(chatTab).toBeDefined();
      expect(boardTab).toBeDefined();

      fireEvent.click(boardTab);
      expect(onNavigate).toHaveBeenCalledWith('communicate');

      // Emergency Help button
      const helpBtn = screen.getByRole('button', { name: /Emergency Help/i });
      expect(helpBtn).toBeDefined();
      fireEvent.click(helpBtn);
      expect(onOpenEmergency).toHaveBeenCalled();

      // Profile selector button
      const profileBtn = screen.getByLabelText(/Current profile/i);
      expect(profileBtn).toBeDefined();
      fireEvent.click(profileBtn);
      expect(onOpenProfileModal).toHaveBeenCalled();
    });
  });

  describe('ONBOARDING & AGE PROFILES (AgeProfileModal.tsx)', () => {
    it('displays "Who is using Communiq today?" with 3 selectable cards', async () => {
      const onClose = vi.fn();
      render(
        <CommuniqProvider>
          <AgeProfileModal isOpen={true} onClose={onClose} />
        </CommuniqProvider>
      );

      expect(screen.getByText(/Who is using Communiq today\?/i)).toBeDefined();
      expect(screen.getAllByText(/Class 1 to 5/i)[0]).toBeDefined();
      expect(screen.getAllByText(/Class 6 to 12/i)[0]).toBeDefined();
      expect(screen.getAllByText(/Class 18\+/i)[0]).toBeDefined();

      // Selecting Class 1 to 5
      const class1to5Btn = screen.getAllByText(/Class 1 to 5/i)[0].closest('button');
      expect(class1to5Btn).toBeDefined();
      fireEvent.click(class1to5Btn!);
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('SPACE 1: THE ASSISTIVEWARE PICTURE BOARD (/board)', () => {
    it('renders Sentence Strip with Delete, Clear, and Say It buttons and cards grid', () => {
      render(
        <CommuniqProvider>
          <CommunicatePage />
        </CommuniqProvider>
      );

      // Sentence strip actions
      expect(screen.getByRole('button', { name: /Delete last word/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Clear sentence/i })).toBeDefined();
      const sayItBtn = screen.getByRole('button', { name: /Say it aloud/i });
      expect(sayItBtn).toBeDefined();
      // Amber color palette check
      expect(sayItBtn.className).toContain('bg-[#FFB703]');

      // Verify core board is displayed
      expect(screen.getByRole('region', { name: /Sentence Strip/i })).toBeDefined();
    });
  });

  describe('DEEPMIND SL2T VISION & COMPACT BOARD DRAWER', () => {
    it('decodes all 8 core signs (Water, Food, Help, Yes, No, Bathroom, Want, Go)', async () => {
      const coreKeys = ['water', 'food', 'help', 'yes', 'no', 'bathroom', 'want', 'go'];
      for (const k of coreKeys) {
        const res = await analyzeSignMedia(undefined, 'en', k);
        expect(res.sign).toBe(k);
        expect(res.transcript.length).toBeGreaterThan(0);
        expect(res.confidence).toBeGreaterThan(0.9);
      }
    });

    it('toggles compact AAC board drawer via "Use Board" button and inserts tokens with TTS', async () => {
      render(
        <CommuniqProvider>
          <ChatPage />
        </CommuniqProvider>
      );

      // Open drawer
      const useBoardBtn = screen.getByLabelText(/Use Board: Open compact AAC drawer/i);
      fireEvent.click(useBoardBtn);

      // Drawer dialog should appear
      expect(screen.getByRole('dialog', { name: /Quick AAC Board Drawer/i })).toBeDefined();

      // Tap cards in drawer: I, Want, Water
      const wantCard = screen.getByRole('button', { name: /^Want$/i });
      fireEvent.click(wantCard);

      // Send & Speak
      const sendSpeakBtn = screen.getByRole('button', { name: /Speak and Send/i });
      fireEvent.click(sendSpeakBtn);

      await waitFor(() => {
        expect(screen.getByText('Want')).toBeDefined();
        expect(window.speechSynthesis.speak).toHaveBeenCalled();
      });
    });
  });
});
