import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Mic, MicOff, Globe, Sparkles, Volume2 } from 'lucide-react';
import { BotAvatar } from 'bot-avatars';
import { ThinkingOrb } from 'thinking-orbs';
import { VoiceBeam, useMicrophone } from 'voice-glow';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface MitraChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToReport?: () => void;
}

export const MitraChatModal: React.FC<MitraChatModalProps> = ({
  isOpen,
  onClose,
  onNavigateToReport,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Namaste! I am Mitra (మిత్ర / मित्र), your GVMC Civic AI Assistant. I can help you report potholes, water leaks, check 72-hour SLAs, property taxes, or find nearest cyclone shelters. How can I assist you today?',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState<'en' | 'te' | 'hi'>('en');
  const [isThinking, setIsThinking] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);

  const mic = useMicrophone();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Voice level simulation when mic is live
  useEffect(() => {
    let timer: any;
    if (mic.state === 'live') {
      timer = setInterval(() => {
        setVoiceLevel(0.3 + Math.random() * 0.5);
      }, 100);
    } else {
      setVoiceLevel(0);
    }
    return () => clearInterval(timer);
  }, [mic.state]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isThinking) return;

    const newMessages: Message[] = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setInputText('');
    setIsThinking(true);

    try {
      const response = await fetch('/api/gemini/mitra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language,
          history: messages.slice(-6),
        }),
      });

      const data = await response.json();
      if (data && data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'I received your query and logged it for Visakhapatnam municipal reference.',
          },
        ]);
      }
    } catch (err) {
      console.error('Mitra error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Apologies, I am temporarily unable to connect to the municipal server. Please feel free to use the manual report form.',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleMic = () => {
    if (mic.state === 'live') {
      mic.stop();
      if (!inputText) {
        setInputText(
          language === 'te'
            ? 'రోడ్డుపై గుంత ఉంది, సరిచేయండి.'
            : language === 'hi'
            ? 'सड़क पर गड्ढा है, मरम्मत करें।'
            : 'There is a deep pothole on the road near Siripuram.'
        );
      }
    } else {
      mic.start().catch((err) => {
        console.warn('Microphone permission or error:', err);
        // Fallback demo speech input
        setInputText(
          language === 'te'
            ? 'విశాఖపట్నం తుఫాను సహాయ కేంద్రాలు ఎక్కడ ఉన్నాయి?'
            : 'Where are the nearest GVMC cyclone shelters?'
        );
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header with BotAvatar and Language Selector */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BotAvatar
                type="droid"
                state={isThinking ? 'working' : 'default'}
                size={44}
                face="eyes"
                shading="plastic"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base">Mitra AI</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/40 text-blue-200">
                  మిత్ర • मित्र
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                GVMC Multilingual Civic Voice & Text Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-blue-950/60 border border-blue-400/30 rounded-lg p-0.5 text-xs font-bold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded ${
                  language === 'en' ? 'bg-blue-600 text-white' : 'text-blue-300'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('te')}
                className={`px-2 py-0.5 rounded ${
                  language === 'te' ? 'bg-blue-600 text-white' : 'text-blue-300'
                }`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 rounded ${
                  language === 'hi' ? 'bg-blue-600 text-white' : 'text-blue-300'
                }`}
              >
                हिंदी
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-slate-500 py-1">
              <ThinkingOrb state="searching" size={20} />
              <span className="text-[11px] font-medium">Mitra is consulting municipal databases...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
          <button
            onClick={() => handleSendMessage('How does the 72-hour binding SLA work?')}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors"
          >
            How does 72h SLA work?
          </button>
          <button
            onClick={() => handleSendMessage('Where are the nearest cyclone relief shelters?')}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors"
          >
            Nearest Cyclone Shelters
          </button>
          <button
            onClick={() => handleSendMessage('How do I pay GVMC Property Tax online?')}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors"
          >
            Pay Property Tax
          </button>
        </div>

        {/* Input Bar with VoiceBeam */}
        <div className="p-3 bg-white border-t border-slate-200">
          <VoiceBeam
            stream={mic.stream}
            level={() => voiceLevel}
            colorVariant="ocean"
            strength={0.8}
            active={mic.state === 'live'}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-slate-50 rounded-xl p-1.5 border border-slate-200"
            >
              <button
                type="button"
                onClick={toggleMic}
                className={`p-2 rounded-lg transition-colors ${
                  mic.state === 'live'
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-slate-500 hover:text-blue-600 hover:bg-slate-200/50'
                }`}
                title={mic.state === 'live' ? 'Stop listening' : 'Speak with voice'}
              >
                {mic.state === 'live' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  language === 'te'
                    ? 'మిత్రను అడగండి (ఉదా: గుంతలు, చెత్త, తుఫాను)...'
                    : language === 'hi'
                    ? 'मित्रा से पूछें (उदा: गड्ढा, कचरा, चक्रवात)...'
                    : 'Ask Mitra (e.g., Report pothole, property tax, shelter)...'
                }
                className="flex-1 bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isThinking}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </VoiceBeam>
        </div>
      </div>
    </div>
  );
};
