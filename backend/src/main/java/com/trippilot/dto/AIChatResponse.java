package com.trippilot.dto;

import java.util.List;

public class AIChatResponse {
    private String reply;
    private String language;
    private List<String> suggestions;
    private Object itinerary;

    public AIChatResponse() {}

    public AIChatResponse(String reply, String language, List<String> suggestions) {
        this.reply = reply;
        this.language = language;
        this.suggestions = suggestions;
    }

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }
    public Object getItinerary() { return itinerary; }
    public void setItinerary(Object itinerary) { this.itinerary = itinerary; }
}
