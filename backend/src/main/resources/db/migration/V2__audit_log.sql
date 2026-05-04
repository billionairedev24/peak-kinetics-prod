-- Audit log: every PHI-adjacent action is recorded here asynchronously via AuditAspect.
-- HIPAA § 164.312(b) — Audit controls.

CREATE TABLE IF NOT EXISTS audit_log (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT,
    user_email    VARCHAR(320),
    action        VARCHAR(64)  NOT NULL,
    entity_type   VARCHAR(64),
    entity_id     VARCHAR(64),
    ip_address    VARCHAR(45),
    user_agent    VARCHAR(512),
    request_id    VARCHAR(64),
    -- TIMESTAMPTZ matches Hibernate's default mapping for java.time.Instant
    -- (entity field AuditLog.timestamp). Plain TIMESTAMP fails ddl-auto=validate.
    timestamp     TIMESTAMPTZ  NOT NULL,
    outcome       VARCHAR(16)
);

CREATE INDEX IF NOT EXISTS idx_audit_user_ts   ON audit_log (user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_entity    ON audit_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log (timestamp);
