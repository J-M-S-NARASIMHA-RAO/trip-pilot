package com.trippilot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalTime;
import java.util.*;

@Service
public class AiCompanionService {

    @Value("${gemini.api.key:AIzaSyCmIe_ONslfuDJDxmJo5DFX9GgudM3Doqs}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public static class CompanionResponse {
        private String reply;
        private String language;
        private String audioText;
        private boolean isGeminiLive;
        private List<String> suggestions;

        public CompanionResponse() {}

        public CompanionResponse(String reply, String language, String audioText, boolean isGeminiLive, List<String> suggestions) {
            this.reply = reply;
            this.language = language;
            this.audioText = audioText;
            this.isGeminiLive = isGeminiLive;
            this.suggestions = suggestions;
        }

        public String getReply() { return reply; }
        public String getLanguage() { return language; }
        public String getAudioText() { return audioText; }
        public boolean isGeminiLive() { return isGeminiLive; }
        public List<String> getSuggestions() { return suggestions; }
    }

    public CompanionResponse chatWithCompanion(String message, String city, String origin,
                                              String destination, Double quotedFare,
                                              Double distanceKm, String language) {
        String lang = (language != null && !language.isBlank()) ? language.toLowerCase() : "en";
        String activeCity = (city != null && !city.isBlank()) ? city : "Visakhapatnam";
        int hour = LocalTime.now().getHour();
        boolean isNight = (hour >= 23 || hour < 5);

        // Try Gemini 1.5 Flash API first if API key is provided
        if (geminiApiKey != null && !geminiApiKey.isBlank() && !geminiApiKey.startsWith("YOUR_")) {
            try {
                String prompt = buildSystemPrompt(message, activeCity, origin, destination, quotedFare, distanceKm, isNight, hour, lang);
                String geminiText = callGeminiFlash(prompt);
                if (geminiText != null && !geminiText.isBlank()) {
                    List<String> suggestions = generateSuggestions(message, lang);
                    return new CompanionResponse(geminiText, lang, geminiText, true, suggestions);
                }
            } catch (Exception e) {
                // Log and seamlessly fall back to local rule-based intelligence
                System.err.println("Gemini API call skipped or failed: " + e.getMessage() + ". Falling back to local offline AI advisor.");
            }
        }

        // Local fallback in English, Telugu, Hindi
        return generateLocalCompanionResponse(message, activeCity, origin, destination, quotedFare, distanceKm, isNight, lang);
    }

    private String buildSystemPrompt(String userMsg, String city, String origin, String destination,
                                     Double quotedFare, Double distKm, boolean isNight, int hour, String lang) {
        return "You are 'Trip Pilot AI Companion', an expert travel mobility and anti-deception advisor for travelers in India.\n"
                + "Context:\n"
                + "- Current City: " + city + "\n"
                + "- Current Origin / Pickup: " + (origin != null ? origin : "Unknown") + "\n"
                + "- Destination: " + (destination != null ? destination : "Unknown") + "\n"
                + "- Distance: " + (distKm != null ? String.format("%.1f km", distKm) : "Unknown") + "\n"
                + "- Quoted Fare: " + (quotedFare != null ? ("₹" + quotedFare) : "None entered") + "\n"
                + "- Time of Day: " + hour + ":00 hours (" + (isNight ? "NIGHT SURCHARGE 1.5x ACTIVE 11PM-5AM" : "Regular Daytime Fare") + ")\n"
                + "- Target Language: " + (lang.equals("te") ? "Telugu (తెలుగు)" : lang.equals("hi") ? "Hindi (हिंदी)" : "English") + "\n\n"
                + "Instructions:\n"
                + "1. Protect travelers from unfair charges politely and ethically without calling anyone a thief.\n"
                + "2. Mention official meter tariff rules, night rates, and public bus alternatives if relevant.\n"
                + "3. Respond in concise, helpful paragraphs (under 90 words).\n"
                + "4. Always respond in the Target Language specified.\n\n"
                + "User Question: " + userMsg;
    }

