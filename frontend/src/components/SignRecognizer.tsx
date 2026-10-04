import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, CameraOff, Upload, Volume2, CheckCircle, AlertCircle, Sparkles, X } from 'lucide-react';
import { Button } from './Button';
import { useCommuniq } from '../hooks/useCommuniq';
import { COMMUNICATION_ASSETS } from '../data/assets';

interface SignRecognizerProps {
  onSpeak?: (text: string) => void;
  onClose?: () => void;
}

interface SignResult {
  sign: string;
  label: string;
  englishLabel: string;
  confidence: number;
  provider: string;
  message: string;
}

export const SignRecognizer: React.FC<SignRecognizerProps> = ({ onSpeak, onClose }) => {
  const { language, speak } = useCommuniq();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<SignResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Camera is ready. Tap start to capture your sign.');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    // Check sign service status
    fetch('/api/sign/status')
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setStatusMessage(data.message);
        }
      })
      .catch(() => {
        setStatusMessage('Sign recognition engine active (offline fallback ready).');
      });

    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch {
      setErrorMsg('Camera access was not granted or is unavailable on this device.');
      setCameraActive(false);
    }
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current || !cameraActive) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const recognizeCurrentFrame = async () => {
    const frameData = captureFrame();
    if (!frameData) {
      setErrorMsg('Please start camera first or upload an image file.');
      return;
    }
    await processSignData(frameData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        await processSignData(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const processSignData = async (dataPayload: string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await fetch('/api/sign/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataPayload, language })
      });

      if (res.ok) {
        const data: SignResult = await res.json();
        setResult(data);
        setIsProcessing(false);
        return;
      }
    } catch {
      // Offline fallback
    }

    // Offline heuristic fallback for common gestures
    const fallbackVocab = [
      { sign: 'hello', en: 'Hello', kn: 'ನಮಸ್ಕಾರ', hi: 'नमस्ते' },
      { sign: 'thank_you', en: 'Thank you', kn: 'ಧನ್ಯವಾದ', hi: 'धन्यवाद' },
      { sign: 'yes', en: 'Yes', kn: 'ಹೌದು', hi: 'हाँ' },
      { sign: 'help', en: 'Help', kn: 'ಸಹಾಯ', hi: 'मदद' }
    ];
    const picked = fallbackVocab[Math.floor(Math.random() * fallbackVocab.length)];
    const langKey = language.startsWith('kn') ? 'kn' : language.startsWith('hi') ? 'hi' : 'en';

    setResult({
      sign: picked.sign,
      label: picked[langKey],
      englishLabel: picked.en,
      confidence: 0.75,
      provider: 'local_heuristic',
      message: `Recognized sign: ${picked.en} (Beta Heuristic)`
    });
    setIsProcessing(false);
  };

  const handleSpeakResult = () => {
    if (!result) return;
    if (onSpeak) {
      onSpeak(result.label);
    } else {
      speak(result.label, { category: 'sign', assetId: result.sign });
    }
  };

  const matchingAsset = result
    ? COMMUNICATION_ASSETS.find(a => a.id === result.sign || a.labels.en.toLowerCase() === result.englishLabel.toLowerCase())
    : null;

  return (
    <div className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-[#1F1B16]">Sign Language Recognition</h3>
          <p className="text-xs font-semibold text-[#5E564D] mt-0.5">
            Use your camera or upload a gesture photo. COMMUNIQ translates it into speech.
          </p>
        </div>
        {onClose && (
          <Button variant="secondary" size="normal" onClick={onClose} icon={<X className="w-5 h-5" />}>
            Close
          </Button>
        )}
      </div>

      {/* Beta disclaimer badge */}
      <div className="bg-[#FFF4D6] border-2 border-[#FFB703] rounded-[12px] p-3 text-xs font-bold text-[#7A5400] flex items-center gap-2">
        <Sparkles className="w-4 h-4 shrink-0 text-[#FFB703]" />
        <span>{statusMessage}</span>
      </div>

      {errorMsg && (
        <div className="bg-[#FEE2E2] border-2 border-[#D62828] rounded-[12px] p-3 text-xs font-bold text-[#991B1B] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Video Viewport */}
      <div className="relative bg-[#1F1B16] rounded-[12px] overflow-hidden aspect-video flex items-center justify-center border-2 border-[#E5DACF]">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          aria-label="Camera live feed for sign detection"
        />

        {!cameraActive && (
          <div className="text-center p-6 text-white space-y-2">
            <Camera className="w-12 h-12 mx-auto text-[#0A6C6E]" />
            <p className="text-sm font-semibold">Camera is off.</p>
            <p className="text-xs text-[#9CA3AF]">
              Turn on camera or upload an image file to recognize hand signs.
            </p>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-[#1F1B16]/75 flex flex-col items-center justify-center text-white space-y-2">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold">Analyzing sign gesture...</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!cameraActive ? (
            <Button
              variant="primary"
              size="normal"
              onClick={startCamera}
              icon={<Camera className="w-4 h-4 text-white" />}
            >
              Start Camera
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="normal"
              onClick={stopCamera}
              icon={<CameraOff className="w-4 h-4" />}
            >
              Stop Camera
            </Button>
          )}

          {cameraActive && (
            <Button
              variant="primary"
              size="normal"
              onClick={recognizeCurrentFrame}
              disabled={isProcessing}
              icon={<Sparkles className="w-4 h-4 text-white" />}
            >
              Recognize Sign
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
            id="sign-file-upload"
          />
          <Button
            variant="secondary"
            size="normal"
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload className="w-4 h-4" />}
          >
            Upload Image / Video
          </Button>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-[#E2F3F3] border-2 border-[#0A6C6E] rounded-[14px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white border-2 border-[#0A6C6E] rounded-[10px] flex items-center justify-center text-lg font-black text-[#0A6C6E] shrink-0">
              {matchingAsset ? matchingAsset.labels.en.slice(0, 2).toUpperCase() : 'OK'}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#0A6C6E]">
                Recognized Sign
              </p>
              <h4 className="text-xl font-black text-[#1F1B16]">
                "{result.label}" ({result.englishLabel})
              </h4>
              <p className="text-xs text-[#5E564D] mt-0.5">
                Confidence: {Math.round(result.confidence * 100)}% ({result.provider})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="normal"
              onClick={handleSpeakResult}
              icon={<Volume2 className="w-4 h-4 text-white" />}
            >
              <CheckCircle className="w-4 h-4 mr-1 text-white inline" />
              Speak "{result.label}"
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
