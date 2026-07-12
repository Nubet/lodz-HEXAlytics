package com.norbertfila.hexa.dto.importing.source;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RawAccidentSource(Mapa mapa) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Mapa(List<Wojewodztwo> wojewodztwa) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Wojewodztwo(List<Powiat> powiaty) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Powiat(List<Gmina> gminy) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Gmina(
        Integer zdarzenia,
        String gmi_nazwa,
        String mie_nazwa,
        String mie_rodzaj,
        String gmi_kod,
        String gmi_rodzaj,
        Double fallback_center_lng,
        Double fallback_center_lat,
        List<ZdarzenieDetale> zdarzenia_detale
    ) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ZdarzenieDetale(
        Long id,
        Double wsp_gps_x,
        Double wsp_gps_y,
        String ciezkosc
    ) {
    }
}