    private String callGeminiFlash(String promptText) throws Exception {
        String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
        URL url = new URL(endpoint);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(4000);
        conn.setReadTimeout(5000);

        Map<String, Object> textPart = Map.of("text", promptText);
        Map<String, Object> parts = Map.of("parts", List.of(textPart));
        Map<String, Object> payload = Map.of("contents", List.of(parts));

        String jsonInput = objectMapper.writeValueAsString(payload);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(jsonInput.getBytes(StandardCharsets.UTF_8));
        }

        int code = conn.getResponseCode();
        if (code == 200) {
            JsonNode root = objectMapper.readTree(conn.getInputStream());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                return candidates.get(0).path("content").path("parts").get(0).path("text").asText();
            }
        }
        return null;
    }

    private CompanionResponse generateLocalCompanionResponse(String msg, String city, String origin,
                                                              String destination, Double quotedFare,
                                                              Double distanceKm, boolean isNight, String lang) {
        String lower = msg != null ? msg.toLowerCase() : "";
        double dist = distanceKm != null ? distanceKm : 3.0;
        double fairMin = 20.0 + (Math.max(0, dist - 1.5) * 12.0);
        if (isNight) fairMin *= 1.5;
        double fairMax = fairMin * 1.25;

        String reply;
        String audio;
        List<String> suggestions = new ArrayList<>();

        if (lower.contains("fare") || lower.contains("auto") || lower.contains("price") || lower.contains("100") || lower.contains("kiraya") || lower.contains("cost")) {
            if (lang.equals("te")) {
                reply = city + " లో " + String.format("%.1f", dist) + " కి.మీ ప్రయాణానికి అధికారిక ఆటో ఛార్జీ సుమారు ₹" + (int) fairMin + " నుండి ₹" + (int) fairMax + " మాత్రమే. "
                        + (isNight ? "రాత్రి 11 నుండి ఉదయం 5 వరకు 1.5 రెట్లు నైట్ ఛార్జీ వర్తిస్తుంది. " : "")
                        + (quotedFare != null && quotedFare > fairMax ? "డ్రైవర్ అడిగిన ₹" + quotedFare.intValue() + " కొంచెం ఎక్కువ. మీరు ₹" + (int) fairMax + " వద్ద బేరం చేయవచ్చు." : "మీటర్ వేయమని కోరండి.");
                audio = reply;
                suggestions.add("బస్సు రూట్లు చూపించు");
                suggestions.add("ఈ ట్రిప్‌ను ట్రాక్ చేయి");
                suggestions.add("సమీపంలో బడ్జెట్ ఫుడ్");
            } else if (lang.equals("hi")) {
                reply = city + " में " + String.format("%.1f", dist) + " किमी दूरी के लिए ऑटो का उचित किराया लगभग ₹" + (int) fairMin + " से ₹" + (int) fairMax + " है। "
                        + (isNight ? "रात 11 बजे से सुबह 5 बजे तक 1.5 गुना रात्रि दर लागू होती है। " : "")
                        + (quotedFare != null && quotedFare > fairMax ? "ड्राइवर का ₹" + quotedFare.intValue() + " मांगना सामान्य से अधिक है। ₹" + (int) fairMax + " तक की बात करें।" : "ड्राइवर से मीटर से चलने को कहें।");
                audio = reply;
                suggestions.add("बस विकल्प देखें");
                suggestions.add("लाइव यात्रा ट्रैक करें");
                suggestions.add("सस्ते खाने की जगहें");
            } else {
                reply = "In " + city + " for a distance of " + String.format("%.1f", dist) + " km, the statutory fair auto fare is ₹" + (int) fairMin + "–₹" + (int) fairMax + ". "
                        + (isNight ? "Night surcharge (1.5x) applies between 11 PM and 5 AM. " : "")
                        + (quotedFare != null && quotedFare > fairMax ? "The quoted ₹" + quotedFare.intValue() + " is higher than standard. Negotiate around ₹" + (int) fairMax + " or take a city bus." : "Always insist the driver resets the digital meter.");
                audio = reply;
                suggestions.add("Show bus alternatives");
                suggestions.add("Start live GPS trip");
                suggestions.add("Find budget food stalls");
            }
        } else if (lower.contains("food") || lower.contains("eat") || lower.contains("tiffin") || lower.contains("bhojanam") || lower.contains("khana")) {
            if (lang.equals("te")) {
                reply = city + " లో స్థానిక రుచులు: తక్కువ బడ్జెట్‌లో నాణ్యమైన వేడి ఇడ్లీ, దోశ మరియు భోజనం ₹40 నుండి ₹120 లోపే లభిస్తాయి. 'Explore' పేజీలో FSSAI రేటింగ్స్ చూడండి.";
                audio = reply;
                suggestions.add("బడ్జెట్ హోటళ్ళు చూపించు");
                suggestions.add("నైట్ టారిఫ్ ఎప్పటినుండి?");
            } else if (lang.equals("hi")) {
                reply = city + " में स्वादिष्ट स्थानीय खाना ₹40 से ₹120 के बजट में उपलब्ध है। प्रामाणिक टिफिन और भोजन के लिए 'Explore' टैब में फूड स्टॉल देखें।";
                audio = reply;
                suggestions.add("बजट हॉस्टल दिखाएं");
                suggestions.add("फेयर कैलकुलेटर खोलें");
            } else {
                reply = "In " + city + ", you can enjoy authentic regional delicacies, piping hot tiffins, and meals for ₹40 to ₹120. Check our Explore tab for verified hygiene-rated budget stalls!";
                audio = reply;
                suggestions.add("Show budget hostels");
                suggestions.add("Compare Uber vs Rapido");
            }
        } else {
            if (lang.equals("te")) {
                reply = "నమస్కారం! నేను మీ ట్రిప్ పైలట్ AI ట్రావెల్ కంపానియన్. " + city + " లో సరసమైన ఛార్జీలు, బస్సులు, బడ్జెట్ వసతి మరియు ఆహార వివరాల కోసం నన్ను అడగండి!";
                audio = reply;
                suggestions.add("ఆటో డ్రైవర్ ₹100 అడిగాడు, న్యాయమేనా?");
                suggestions.add("రైల్వే స్టేషన్ నుండి సిటీ బస్సులు");
            } else if (lang.equals("hi")) {
                reply = "नमस्ते! मैं आपका ट्रिप पायलट AI साथी हूँ। " + city + " में सुरक्षित यात्रा, उचित ऑटो किराए, बस रूट और बजट ठहरने की जानकारी के लिए पूछें।";
                audio = reply;
                suggestions.add("क्या ऑटो का ₹100 किराया सही है?");
                suggestions.add("रेलवे स्टेशन से नजदीकी बस स्टैंड");
            } else {
                reply = "Hello! I am your Trip Pilot AI Travel Companion in " + city + ". Ask me to verify auto fares, find RTC bus routes, budget dorms, or explore local food!";
                audio = reply;
                suggestions.add("Is ₹100 fair for 3 km auto?");
                suggestions.add("Show city bus stops nearby");
            }
        }

        return new CompanionResponse(reply, lang, audio, false, suggestions);
    }

    private List<String> generateSuggestions(String query, String lang) {
        List<String> list = new ArrayList<>();
        if (lang.equals("te")) {
            list.add("బస్సు రూట్లు చూపించు");
            list.add("ఈ ట్రిప్‌ను ట్రాక్ చేయి");
            list.add("బడ్జెట్ హోటళ్ళు");
        } else if (lang.equals("hi")) {
            list.add("बस विकल्प देखें");
            list.add("लाइव यात्रा ट्रैक करें");
            list.add("सस्ते हॉस्टल");
        } else {
            list.add("Compare with Uber & Rapido");
            list.add("Start live GPS trip");
            list.add("Find budget dorms");
        }
        return list;
    }
}
