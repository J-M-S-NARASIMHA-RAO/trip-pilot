// ==========================================================
// 🤖 TRIP PILOT — Google Gemini AI Travel Companion Service
// ==========================================================

export function getGeminiApiKey() {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey !== 'YOUR_GEMINI_API_KEY_HERE' && envKey.trim().length > 5) {
    return envKey.trim();
  }
  return localStorage.getItem('trip_pilot_gemini_key') || '';
}

export function setGeminiApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem('trip_pilot_gemini_key', key.trim());
  } else {
    localStorage.removeItem('trip_pilot_gemini_key');
  }
}

export async function askGeminiTravelCompanion({ message, language = 'en', currentLocation, destination }) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return null; // Signals fallback to backend rule engine
  }

  const systemPrompt = `You are Trip Pilot AI, an intelligent, street-smart tourist travel companion and anti-deception mobility advisor designed for Indian cities (especially Visakhapatnam, Hyderabad, Vijayawada, Bengaluru, Delhi).
Your mission is to protect tourists, students, and first-time visitors from unfair transportation pricing and deceptive quotes.

Current Context:
- Origin: ${currentLocation || "Visakhapatnam Railway Station"}
- Destination: ${destination || "Vizag Complex"}
- Regulated Auto Tariff benchmark in Vizag: Base fare ₹20 for first 1.5 km, ₹13-15 per additional km. City bus (APSRTC) is ₹10-15. App cabs are ₹80-110.
- User Language: ${language} (te = Telugu, hi = Hindi, en = English).

Guidelines:
1. Always reply in the requested language (${language}). If Telugu ('te'), reply in Telugu script or polite conversational Telugu. If Hindi ('hi'), reply in Hindi Devanagari. If English ('en'), reply in crisp, clear English.
2. If the user asks about an auto driver asking ₹100 for a 2-3 km trip (like Station to Complex), immediately call out that it is HIGH DEVIATION (+150% to +230% over fair price).
3. Provide a polite, respectful negotiation script they can say directly to the driver without creating a fight (e.g. "Bhayya, meter prakaram ₹25-30 avtundi, ₹35 istanu rammantara?").
4. Suggest cheaper alternative public transit (e.g. APSRTC City Bus Route 28A/10K right outside the station for ₹10).
5. If they ask for tourist plans or food spots, recommend budget-friendly local Andhra gems (e.g., RK Beach, Submarine Museum, Kailasagiri, Sri Sairam Parlour, Subbayya Gari Hotel).
6. Keep your answers concise, practical, and formatted with bullet points and emojis.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${systemPrompt}\n\nUser Question: ${message}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600
          }
        })
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidate) {
      return {
        reply: candidate,
        isGemini: true,
        suggestions: language === 'te'
          ? ["బస్సు ప్రత్యామ్నాయాలు", "డ్రైవర్‌తో ఎలా మాట్లాడాలి?", "సమీప హోటల్స్"]
          : (language === 'hi'
              ? ["बस विकल्प दिखाएं", "मोलभाव कैसे करें?", "घूमने की जगहें"]
              : ["Show bus routes", "How to negotiate politely?", "Nearby budget thali"])
      };
    }
  } catch (err) {
    console.warn("Direct Gemini API call failed, will use backend engine:", err);
  }

  return null;
}
