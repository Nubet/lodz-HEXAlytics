package com.norbertfila.hexa.dto.importing.source;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DetailAccidentSource(
    Double wsp_gps_x,
    Double wsp_gps_y,
    String id_w_czas,
    String czas_zdarzenia,
    String woj_nazwa,
    String pow_nazwa,
    String gmi_nazwa,
    String mie_nazwa,
    String opis_zdarzenia,
    Map<String, ParticipantSource> uczestnicy,
    Long zdarzenie_id,
    String id_systemu_zr
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ParticipantSource(
        Map<String, VictimSource> ofiary,
        String opis_pojazdu
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record VictimSource(List<String> obrazenia) {
    }
}
