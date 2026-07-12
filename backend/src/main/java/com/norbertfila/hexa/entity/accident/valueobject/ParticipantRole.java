package com.norbertfila.hexa.entity.accident.valueobject;

public enum ParticipantRole {
    KIERUJACY("Kierujący"),
    PASAZER("Pasażer"),
    PIESZY("Pieszy"),
    OSOBA_UWR("Osoba UWR");

    private final String sourceValue;

    ParticipantRole(String sourceValue) {
        this.sourceValue = sourceValue;
    }

    public String getSourceValue() {
        return sourceValue;
    }

    public static ParticipantRole fromSourceValue(String value) {
        for (ParticipantRole role : values()) {
            if (role.sourceValue.equals(value)) {
                return role;
            }
        }

        throw new IllegalArgumentException("Unsupported participant role: " + value);
    }
}
