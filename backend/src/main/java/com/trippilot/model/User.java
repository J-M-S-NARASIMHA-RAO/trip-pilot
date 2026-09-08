package com.trippilot.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String preferredLanguage = "en"; // en, te, hi
    private String userType = "TOURIST"; // STUDENT, TOURIST, REGULAR

    public User() {}

    public User(String name, String email, String preferredLanguage, String userType) {
        this.name = name;
        this.email = email;
        this.preferredLanguage = preferredLanguage;
        this.userType = userType;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }
}
