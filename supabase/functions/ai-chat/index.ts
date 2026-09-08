import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message = "", language = "en", currentLocation = "Visakhapatnam Railway Station", destination = "Vizag Complex" } = await req.json();
    const msg = message.toLowerCase();

    let reply = "";
    const suggestions: string[] = [];

    if (msg.includes("100") || msg.includes("auto") || msg.includes("fair") || msg.includes("adugu")) {
      if (language === "te") {
        reply = "విశాఖపట్నం రైల్వే స్టేషన్ నుండి వైజాగ్ కాంప్లెక్స్ వరకు ఆటో సాధారణ సరసమైన ఛార్జీ ₹20 నుండి ₹30 మాత్రమే. డ్రైవర్ అడిగిన ₹100 చాలా ఎక్కువ (High Price Deviation). దయచేసి ₹25-30 కి మాట్లాడండి లేదా రాపిడో / సిటీ బస్సు (రూ. 10) ఉపయోగించండి.";
        suggestions.push("రాపిడోలో బుక్ చేయి", "బస్సు రూట్లు చూపించు", "వైజాగ్ చూడదగ్గ ప్రదేశాలు");
      } else if (language === "hi") {
        reply = "विशाखापट्टनम रेलवे स्टेशन से वाइजाग कॉम्प्लेक्स तक ऑटो का उचित किराया ₹20–₹30 है। ₹100 मांगना काफी अधिक (High Deviation) है। आप रैपिडो/उबर से बुक कर सकते हैं या ₹10 में सिटी बस ले सकते हैं।";
        suggestions.push("रैपिडो बुक करें", "बस रूट", "पर्यटन स्थल");
      } else {
        reply = "From Visakhapatnam Railway Station to Vizag Complex, the fair auto fare is ₹20–₹30. The quoted ₹100 has a HIGH price deviation. Consider booking on Rapido/Uber or taking an APSRTC bus for ₹10–₹15.";
        suggestions.push("Book on Rapido", "Book on Uber", "Plan ₹500 Itinerary");
      }
    } else {
      reply = language === "te"
        ? "నమస్కారం! నేను మీ ట్రిప్ పైలట్ AI. సరసమైన ఛార్జీలు, రాపిడో లింకులు, బడ్జెట్ ఆహారశాలలు మరియు టూర్ ప్లాన్ల గురించి నన్ను అడగండి."
        : (language === "hi"
            ? "नमस्ते! मैं आपका ट्रिप पायलट AI साथी हूँ। उचित किराए, रैपिडो/उबर बुकिंग, बजट रेस्तरां और यात्रा योजना के लिए मुझसे पूछें।"
            : "Hello! I am your Trip Pilot AI Travel Companion. Ask me about fair fares, Rapido/Uber bookings, famous local foods, or budget itineraries.");
      suggestions.push("Is ₹100 fair for an auto?", "Top budget food spots", "Explore Vizag in ₹500");
    }

    return new Response(JSON.stringify({ reply, language, suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});