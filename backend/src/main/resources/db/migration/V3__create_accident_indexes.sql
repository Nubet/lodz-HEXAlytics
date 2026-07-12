CREATE INDEX idx_accidents_year ON accidents (year);
CREATE INDEX idx_accidents_severity ON accidents (severity);
CREATE INDEX idx_accidents_district_year ON accidents (district_id, year);
CREATE INDEX idx_accidents_occurred_at ON accidents (occurred_at);
CREATE INDEX idx_accidents_event_type_year ON accidents (event_type_id, year);
CREATE INDEX idx_accident_participants_accident_id ON accident_participants (accident_id);
CREATE INDEX idx_participant_casualties_participant_id ON participant_casualties (participant_id);
