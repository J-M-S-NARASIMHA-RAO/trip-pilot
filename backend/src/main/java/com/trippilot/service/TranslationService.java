package com.trippilot.service;

import com.trippilot.dto.TranslateResponse;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class TranslationService {

    private final Map<String, Map<String, String>> translations = new HashMap<>();

    public TranslationService() {
        initDictionary();
    }

    private void initDictionary() {
        // Telugu mappings
        Map<String, String> te = new HashMap<>();
        te.put("Is this fare fair?", "ఈ ఛార్జీ సరసమైనదేనా?");
        te.put("Check Before You Pay", "చెల్లించే ముందు తనిఖీ చేయండి");
        te.put("High Price Deviation", "అధిక ధర వ్యత్యాసం (High Deviation)");
        te.put("Moderate Price Deviation", "మధ్యస్థ ధర వ్యత్యాసం");
        te.put("Low Price Deviation", "సాధారణ న్యాయమైన ధర");
        te.put("Estimated Fair Range", "అంచనా వేసిన సరసమైన ఛార్జీ");
        te.put("Driver Quote", "డ్రైవర్ అడిగిన ధర");
        te.put("Find Best Travel Plan", "ఉత్తమ ప్రయాణ ప్రణాళికను కనుగొనండి");
        te.put("Explore With Me", "నాతో పాటు అన్వేషించండి");
        te.put("Current Location", "ప్రస్తుత ప్రదేశం");
        te.put("Destination", "గమ్యస్థానం");
        te.put("Student Mode", "విద్యార్థి మోడ్");
        te.put("Tourist Mode", "పర్యాటక మోడ్");
        te.put("Cheapest", "అతి తక్కువ ధర");
        te.put("Best Overall", "అత్యుత్తమ ఎంపిక");
        te.put("Fastest", "వేగవంతమైనది");
        te.put("Safest", "సురక్షితమైనది");
        translations.put("te", te);

        // Hindi mappings
        Map<String, String> hi = new HashMap<>();
        hi.put("Is this fare fair?", "क्या यह किराया उचित है?");
        hi.put("Check Before You Pay", "भुगतान करने से पहले जांचें");
        hi.put("High Price Deviation", "उच्च मूल्य विचलन (High Deviation)");
        hi.put("Moderate Price Deviation", "मध्यम मूल्य विचलन");
        hi.put("Low Price Deviation", "सामान्य उचित किराया");
        hi.put("Estimated Fair Range", "अनुमानित उचित किराया");
        hi.put("Driver Quote", "चालक द्वारा मांगा गया किराया");
        hi.put("Find Best Travel Plan", "सर्वश्रेष्ठ यात्रा योजना खोजें");
        hi.put("Explore With Me", "मेरे साथ घूमें");
        hi.put("Current Location", "वर्तमान स्थान");
        hi.put("Destination", "गंतव्य स्थान");
        hi.put("Student Mode", "छात्र मोड");
        hi.put("Tourist Mode", "पर्यटक मोड");
        hi.put("Cheapest", "सबसे किफायती");
        hi.put("Best Overall", "सर्वश्रेष्ठ विकल्प");
        hi.put("Fastest", "सबसे तेज़");
        hi.put("Safest", "सबसे सुरक्षित");
        translations.put("hi", hi);
    }

    public TranslateResponse translate(String text, String sourceLang, String targetLang) {
        if (targetLang == null || targetLang.equalsIgnoreCase("en") || targetLang.equalsIgnoreCase(sourceLang)) {
            return new TranslateResponse(text, text, targetLang);
        }

        Map<String, String> dict = translations.get(targetLang.toLowerCase());
        if (dict != null && dict.containsKey(text)) {
            return new TranslateResponse(text, dict.get(text), targetLang);
        }

        // Generic fallback with helpful prefix
        String prefix = targetLang.equalsIgnoreCase("te") ? "[తెలుగు] " : "[हिन्दी] ";
        return new TranslateResponse(text, prefix + text, targetLang);
    }
}
