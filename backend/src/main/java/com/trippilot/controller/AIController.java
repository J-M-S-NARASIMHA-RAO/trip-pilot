package com.trippilot.controller;

import com.trippilot.dto.AIChatRequest;
import com.trippilot.dto.AIChatResponse;
import com.trippilot.dto.TranslateRequest;
import com.trippilot.dto.TranslateResponse;
import com.trippilot.service.AIChatService;
import com.trippilot.service.AiCompanionService;
import com.trippilot.service.TranslationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    private final AIChatService aiChatService;
    private final AiCompanionService aiCompanionService;
    private final TranslationService translationService;

    public AIController(AIChatService aiChatService,
                        AiCompanionService aiCompanionService,
                        TranslationService translationService) {
        this.aiChatService = aiChatService;
        this.aiCompanionService = aiCompanionService;
        this.translationService = translationService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AIChatResponse> chat(@RequestBody AIChatRequest request) {
        return ResponseEntity.ok(aiChatService.processMessage(request));
    }

    @PostMapping("/companion")
    public ResponseEntity<AiCompanionService.CompanionResponse> companion(@RequestBody Map<String, Object> body) {
        String message = body.getOrDefault("message", "").toString();
        String city = body.getOrDefault("city", "Visakhapatnam").toString();
        String origin = body.getOrDefault("origin", "Current Location").toString();
        String destination = body.getOrDefault("destination", "City Center").toString();
        String language = body.getOrDefault("language", "en").toString();

        Double quotedFare = null;
        if (body.get("quotedFare") != null) {
            try {
                quotedFare = Double.parseDouble(body.get("quotedFare").toString());
            } catch (Exception ignored) {}
        }

        Double distanceKm = null;
        if (body.get("distanceKm") != null) {
            try {
                distanceKm = Double.parseDouble(body.get("distanceKm").toString());
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok(aiCompanionService.chatWithCompanion(
                message, city, origin, destination, quotedFare, distanceKm, language));
    }

    @PostMapping("/translate")
    public ResponseEntity<TranslateResponse> translate(@RequestBody TranslateRequest request) {
        return ResponseEntity.ok(translationService.translate(request.getText(), request.getSourceLanguage(), request.getTargetLanguage()));
    }
}
