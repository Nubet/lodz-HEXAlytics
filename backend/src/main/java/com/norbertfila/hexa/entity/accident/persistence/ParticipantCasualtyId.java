package com.norbertfila.hexa.entity.accident.persistence;

import java.io.Serializable;
import java.util.Objects;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ParticipantCasualtyId implements Serializable {

    private Long participant;
    private String role;
    private String injuryLevel;

    @Override
    public boolean equals(Object object) {
        if (this == object) {
            return true;
        }
        if (!(object instanceof ParticipantCasualtyId that)) {
            return false;
        }
        return Objects.equals(participant, that.participant)
            && Objects.equals(role, that.role)
            && Objects.equals(injuryLevel, that.injuryLevel);
    }

    @Override
    public int hashCode() {
        return Objects.hash(participant, role, injuryLevel);
    }
}
