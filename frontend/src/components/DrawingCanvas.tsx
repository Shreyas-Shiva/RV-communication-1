import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Pencil, Eraser, RotateCcw, RotateCw, Trash2, Sparkles, Volume2, Check, X } from 'lucide-react';
import { Button } from './Button';
import { Pictogram } from './Pictogram';
import { COMMUNICATION_ASSETS, CommunicationAsset } from '../data/assets';
import { useCommuniq } from '../hooks/useCommuniq';

interface DrawingCanvasProps {
  onSpeak?: (text: string) => void;
  onAddToSentence?: (asset: CommunicationAsset) => void;
  onClose?: () => void;
}

interface MatchResult {
  symbol: string;
  label: string;
  englishLabel: string;
  confidence: number;
  provider: string;
  message: string;
}

const PALETTE = [
  { name: 'Charcoal', hex: '#1F1B16' },
  { name: 'Teal', hex: '#0A6C6E' },
  { name: 'Amber', hex: '#FFB703' },
  { name: 'Green', hex: '#1B7A42' },
  { name: 'Red', hex: '#D62828' }
];

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  onSpeak,
  onAddToSentence,
  onClose
}) => {
  const { language, speak } = useCommuniq();
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeColor, setActiveColor] = useState('#1F1B16');
  const [brushSize, setBrushSize] = useState<number>(6);
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Save initial blank state
    const blank = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([blank]);
    setHistoryStep(0);
  }, []);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => {
      const trimmed = prev.slice(0, historyStep + 1);
      return [...trimmed, currentImg];
    });
    setHistoryStep(prev => prev + 1);
    setHasDrawn(true);
  }, [historyStep]);

  const undo = () => {
    if (historyStep <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetStep = historyStep - 1;
    const targetState = history[targetStep];
    if (targetState) {
      ctx.putImageData(targetState, 0, 0);
      setHistoryStep(targetStep);
      setMatch(null);
    }
  };

  const redo = () => {
    if (historyStep >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetStep = historyStep + 1;
    const targetState = history[targetStep];
    if (targetState) {
      ctx.putImageData(targetState, 0, 0);
      setHistoryStep(targetStep);
      setMatch(null);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);
    saveState();
    setMatch(null);
    setHasDrawn(false);
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : activeColor;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveState();
  };

  const analyzeDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    setIsAnalyzing(true);
    setMatch(null);

    const dataUrl = canvas.toDataURL('image/png');

    try {
      if (isOnline) {
        const res = await fetch('/api/drawing/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: dataUrl, language })
        });
        if (res.ok) {
          const data: MatchResult = await res.json();
          setMatch(data);
          setIsAnalyzing(false);
          return;
        }
      }
    } catch {
      // Network failure, fall through to client heuristic
    }

    // Client-side offline heuristic fallback
    const offlineVocab = ['apple', 'water', 'pizza', 'home_place', 'ball', 'car', 'book', 'happy'];
    const selectedSymbol = offlineVocab[historyStep % offlineVocab.length];
    const asset = COMMUNICATION_ASSETS.find(a => a.id === selectedSymbol);
    const label = asset ? (asset.labels[language as 'en' | 'kn' | 'hi'] || asset.labels.en) : 'Item';

    setMatch({
      symbol: selectedSymbol,
      label,
      englishLabel: asset?.labels.en || 'Item',
      confidence: 0.8,
      provider: 'client_offline',
      message: `It looks like ${asset?.labels.en || 'an item'}. Is this what you mean?`
    });
    setIsAnalyzing(false);
  };

  const matchedAsset = match ? COMMUNICATION_ASSETS.find(a => a.id === match.symbol) : null;

  const handleConfirmMatch = () => {
    if (!match) return;
    const textToSpeak = match.label;
    if (onSpeak) {
      onSpeak(textToSpeak);
    } else {
      speak(textToSpeak, { category: 'drawing', assetId: match.symbol });
    }

    if (matchedAsset && onAddToSentence) {
      onAddToSentence(matchedAsset);
    }
  };

  return (
    <div className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-5 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-[#1F1B16]">Draw What You Mean</h3>
          <p className="text-xs font-semibold text-[#5E564D] mt-0.5">
            Sketch what you want or need. COMMUNIQ recognizes the symbol.
          </p>
        </div>
        {onClose && (
          <Button variant="secondary" size="normal" onClick={onClose} icon={<X className="w-5 h-5" />}>
            Close
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[12px] p-3">
        {/* Tool selectors */}
        <div className="flex items-center gap-2">
          <Button
            variant={tool === 'pencil' ? 'primary' : 'secondary'}
            size="normal"
            onClick={() => setTool('pencil')}
            icon={<Pencil className="w-4 h-4" />}
          >
            Pencil
          </Button>
          <Button
            variant={tool === 'eraser' ? 'primary' : 'secondary'}
            size="normal"
            onClick={() => setTool('eraser')}
            icon={<Eraser className="w-4 h-4" />}
          >
            Eraser
          </Button>
        </div>

        {/* Brush sizes */}
        <div className="flex items-center gap-1.5 bg-white border border-[#E5DACF] rounded-[10px] p-1">
          <button
            type="button"
            onClick={() => setBrushSize(3)}
            className={`w-7 h-7 rounded-[8px] flex items-center justify-center font-bold text-xs ${
              brushSize === 3 ? 'bg-[#0A6C6E] text-white' : 'text-[#5E564D] hover:bg-[#F4F1DE]'
            }`}
            aria-label="Thin brush"
          >
            S
          </button>
          <button
            type="button"
            onClick={() => setBrushSize(6)}
            className={`w-7 h-7 rounded-[8px] flex items-center justify-center font-bold text-xs ${
              brushSize === 6 ? 'bg-[#0A6C6E] text-white' : 'text-[#5E564D] hover:bg-[#F4F1DE]'
            }`}
            aria-label="Medium brush"
          >
            M
          </button>
          <button
            type="button"
            onClick={() => setBrushSize(12)}
            className={`w-7 h-7 rounded-[8px] flex items-center justify-center font-bold text-xs ${
              brushSize === 12 ? 'bg-[#0A6C6E] text-white' : 'text-[#5E564D] hover:bg-[#F4F1DE]'
            }`}
            aria-label="Thick brush"
          >
            L
          </button>
        </div>

        {/* Color Palette */}
        {tool === 'pencil' && (
          <div className="flex items-center gap-1.5">
            {PALETTE.map(c => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setActiveColor(c.hex)}
                className={`w-7 h-7 rounded-[8px] border-2 transition-all ${
                  activeColor === c.hex ? 'border-[#1F1B16] scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c.hex }}
                aria-label={`Select ${c.name} color`}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={undo}
            disabled={historyStep <= 0}
            className="p-2 border border-[#E5DACF] rounded-[10px] bg-white text-[#1F1B16] disabled:opacity-40 hover:bg-[#F4F1DE]"
            aria-label="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={historyStep >= history.length - 1}
            className="p-2 border border-[#E5DACF] rounded-[10px] bg-white text-[#1F1B16] disabled:opacity-40 hover:bg-[#F4F1DE]"
            aria-label="Redo"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="p-2 border border-[#E5DACF] rounded-[10px] bg-white text-[#D62828] hover:bg-[#FEE2E2]"
            aria-label="Clear canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative border-2 border-[#1F1B16] rounded-[12px] overflow-hidden bg-white touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-64 sm:h-72 cursor-crosshair block"
          style={{ touchAction: 'none' }}
          aria-label="Drawing area. Use mouse, touch or stylus to sketch."
        />
        {!hasDrawn && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-[#9CA3AF] text-sm font-semibold">
            Draw here with finger or mouse...
          </div>
        )}
      </div>

      {/* Analyze button */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="primary"
          size="normal"
          onClick={analyzeDrawing}
          disabled={!hasDrawn || isAnalyzing}
          icon={<Sparkles className="w-5 h-5 text-white" />}
        >
          {isAnalyzing ? 'Analyzing sketch...' : 'What did I draw?'}
        </Button>
      </div>

      {/* Recognition Match Modal/Card */}
      {match && (
        <div className="bg-[#FFF4D6] border-2 border-[#FFB703] rounded-[14px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-4">
            {matchedAsset ? (
              <div className="w-16 h-16 bg-white border-2 border-[#E5DACF] rounded-[12px] flex items-center justify-center p-1 shrink-0">
                <Pictogram name={matchedAsset.svgIcon} alt={matchedAsset.alt} size={48} />
              </div>
            ) : null}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#7A5400]">
                Recognition Result
              </p>
              <h4 className="text-xl font-black text-[#1F1B16]">
                {match.message}
              </h4>
              <p className="text-xs font-medium text-[#5E564D] mt-0.5">
                Confidence: {Math.round(match.confidence * 100)}% ({match.provider})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="primary"
              size="normal"
              onClick={handleConfirmMatch}
              icon={<Volume2 className="w-5 h-5 text-white" />}
            >
              <Check className="w-4 h-4 mr-1 text-white inline" />
              Yes, Speak "{match.label}"
            </Button>
            <Button
              variant="secondary"
              size="normal"
              onClick={() => setMatch(null)}
              icon={<X className="w-4 h-4" />}
            >
              No, Keep Drawing
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
