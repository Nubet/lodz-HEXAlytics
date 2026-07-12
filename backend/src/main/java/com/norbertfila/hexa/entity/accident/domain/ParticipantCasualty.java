package com.norbertfila.hexa.entity.accident.domain;

import com.norbertfila.hexa.entity.accident.valueobject.InjuryLevel;
import com.norbertfila.hexa.entity.accident.valueobject.ParticipantRole;

public record ParticipantCasualty(
    ParticipantRole role,
    InjuryLevel injuryLevel,
    short count
) {
}
