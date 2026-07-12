CREATE TABLE accidents (
    id BIGINT PRIMARY KEY,
    source_system_id BIGINT NOT NULL UNIQUE,
    occurred_at TIMESTAMP NOT NULL,
    year SMALLINT NOT NULL,
    severity CHAR(1) NOT NULL CHECK (severity IN ('S', 'C', 'L')),
    event_type_id SMALLINT NOT NULL REFERENCES event_types (id),
    district_id SMALLINT REFERENCES districts (id),
    source_district_label TEXT,
    longitude DOUBLE PRECISION NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    participant_count SMALLINT NOT NULL CHECK (participant_count >= 0),
    victim_count SMALLINT NOT NULL CHECK (victim_count >= 0),
    fatal_victim_count SMALLINT NOT NULL CHECK (fatal_victim_count >= 0),
    serious_victim_count SMALLINT NOT NULL CHECK (serious_victim_count >= 0),
    light_victim_count SMALLINT NOT NULL CHECK (light_victim_count >= 0),
    uninjured_victim_count SMALLINT NOT NULL CHECK (uninjured_victim_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE accident_participants (
    id BIGSERIAL PRIMARY KEY,
    accident_id BIGINT NOT NULL REFERENCES accidents (id) ON DELETE CASCADE,
    source_participant_ref TEXT NOT NULL,
    participant_order SMALLINT NOT NULL CHECK (participant_order > 0),
    vehicle_type_id SMALLINT NOT NULL REFERENCES vehicle_types (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (accident_id, source_participant_ref)
);

CREATE TABLE participant_casualties (
    participant_id BIGINT NOT NULL REFERENCES accident_participants (id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('Kierujący', 'Pasażer', 'Pieszy', 'Osoba UWR')),
    injury_level TEXT NOT NULL CHECK (injury_level IN ('fatal_on_scene', 'fatal_30_days', 'serious', 'light', 'none')),
    count SMALLINT NOT NULL CHECK (count > 0),
    PRIMARY KEY (participant_id, role, injury_level)
);
