package com.norbertfila.hexa.entity.accident.domain;

import java.util.List;

public record AccidentParticipant(
    String sourceParticipantRef,
    short participantOrder,
    String vehicleTypeName,
    List<ParticipantCasualty> casualties
) {
}
