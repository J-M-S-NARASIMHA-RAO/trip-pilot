// Native Web Speech API helper for reading fare advice and AI companion insights aloud

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.isSupported = !!this.synth;

    if (this.isSupported) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  getVoiceForLanguage(lang) {
    if (!this.voices.length) this.loadVoices();
    const l = (lang || 'en').toLowerCase();

    let targetCode = 'en-IN';
    if (l.startsWith('te')) targetCode = 'te-IN';
    else if (l.startsWith('hi')) targetCode = 'hi-IN';
    else if (l.startsWith('en')) targetCode = 'en-IN';

    // 1. Exact match for country code
    let voice = this.voices.find(v => v.lang.toLowerCase().includes(targetCode.toLowerCase()));
    if (voice) return voice;

    // 2. Fallback to primary language prefix
    const prefix = targetCode.split('-')[0];
    voice = this.voices.find(v => v.lang.toLowerCase().startsWith(prefix));
    if (voice) return voice;

    // 3. Fallback to any Indian English or default voice
    return this.voices.find(v => v.lang.includes('IN')) || this.voices[0] || null;
  }

  speak(text, lang = 'en', onEnd = null) {
    if (!this.isSupported || !text) return false;

    try {
      this.stop(); // Stop any pending speech

      // Clean text: strip markdown bold/italics/emojis for smoother vocalization
      const clean = text
        .replace(/[*_#`~]/g, '')
        .replace(/₹/g, 'Rupees ')
        .replace(/\bkm\b/gi, 'kilometers')
        .replace(/\bmin\b/gi, 'minutes');

      const utterance = new SpeechSynthesisUtterance(clean);
      const voice = this.getVoiceForLanguage(lang);
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = 0.95; // slightly deliberate for clear travel advice
      utterance.pitch = 1.0;

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }

      this.synth.speak(utterance);
      return true;
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
      if (onEnd) onEnd();
      return false;
    }
  }

  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  isSpeaking() {
    return !!(this.synth && this.synth.speaking);
  }
}

export const speechService = new SpeechService();
export default speechService;
