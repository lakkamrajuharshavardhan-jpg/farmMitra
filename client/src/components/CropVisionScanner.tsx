import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, CheckCircle2, X, Eye, ImageOff, RotateCcw } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { Field } from '../lib/types';
import { AudioReadoutButton } from './VoiceDictation';

interface CropVisionScannerProps {
  field: Field;
  onDiagnosisComplete?: (analysis: string) => void;
}

export const CropVisionScanner: React.FC<CropVisionScannerProps> = ({ field, onDiagnosisComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<{
    error: string;
    reason?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
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
        validation?: { reason?: string };
      }>('/ai/leaf-doctor', {
        method: 'POST',
        body: JSON.stringify({
          cropType: field.crop_type,
          imageBase64: selectedImage,
        }),
      });

      if (data.error) {
        setValidationError({
          error: data.error,
          reason: data.validation?.reason,
        });
        return;
      }

      const replyText = data.diagnosis || data.assistantMessage?.message || data.reply;
      if (replyText) {
        setResult(replyText);
        if (onDiagnosisComplete) onDiagnosisComplete(replyText);
      } else {
        setValidationError({
          error: "This doesn't look like a leaf photo. Please upload a clear, close-up photo of a plant leaf.",
        });
      }
    } catch (err: any) {
      setValidationError({
        error: err.message || "This doesn't look like a leaf photo. Please upload a clear, close-up photo of a plant leaf.",
        reason: err.validation?.reason,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setResult(null);
    setValidationError(null);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="py-3 px-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-transform active:scale-95 min-h-[48px]"
      >
        <Camera className="w-4 h-4 stroke-[2.5]" />
        <span>Leaf Doctor (Vision AI)</span>
      </button>

      {/* Modal Scanner */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadein-up text-slate-900">
          <div className="bg-white w-full max-w-xl p-6 sm:p-7 rounded-3xl border border-teal-500/30 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">AI Leaf Doctor &amp; Crop Vision</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">2-Step Gemini Image Validation &amp; Pathology Scan</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Drop Zone / Image Preview */}
            {!selectedImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-3xl p-8 text-center cursor-pointer bg-slate-50 transition-all hover:bg-slate-100 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">Upload or Capture Leaf Photo</h4>
                <p className="text-xs text-slate-500 font-semibold mt-1 max-w-xs mx-auto">
                  Take a clear close-up photo of affected crop leaves for image content validation.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-950 max-h-64 flex items-center justify-center">
                  <img src={selectedImage} alt="Crop Leaf" className="object-contain max-h-64 w-full" />
                  <button
                    onClick={resetScanner}
                    className="absolute top-3 right-3 p-2 bg-slate-950/80 rounded-xl text-slate-300 hover:text-white border border-slate-700"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {!result && !validationError && (
                  <button
                    onClick={handleScanImage}
                    disabled={analyzing}
                    className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold rounded-2xl shadow-xl shadow-teal-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 min-h-[48px]"
                  >
                    {analyzing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Validating &amp; Scanning Leaf Image...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Run AI Pathology Scan
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Validation Error UI State */}
            {validationError && (
              <div className="mt-4 p-5 bg-red-50 border border-red-200 rounded-2xl space-y-3 text-red-950">
                <div className="flex items-start gap-3">
                  <ImageOff className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-sm text-red-950">Validation Error</h4>
                    <p className="text-xs text-red-800 font-semibold mt-0.5">{validationError.error}</p>
                    {validationError.reason && (
                      <p className="text-[11px] text-slate-700 mt-1 font-medium">
                        Observation: "{validationError.reason}"
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={resetScanner}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Try Another Photo
                </button>
              </div>
            )}

            {/* Diagnosis Result Output */}
            {result && (
              <div className="mt-5 space-y-4 animate-fadein-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-extrabold text-slate-900 text-sm">AI Pathology Report</h4>
                  </div>
                  <AudioReadoutButton text={result} />
                </div>

                <div className="bg-slate-900 p-4 rounded-2xl border border-teal-500/30 text-xs text-white leading-relaxed space-y-2 whitespace-pre-wrap">
                  {result}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={resetScanner}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                  >
                    Scan Another Leaf
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
