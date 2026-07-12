package com.norbertfila.hexa.exceptions.accident;

public class AccidentNotFoundException extends RuntimeException {
    public AccidentNotFoundException(long accidentId) {
        super("Accident not found: " + accidentId);
    }
}
