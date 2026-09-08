package com.trippilot.service;

import com.trippilot.dto.AIChatRequest;
import com.trippilot.dto.AIChatResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AIChatService {

    private final TouristGuideService touristGuideService;
    private final FareEngineService fareEngineService;

    public AIChatService(TouristGuideService touristGuideService, FareEngineService fareEngineService) {
        this.touristGuideService = touristGuideService;
        this.fareEngineService = fareEngineService;
    }

    public AIChatResponse processMessage(AIChatRequest request) {
        String msg = request.getMessage() != null ? request.getMessage().toLowerCase() : "";
        String lang = request.getLanguage() != null ? request.getLanguage().toLowerCase() : "en";
        String cur = request.getCurrentLocation() != null ? request.getCurrentLocation() : "Visakhapatnam Railway Station";
        String dest = request.getDestination() != null ? request.getDestination() : "Vizag Complex";

        AIChatResponse resp = new AIChatResponse();
        resp.setLanguage(lang);
        List<String> suggestions = new ArrayList<>();

        // 1. Detect Fare Inquiry (e.g. "is 100 fair", "auto driver 100", "adugutunnadu", "kiraya")
        if (msg.contains("100") || msg.contains("fair") || msg.contains("auto") || msg.contains("adugu") || msg.contains("kiraya") || msg.contains("cost")) {
            if (lang.equals("te")) {
                resp.setReply("విశాఖపట్నం రైల్వే స్టేషన్ నుండి వైజాగ్ కాంప్లెక్స్ (ద్వారక RTC కాంప్లెక్స్) వరకు దూరం దాదాపు 2.8 కి.మీ. ఆటోకు సాధారణ సరసమైన ఛార్జీ ₹20 నుండి ₹30 మాత్రమే. డ్రైవర్ అడిగిన ₹100 ఛార్జీ చాలా ఎక్కువ (High Price Deviation). మీరు ₹25–₹30 వద్దకు బేరం ఆడవచ్చు, లేదా స్టేషన్ మెయిన్ గేట్ వద్ద కేవలం ₹10 కే APSRTC బస్సు (రూట్ 28A, 10K) ఎక్కవచ్చు.");
                suggestions.add("బస్సు రూట్లు చూపించు");
                suggestions.add("ఈ ప్రయాణాన్ని ట్రాక్ చేయి");
                suggestions.add("వైజాగ్‌లో చూడదగ్గ ప్రదేశాలు");
            } else if (lang.equals("hi")) {
                resp.setReply("विशाखापट्टनम रेलवे स्टेशन से वाइजाग कॉम्प्लेक्स तक की दूरी लगभग 2.8 किमी है। ऑटो का उचित सरकारी व स्थानीय किराया ₹20 से ₹30 के बीच है। ड्राइवर द्वारा ₹100 मांगना काफी अधिक (High Price Deviation) है। आप ₹25–₹30 की बात कर सकते हैं या स्टेशन के बाहर से ₹10 में APSRTC सिटी बस ले सकते हैं।");
                suggestions.add("बस रूट दिखाएं");
                suggestions.add("यात्रा ट्रैक करें");
                suggestions.add("घूमने के लिए जगहें");
            } else {
                resp.setReply("From Visakhapatnam Railway Station to Vizag Complex (Dwaraka RTC Bus Station), the distance is approx 2.8 km. Regulated local auto fare is ₹20–₹30. The quoted ₹100 represents a HIGH price deviation (+233%). I recommend politely negotiating for ₹25–₹30 or hopping onto an APSRTC City Bus (Route 28A / 10K) from the front gate for just ₹10–₹15.");
                suggestions.add("Show bus alternatives");
                suggestions.add("Start Trip Mode");
                suggestions.add("What can I visit nearby?");
            }
            resp.setSuggestions(suggestions);
            return resp;
        }

        // 2. Detect Budget Itinerary / Nearby places ("200", "500", "visit", "explore", "places", "choodali")
        if (msg.contains("200") || msg.contains("500") || msg.contains("visit") || msg.contains("explore") || msg.contains("places") || msg.contains("near") || msg.contains("itinerary")) {
            var itinerary = touristGuideService.generateBudgetItinerary(cur, 6, 500.0, "Visakhapatnam");
            resp.setItinerary(itinerary);

            if (lang.equals("te")) {
                resp.setReply("మీరు విశాఖపట్నం రైల్వే స్టేషన్ సమీపంలో ఉన్నారు! మీకోసం ₹500 బడ్జెట్‌తో 6 గంటల పూర్తి టూరిస్ట్ ప్రణాళిక సిద్ధం చేశాను: ఆర్కే బీచ్, సబ్‌మెరైన్ మ్యూజియం, లోకల్ ఆంధ్రా భోజనం మరియు కైలాసగిరి కొండ. క్రింద పూర్తి ఖర్చుల వివరాలు చూడండి!");
                suggestions.add("ఆర్కే బీచ్ కి ఎలా వెళ్ళాలి?");
                suggestions.add("స్టూడెంట్ డిస్కౌంట్ ఉందా?");
            } else if (lang.equals("hi")) {
                resp.setReply("आप विशाखापट्टनम रेलवे स्टेशन के पास हैं! मैंने आपके लिए ₹500 के बजट में 6 घंटे का शानदार टूर प्लान तैयार किया है: आरके बीच, पनडुब्बी संग्रहालय, स्वादिष्ट दोपहर का भोजन और कैलाशगिरि। नीचे पूरा ब्योरा देखें!");
                suggestions.add("आरके बीच का रास्ता");
                suggestions.add("छात्र छूट उपलब्ध है?");
            } else {
                resp.setReply("You are near Visakhapatnam Railway Station! I have generated an optimal ₹500 6-hour budget itinerary covering RK Beach, INS Kursura Submarine Museum, Andhra thali lunch, and Kailasagiri Hilltop. Total expenses: Transport ₹80, Food ₹160, Museum fees ₹110 — saving you ₹150!");
                suggestions.add("How do I reach RK Beach?");
                suggestions.add("Is student ID accepted?");
            }
            suggestions.add("Is ₹100 fair for an auto?");
            resp.setSuggestions(suggestions);
            return resp;
        }

        // 3. Telugu translation request
        if (msg.contains("telugu") || msg.contains("translate")) {
            resp.setReply("ఖచ్చితంగా! ట్రిప్ పైలట్ మీకు తెలుగులో పూర్తి సమాచారం అందిస్తుంది. ఉదాహరణకు: 'ఈ ఆటో ఛార్జీ న్యాయమైనదేనా?', 'తక్కువ ఖర్చుతో ప్రయాణించే మార్గం ఏది?'. మీకు ఏ సందేహం ఉన్నా అడగండి!");
            suggestions.add("వైజాగ్ కాంప్లెక్స్ కి ఎలా వెళ్ళాలి?");
            suggestions.add("ఆటో డ్రైవర్ 100 అడిగాడు, న్యాయమేనా?");
            resp.setSuggestions(suggestions);
            return resp;
        }

        // 4. Default / General Tourist Guide
        if (lang.equals("te")) {
            resp.setReply("నమస్కారం! నేను మీ ట్రిప్ పైలట్ AI ట్రావెల్ కంపానియన్. నేను మీకు స్థానిక న్యాయమైన రవాణా ఛార్జీలు, తక్కువ బడ్జెట్ రూట్లు, ప్రసిద్ధ పర్యాటక ప్రదేశాలు మరియు నావిగేషన్‌లో సహాయం చేస్తాను. మీకు ఏమి కావాలి?");
            suggestions.add("ఆటో డ్రైవర్ 100 అడుగుతున్నాడు, న్యాయమేనా?");
            suggestions.add("నా దగ్గర ₹200 ఉన్నాయి, ఎక్కడికి వెళ్ళగలను?");
            suggestions.add("వైజాగ్ కాంప్లెక్స్ కి బస్సు ఏది?");
        } else if (lang.equals("hi")) {
            resp.setReply("नमस्ते! मैं आपका ट्रिप पायलट AI साथी हूँ। मैं आपको स्थानीय उचित किराए, बजट यात्रा विकल्प, नजदीकी दर्शनीय स्थल और सुरक्षित रास्ते बताने में मदद कर सकता हूँ। आप क्या जानना चाहते हैं?");
            suggestions.add("क्या ऑटो का ₹100 किराया सही है?");
            suggestions.add("मेरे पास ₹200 हैं, कहाँ घूम सकता हूँ?");
            suggestions.add("वाइजाग कॉम्प्लेक्स के लिए बस?");
        } else {
            resp.setReply("Hello! I am your Trip Pilot AI Travel Companion. I help you navigate unfamiliar cities safely, verify fair transport fares, optimize your travel budget, and discover hidden tourist gems. What would you like to explore today?");
            suggestions.add("Is ₹100 fair for this auto to Vizag Complex?");
            suggestions.add("I have ₹500 budget, plan my day");
            suggestions.add("Cheapest way to reach RK Beach");
        }
        resp.setSuggestions(suggestions);
        return resp;
    }
}
