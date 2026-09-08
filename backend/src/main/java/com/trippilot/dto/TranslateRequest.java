package com.trippilot.dto;

public class TranslateRequest {
    private String text;
    private String sourceLanguage = "en";
    private String targetLanguage = "te"; // te, hi, en

    public TranslateRequest() {}

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getSourceLanguage() { return sourceLanguage; }
    public void setSourceLanguage(String sourceLanguage) { this.sourceLanguage = sourceLanguage; }
    public String getTargetLanguage() { return targetLanguage; }
    public void setTargetLanguage(String targetLanguage) { this.targetLanguage = targetLanguage; }
}
