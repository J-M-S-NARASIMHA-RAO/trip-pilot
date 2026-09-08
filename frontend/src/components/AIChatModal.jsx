import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Send, Mic, MicOff, Volume2, X, Bot, 
  User, CheckCircle2, Globe, MessageSquare, Key, ShieldCheck 
} from 'lucide-react';
import { translations } from '../translations';
import { sendAIChat } from '../api';
import { askGeminiTravelCompanion, getGeminiApiKey, setGeminiApiKey } from '../services/geminiService';

export default function AIChatModal({ currentLang, originLocation, destinationName, isOpen, onClose }) {
  const t = translations[currentLang] || translations.en;

  const [input, setInput] = useState("");
  const [geminiKey, setGeminiKey] = useState(getGeminiApiKey());
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: currentLang === 'te' 
        ? "నమస్కారం! నేను మీ ట్రిప్ పైలట్ AI. విశాఖపట్నం రైల్వే స్టేషన్ వద్ద ఆటో ఛార్జీలు, తక్కువ ఖర్చుతో కూడిన APSRTC బస్సులు, లేదా చూడదగ్గ ప్రదేశాల గురించి నన్ను అడగండి."
        : (currentLang === 'hi'
            ? "नमस्ते! मैं आपका ट्रिप पायलट AI साथी हूँ। विशाखापट्टनम में उचित ऑटो किराया, सिटी बस या दर्शनीय स्थलों के बारे में मुझसे पूछें।"
            : "Hello! I am your Trip Pilot AI Companion. Ask me about fair local auto fares in Vizag, cheapest bus routes, or tourist places.")
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    { label: "Railway station nundi Complex ki auto 100 fair aa?", query: "Railway station nundi Vizag Complex ki vellali. Auto driver 100 rupees adugutunnadu. Fair price entha?" },
    { label: "Is ₹100 fair for this auto?", query: "Is ₹100 fair for this auto to Vizag Complex?" },
    { label: "Cheapest bus to RTC Complex", query: "What is the cheapest bus to RTC Complex from railway station?" },
    { label: "I have ₹500 budget, plan my day", query: "I have only ₹500. Where can I visit in Vizag for 6 hours?" },
    { label: "Driver negotiation script in Telugu", query: "How to negotiate politely with a Telugu auto driver for fair meter fare?" }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const userMsg = textToSend || input;
    if (!userMsg.trim()) return;

    const newMsgs = [...messages, { sender: "user", text: userMsg }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      // 1. Try Google Gemini API first if configured
      let replyText = null;
      const geminiRes = await askGeminiTravelCompanion({
        message: userMsg,
        language: currentLang,
        currentLocation: originLocation?.name || "Visakhapatnam Railway Station",
        destination: destinationName || "Vizag Complex"
      });

      if (geminiRes && geminiRes.reply) {
        replyText = geminiRes.reply;
      } else {
        // 2. Fallback to Spring Boot Backend / Smart Engine
        const res = await sendAIChat({
          message: userMsg,
          language: currentLang,
          currentLocation: originLocation?.name || "Visakhapatnam Railway Station",
          destination: destinationName || "Vizag Complex"
        });
        replyText = res.reply;
      }

      setMessages([...newMsgs, { sender: "ai", text: replyText }]);

      // Speak response if user used voice
      if (listening && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(replyText.replace(/[*#]/g, ''));
        utterance.lang = currentLang === 'te' ? 'te-IN' : (currentLang === 'hi' ? 'hi-IN' : 'en-IN');
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error("AI chat error:", err);
      setMessages([...newMsgs, { 
        sender: "ai", 
        text: "Regulated local auto fare to Vizag Complex is ₹20–₹30. An ask of ₹100 is a High Price Deviation (+233%). I recommend taking APSRTC City Bus Route 28A/10K for ₹10 from the main gate." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser. Please type your query.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = currentLang === 'te' ? 'te-IN' : (currentLang === 'hi' ? 'hi-IN' : 'en-IN');
    recognition.interimResults = false;

    if (!listening) {
      setListening(true);
      recognition.start();
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setListening(false);
        handleSend(transcript);
      };
      recognition.onerror = () => {
        setListening(false);
      };
      recognition.onend = () => {
        setListening(false);
      };
    } else {
      setListening(false);
      recognition.stop();
    }
  };

  const handleSaveGeminiKey = () => {
    setGeminiApiKey(keyInput.trim());
    setGeminiKey(keyInput.trim());
    setShowKeyModal(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[620px] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shadow-md">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white">
                  Trip Pilot AI Companion
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  geminiKey 
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {geminiKey ? "⚡ Google Gemini AI" : "🛡️ Rule Engine Active"}
                </span>
              </div>
              <p className="text-[11px] text-teal-200">
                Multilingual Travel, Tariff & Polite Negotiation Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowKeyModal(true)}
              className="p-2 rounded-xl hover:bg-white/10 text-teal-200 transition-colors"
              title="Configure Google Gemini API Key"
            >
              <Key className="h-4 w-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50">
          {messages.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-white text-teal-800 border border-slate-200 shadow-sm'
              }`}>
                {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>

              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-line shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-teal-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
              <Sparkles className="h-4 w-4 animate-spin text-teal-600" />
              <span>Analyzing fair tariffs & negotiation tips...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Carousel */}
        <div className="p-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.query)}
              className="whitespace-nowrap text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-semibold px-2.5 py-1 rounded-lg transition-colors shrink-0"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleVoice}
            className={`p-2.5 rounded-2xl transition-all ${
              listening 
                ? 'bg-rose-500 text-white animate-pulse' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Speak query (Web Speech API)"
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              currentLang === 'te' 
                ? "డ్రైవర్ ఎంత అడిగాడు? ఇక్కడ టైప్ చేయండి లేదా మాట్లాడండి..."
                : (currentLang === 'hi'
                    ? "किराया कितना मांगा? यहाँ लिखें या बोलें..."
                    : "Ask about fair auto rates, bus routes, or negotiation scripts...")
            }
            className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white p-2.5 rounded-2xl transition-all shadow-md active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* Gemini Key Config Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <h4 className="font-black text-sm text-slate-900 mb-1">Google Gemini API Key</h4>
            <p className="text-xs text-slate-500 mb-3">
              Enter your Gemini API key to activate real AI conversation. (Leave blank to use built-in offline tariff rules).
            </p>
            <input
              type="text"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowKeyModal(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
              <button onClick={handleSaveGeminiKey} className="bg-teal-600 text-white px-4 py-1.5 rounded-xl text-xs font-bold">Save Key</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
