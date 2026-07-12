package com.norbertfila.hexa.entity.accident.valueobject;

public enum InjuryLevel {
    FATAL_ON_SCENE,
    FATAL_30_DAYS,
    SERIOUS,
    LIGHT,
    NONE;

    public String getDatabaseValue() {
        return switch (this) {
            case FATAL_ON_SCENE -> "fatal_on_scene";
            case FATAL_30_DAYS -> "fatal_30_days";
            case SERIOUS -> "serious";
            case LIGHT -> "light";
            case NONE -> "none";
        };
    }
}
