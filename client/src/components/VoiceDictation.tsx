import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Globe } from 'lucide-react';

interface VoiceDictationProps {
  onResult: (text: string) => void;
  placeholder?: string;
}

const LANGUAGES = [
  { code: 'en-IN', name: 'English (India)' },
  { code: 'hi-IN', name: 'हिन्दी (Hindi)' },
  { code: 'te-IN', name: 'తెలుగు (Telugu)' },
  { code: 'ta-IN', name: 'தமிழ் (Tamil)' },
  { code: 'mr-IN', name: 'मराठी (Marathi)' },
  { code: 'kn-IN', name: 'ಕನ್ನಡ (Kannada)' },
];

export const VoiceDictation: React.FC<VoiceDictationProps> = ({ onResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = selectedLang;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (err: any) => {
      console.warn('Speech recognition error:', err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Language Selector Dropdown */}
      <div className="relative flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1 text-[11px] text-slate-300">
        <Globe className="w-3 h-3 text-emerald-400 mr-1.5 shrink-0" />
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="bg-transparent text-slate-200 outline-none cursor-pointer pr-1"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} className="bg-slate-900 text-white">
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* Mic Button */}
      <button
        type="button"
        onClick={toggleListening}
        className={`p-2.5 rounded-xl border transition-all min-h-[40px] min-w-[40px] flex items-center justify-center ${
          isListening
            ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
            : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border-slate-700/80'
        }`}
        title={isListening ? 'Listening... Speak now' : 'Click to dictate voice note'}
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
    </div>
  );
};

/* Text to Speech Reader Button Component */
export const AudioReadoutButton: React.FC<{ text: string }> = ({ text }) => {
  const [speaking, setSpeaking] = useState(false);

  const toggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const cleanedText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.rate = 0.95;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={toggleSpeak}
      className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
        speaking
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
      }`}
      title="Listen to advisory audio readout"
    >
      {speaking ? <VolumeX className="w-3.5 h-3.5 text-emerald-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
      <span>{speaking ? 'Stop Reading' : 'Listen'}</span>
    </button>
  );
};
