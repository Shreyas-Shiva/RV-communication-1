import React, { useState, useRef } from 'react';
import { Camera, Download, Trash2, CheckCircle2, ShieldCheck, Hand } from 'lucide-react';
import { Button } from '../components/Button';

interface SignSample {
  id: string;
  sign: string;
  timestamp: number;
  width: number;
  height: number;
  dataLength: number;
}

const TARGET_SIGNS = [
  { id: 'hello', name: 'Hello', description: 'Open palm facing forward, slight wave' },
  { id: 'yes', name: 'Yes', description: 'Closed fist bobbing up and down gently' },
  { id: 'no', name: 'No', description: 'Index and middle fingers snapping to thumb' },
  { id: 'thank_you', name: 'Thank You', description: 'Flat hand moving from chin outwards' },
  { id: 'help', name: 'Help', description: 'Closed fist resting atop flat upward palm' },
  { id: 'water', name: 'Water', description: 'Three fingers (W sign) tapping chin or mouth' },
  { id: 'please', name: 'Please', description: 'Flat palm circling clockwise over chest' }
];

export const SignLabPage: React.FC = () => {
  const [selectedSign, setSelectedSign] = useState<string>('hello');
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [samples, setSamples] = useState<SignSample[]>([]);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [lastCapturedPreview, setLastCapturedPreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = async () => {
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
      alert('Camera access could not be acquired.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureSample = () => {
    if (!consentGiven) {
      alert('Please check the consent box to record local samples.');
      return;
    }
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
    setLastCapturedPreview(dataUrl);

    const newSample: SignSample = {
      id: `sample-${Date.now()}`,
      sign: selectedSign,
      timestamp: Date.now(),
      width: canvas.width,
      height: canvas.height,
      dataLength: dataUrl.length
    };

    setSamples(prev => [...prev, newSample]);
  };

  const exportDataset = () => {
    const dataset = {
      appName: 'COMMUNIQ Sign Dataset',
      exportedAt: new Date().toISOString(),
      sampleCount: samples.length,
      signsCovered: TARGET_SIGNS.map(s => ({
        id: s.id,
        count: samples.filter(item => item.sign === s.id).length
      })),
      samples
    };

    const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `communiq-sign-dataset-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllSamples = () => {
    if (confirm('Clear all locally collected samples?')) {
      setSamples([]);
      setLastCapturedPreview(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Title */}
      <div className="bg-white border-2 border-[#E5DACF] rounded-[16px] p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E2F3F3] border-2 border-[#0A6C6E] rounded-[10px] flex items-center justify-center text-[#0A6C6E]">
            <Hand className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1F1B16]">COMMUNIQ Sign Lab</h1>
            <p className="text-sm font-semibold text-[#0A6C6E]">
              Deaf and Hard of Hearing AAC Sign Dataset Collection Tool
            </p>
          </div>
        </div>
      </div>

      {/* Consent Box */}
      <div className="bg-[#FFF8EF] border-2 border-[#E5DACF] rounded-[14px] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#1B7A42]" />
          <h2 className="text-base font-bold text-[#1F1B16]">Signer Privacy and Consent</h2>
        </div>
        <p className="text-xs text-[#5E564D] leading-relaxed">
          Samples recorded here remain in your browser memory and IndexedDB. Nothing is uploaded to remote servers or third-party cloud services without your explicit export. You own your gesture data.
        </p>
        <label className="flex items-start gap-3 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded-[6px] border-2 border-[#0A6C6E] text-[#0A6C6E] focus:ring-0"
          />
          <span className="text-sm font-bold text-[#1F1B16]">
            I consent to recording local gesture samples on this device for training COMMUNIQ sign models.
          </span>
        </label>
      </div>

      {/* Sign Selector */}
      <div className="bg-white border-2 border-[#E5DACF] rounded-[14px] p-5 space-y-3">
        <h2 className="text-base font-bold text-[#1F1B16]">1. Select Target Gesture</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TARGET_SIGNS.map(sign => {
            const count = samples.filter(s => s.sign === sign.id).length;
            const isSelected = selectedSign === sign.id;
            return (
              <button
                key={sign.id}
                type="button"
                onClick={() => setSelectedSign(sign.id)}
                className={`p-3 rounded-[12px] border-2 text-left transition-all ${
                  isSelected
                    ? 'border-[#0A6C6E] bg-[#E2F3F3]'
                    : 'border-[#E5DACF] bg-white hover:bg-[#FFF8EF]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#1F1B16]">{sign.name}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-[8px] bg-white border border-[#E5DACF] text-[#0A6C6E]">
                    {count}
                  </span>
                </div>
                <p className="text-xs text-[#5E564D] mt-1 line-clamp-2">{sign.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Camera Capture Viewport */}
      <div className="bg-white border-2 border-[#E5DACF] rounded-[14px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1F1B16]">
            2. Record Sign: {TARGET_SIGNS.find(s => s.id === selectedSign)?.name}
          </h2>
          <div className="flex items-center gap-2">
            {!cameraActive ? (
              <Button variant="primary" size="normal" onClick={startCamera} icon={<Camera className="w-4 h-4 text-white" />}>
                Start Camera
              </Button>
            ) : (
              <Button variant="secondary" size="normal" onClick={stopCamera}>
                Stop Camera
              </Button>
            )}
          </div>
        </div>

        <div className="relative bg-[#1F1B16] rounded-[12px] aspect-video flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          />
          {!cameraActive && (
            <p className="text-white text-sm font-semibold">Start camera to begin recording gesture frames.</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button
            variant="primary"
            size="large"
            onClick={captureSample}
            disabled={!cameraActive || !consentGiven}
            icon={<CheckCircle2 className="w-5 h-5 text-white" />}
          >
            Capture Sample for "{TARGET_SIGNS.find(s => s.id === selectedSign)?.name}"
          </Button>

          {lastCapturedPreview && (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1B7A42]">
              <img
                src={lastCapturedPreview}
                alt="Last captured gesture frame"
                className="w-10 h-10 rounded-[8px] object-cover border border-[#1B7A42]"
              />
              <span>Sample saved to local session.</span>
            </div>
          )}
        </div>
      </div>

      {/* Dataset Summary & Actions */}
      <div className="bg-white border-2 border-[#E5DACF] rounded-[14px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-[#1F1B16]">Collected Dataset Summary</h3>
          <p className="text-xs font-semibold text-[#5E564D] mt-0.5">
            Total Samples: {samples.length} across {new Set(samples.map(s => s.sign)).size} unique signs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="normal"
            onClick={exportDataset}
            disabled={samples.length === 0}
            icon={<Download className="w-4 h-4 text-white" />}
          >
            Export Dataset JSON
          </Button>
          <Button
            variant="emergency"
            size="normal"
            onClick={clearAllSamples}
            disabled={samples.length === 0}
            icon={<Trash2 className="w-4 h-4 text-white" />}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};
