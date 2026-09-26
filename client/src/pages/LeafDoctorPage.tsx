import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, AlertTriangle, CheckCircle2, ShieldAlert, X, Eye, Volume2, VolumeX, RotateCcw, ImageOff } from 'lucide-react';
import { apiFetch } from '../lib/api';

export interface ValidationDetails {
  isLeaf: boolean;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

export const LeafDoctorPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropType, setCropType] = useState('Chilli');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<{
    error: string;
    validation?: ValidationDetails;
  } | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedImage(compressedDataUrl);
          setResult(null);
          setValidationError(null);
        } else {
          setSelectedImage(event.target?.result as string);
          setResult(null);
          setValidationError(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleScanImage = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setResult(null);
    setValidationError(null);

    try {
      const data = await apiFetch<{
        diagnosis?: string;
        assistantMessage?: { message: string };
        reply?: string;
        error?: string;
        validation?: ValidationDetails;
      }>('/ai/leaf-doctor', {
        method: 'POST',
        body: JSON.stringify({
          cropType,
          imageBase64: selectedImage,
        }),
      });

      if (data.error) {
        setValidationError({
          error: data.error,
          validation: data.validation,
        });
        return;
      }

      const replyText = data.diagnosis || data.assistantMessage?.message || data.reply;
      if (replyText) {
        setResult(replyText);
      } else {
        setValidationError({
          error: "This doesn't look like a leaf photo. Please upload a clear, close-up photo of a plant leaf.",
        });
      }
    } catch (err: any) {
      setValidationError({
        error: err.message || "This doesn't look like a leaf photo. Please upload a clear, close-up photo of a plant leaf.",
        validation: err.validation,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSpeak = () => {
    if (!result) return;
    if ('speechSynthesis' in window) {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(result);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
        setSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setResult(null);
    setValidationError(null);
    if (speaking && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 animate-fadein-up">
      {/* ── Page Header Banner ── */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-8 sm:p-12 rounded-3xl border border-teal-800/40 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-black px-3.5 py-1.5 rounded-full bg-teal-400 text-teal-950">
            <Eye className="w-4 h-4" /> 2-Step Gemini Image Validation &amp; Vision Engine
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            AI Leaf Doctor <span className="text-[#4ade80]">Scanner</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-base leading-relaxed font-medium">
            Upload or capture a close-up photo of a crop leaf. The system validates image content first to ensure it is a genuine leaf before generating strict, evidence-based pathology reports.
          </p>
        </div>
      </div>

      {/* ── Main Scanner Interface ── */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
        
        {/* Step 1: Select Crop Type */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
            1. Select Crop Type
          </label>
          <div className="flex flex-wrap gap-2">
            {['Chilli', 'Cotton', 'Paddy / Rice', 'Wheat', 'Tomato', 'Maize', 'Potato', 'Sugarcane'].map((crop) => (
              <button
                key={crop}
                type="button"
                onClick={() => setCropType(crop)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  cropType === crop
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Upload Image Dropzone */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
            2. Upload or Capture Leaf Image
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {!selectedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-3xl p-10 text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/50 transition-all group space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-xs">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="font-black text-slate-900 text-base">Click to Upload or Drag &amp; Drop Leaf Photo</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
                Supports High-Res JPG/PNG. Must be a clear close-up of a plant leaf for AI validation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-3xl overflow-hidden border border-slate-300 bg-slate-950 max-h-80 flex items-center justify-center">
                <img src={selectedImage} alt="Crop Leaf" className="object-contain max-h-80 w-full" />
                <button
                  onClick={resetScanner}
                  className="absolute top-4 right-4 p-2 bg-slate-900/80 text-white rounded-xl hover:bg-slate-900 border border-slate-700"
                  title="Remove Photo"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!result && !validationError && (
                <button
                  onClick={handleScanImage}
                  disabled={analyzing}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 min-h-[52px]"
                >
                  {analyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Validating Image Content &amp; Running AI Pathology Scan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" /> Run AI Pathology Diagnostic Scan
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── STEP 5: FRIENDLY ERROR STATE UI FOR VALIDATION FAILURE ── */}
        {validationError && (
          <div className="p-6 bg-red-50/90 border-2 border-red-300 rounded-3xl space-y-4 animate-fadein-up text-red-950 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                <ImageOff className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-red-950">Image Content Validation Failed</h3>
                <p className="text-xs text-red-800 font-bold mt-1 leading-relaxed">
                  {validationError.error}
                </p>
                {validationError.validation?.reason && (
                  <div className="mt-2.5 p-3 bg-white/80 rounded-xl border border-red-200 text-xs text-slate-800 font-medium">
                    <strong className="text-red-900 font-extrabold">AI Vision Classification: </strong>
                    "{validationError.validation.reason}" (Confidence: <span className="uppercase font-bold text-red-700">{validationError.validation.confidence}</span>)
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={resetScanner}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition-colors min-h-[44px] shadow-xs"
              >
                <RotateCcw className="w-4 h-4" /> Try Another Photo
              </button>
            </div>
          </div>
        )}

        {/* ── DIAGNOSIS RESULT CARD (ONLY FOR VALIDATED LEAF PHOTOS) ── */}
        {result && (
          <div className="space-y-6 pt-6 border-t border-slate-200 animate-fadein-up">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">AI Pathology &amp; Diagnostic Report</h3>
                  <p className="text-xs text-slate-500 font-bold">Crop: {cropType} • Image Content Validated (High Confidence)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSpeak}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center gap-2 shadow-xs"
                >
                  {speaking ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  <span>{speaking ? 'Stop Audio' : 'Listen Report'}</span>
                </button>

                <button
                  onClick={resetScanner}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Scan Another Leaf
                </button>
              </div>
            </div>

            {/* Diagnostic Report Box */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 font-semibold text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-xl">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeafDoctorPage;
