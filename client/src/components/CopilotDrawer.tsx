import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../lib/api';
import { Field, ChatMessage } from '../lib/types';
import { useVoiceInput } from '../hooks/useVoiceInput';
import {
  Sprout,
  X,
  Camera,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Image as ImageIcon,
  User as UserIcon,
} from 'lucide-react';

interface CopilotDrawerProps {
  field?: Field;
  daysSinceSowing?: number;
  chats?: ChatMessage[];
  onNewMessages?: (userMsg: ChatMessage, assistantMsg: ChatMessage) => void;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  field,
  daysSinceSowing,
  chats: propChats,
  onNewMessages,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [internalChats, setInternalChats] = useState<ChatMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const displayChats = propChats !== undefined ? propChats : internalChats;

  const { isListening, transcript, startListening, stopListening, resetTranscript } = useVoiceInput('en-US');

  useEffect(() => {
    if (transcript) {
      setNewMessage(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayChats, isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImageBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (promptTextOverride?: string) => {
    const textToSend = promptTextOverride || newMessage.trim() || (selectedImageBase64 ? 'Analyze attached crop leaf image' : '');
    if (!textToSend && !selectedImageBase64) return;

    if (isListening) stopListening();

    try {
      setSending(true);
      const imageToSend = selectedImageBase64;

      setNewMessage('');
      setSelectedImageBase64(null);
      resetTranscript();

      const endpoint = field ? `/fields/${field.id}/chat` : '/ai/chat';

      const res = await apiFetch<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>(
        endpoint,
        {
          method: 'POST',
          body: JSON.stringify({
            message: textToSend,
            imageBase64: imageToSend || undefined,
          }),
        }
      );

      if (onNewMessages) {
        onNewMessages(res.userMessage, res.assistantMessage);
      } else {
        setInternalChats((prev) => [...prev, res.userMessage, res.assistantMessage]);
      }
    } catch (err: any) {
      console.warn('AI Chat request error:', err.message);
      const now = new Date().toISOString();
      const fallbackUserMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        field_id: field?.id || 'global',
        role: 'user',
        message: textToSend,
        created_at: now,
      };
      const fallbackAsstMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        field_id: field?.id || 'global',
        role: 'assistant',
        message: 'Hello! I am **FarmMitra AI**. To get customized agronomic advisories for your plot, navigate to your Field Details page and click **"Request New Advisory"**. For general farming guidance or navigation tips, feel free to ask!',
        created_at: now,
      };
      if (onNewMessages) {
        onNewMessages(fallbackUserMsg, fallbackAsstMsg);
      } else {
        setInternalChats((prev) => [...prev, fallbackUserMsg, fallbackAsstMsg]);
      }
    } finally {
      setSending(false);
    }
  };

  const quickChips = [
    'How do I add a new field?',
    'How does advisory update if I skip a task?',
    'How much water does chilli need?',
    'Diagnose leaf photo',
  ];

  return (
    <>
      {/* Floating Action Button (FAB) - Fixed Corner */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-slate-900 hover:bg-slate-800 text-white rounded-full py-3.5 px-6 flex items-center gap-2.5 shadow-2xl min-h-[56px] border border-slate-700 font-black transition-all active:scale-95 cursor-pointer"
        title="Open FarmMitra AI Assistant"
      >
        <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0">
          <Sprout className="w-4 h-4" />
        </div>
        <span className="text-xs font-extrabold pr-0.5">Ask FarmMitra AI</span>
        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
      </button>

      {/* Slide-over FarmMitra AI Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-white border-l border-slate-200 text-slate-900 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    FarmMitra AI {field ? <span className="text-emerald-700 text-xs font-bold">({field.crop_type} Plot)</span> : null}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">Agronomy Assistant &amp; Platform Guide</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-200/60 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex gap-2 overflow-x-auto text-[11px] no-scrollbar">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (chip === 'Diagnose leaf photo') {
                      fileInputRef.current?.click();
                    } else {
                      handleSendMessage(chip);
                    }
                  }}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 font-semibold transition-colors flex items-center gap-1 shrink-0 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> {chip}
                </button>
              ))}
            </div>

            {/* Selected Image Preview */}
            {selectedImageBase64 && (
              <div className="p-2.5 mx-3 mt-2 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={selectedImageBase64}
                    alt="Leaf attached"
                    className="w-10 h-10 object-cover rounded-xl border border-emerald-300 shadow-xs"
                  />
                  <span className="text-[11px] text-emerald-900 font-extrabold">Leaf Image Ready for FarmMitra AI Scanner</span>
                </div>
                <button onClick={() => setSelectedImageBase64(null)} className="p-1 text-slate-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {displayChats.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-base">Hello! I am FarmMitra AI</h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed font-medium">
                    Ask me anything about navigating FarmMitra (adding fields, advisories, leaf diagnosis, Mandi rates) or general farming advice!
                  </p>
                </div>
              ) : (
                displayChats.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white rounded-tr-xs font-medium shadow-sm'
                          : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {msg.image_url && (
                        <div className="mb-2 px-2 py-1 bg-emerald-900/10 rounded-lg text-[10px] text-emerald-700 font-mono inline-flex items-center gap-1 border border-emerald-200">
                          <ImageIcon className="w-3 h-3 text-emerald-600" /> Leaf Photo Attached
                        </div>
                      )}
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1 font-semibold">
                      {msg.role === 'user' ? (
                        <>
                          <UserIcon className="w-3 h-3 text-slate-400" /> You
                        </>
                      ) : (
                        <>
                          <Sprout className="w-3 h-3 text-emerald-600" /> FarmMitra AI
                        </>
                      )}
                    </span>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Listening banner */}
            {isListening && (
              <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-[11px] text-red-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Listening to Voice Query...
                </span>
                <button onClick={stopListening} className="text-red-800 hover:underline font-bold">
                  Done
                </button>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200"
                title="Camera / Upload Leaf Image"
              >
                <Camera className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`p-2.5 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border ${
                  isListening
                    ? 'bg-red-50 text-red-600 border-red-300 animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title="Voice Dictation"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={selectedImageBase64 ? 'Add diagnostic note...' : 'Ask FarmMitra AI...'}
                className="flex-1 bg-slate-100 text-slate-900 placeholder-slate-400 font-medium rounded-full px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white min-h-[44px] border border-slate-200"
              />

              <button
                type="submit"
                disabled={sending || (!newMessage.trim() && !selectedImageBase64)}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors disabled:opacity-40 min-h-[44px] min-w-[44px] flex items-center justify-center shadow-xs cursor-pointer"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

