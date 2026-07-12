package com.norbertfila.hexa.dto.importing;

public record ImportSummary(
    int year,
    int accidents,
    int participants,
    int victims,
    int fatalVictims,
    int seriousVictims,
    int lightVictims,
    int uninjuredVictims
) {
}
