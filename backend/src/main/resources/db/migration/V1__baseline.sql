-- V1 baseline schema for Peak Kinetics.
--
-- On prod, Flyway runs with baseline-on-migrate=true baseline-version=1, so
-- this file is stamped as "already applied" on the first run against an
-- existing database. It is only executed on fresh environments.
--
-- Keep this file in sync with current entity definitions. When reconciling
-- against production, replace the contents of this file with the output of:
--   pg_dump --schema-only --no-owner --no-privileges $DATABASE_URL

CREATE TABLE IF NOT EXISTS admin_user (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(10)   NOT NULL,
    first_name      VARCHAR(100)  NOT NULL,
    last_name       VARCHAR(100)  NOT NULL,
    email           VARCHAR(255)  NOT NULL,
    password_hash   VARCHAR(255)  NOT NULL,
    role            VARCHAR(50),
    last_login      TIMESTAMP,
    created_at      TIMESTAMP     NOT NULL,
    updated_at      TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_email ON admin_user (email);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id          BIGSERIAL PRIMARY KEY,
    token       VARCHAR(255) NOT NULL UNIQUE,
    user_id     BIGINT       NOT NULL REFERENCES admin_user(id),
    expires_at  TIMESTAMP    NOT NULL,
    used        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP
);

CREATE TABLE IF NOT EXISTS videos (
    id             BIGSERIAL PRIMARY KEY,
    title          VARCHAR(255) NOT NULL,
    description    TEXT,
    video_url      VARCHAR(500) NOT NULL,
    thumbnail_url  VARCHAR(500),
    category       VARCHAR(255),
    created_at     TIMESTAMP    NOT NULL,
    updated_at     TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id                 BIGSERIAL PRIMARY KEY,
    name               VARCHAR(100) NOT NULL,
    rating             INTEGER      NOT NULL,
    text               TEXT         NOT NULL,
    published          BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMP,
    source             VARCHAR(20)  NOT NULL DEFAULT 'LOCAL',
    google_review_id   VARCHAR(255) UNIQUE,
    author_url         TEXT,
    author_photo_url   TEXT,
    reply              TEXT
);

CREATE TABLE IF NOT EXISTS blog_posts (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    slug            VARCHAR(255) NOT NULL,
    excerpt         TEXT,
    content         TEXT         NOT NULL,
    featured_image  VARCHAR(500),
    status          VARCHAR(20)  NOT NULL DEFAULT 'draft',
    author_id       BIGINT REFERENCES admin_user(id),
    tags            VARCHAR(255),
    published_at    TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL,
    updated_at      TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_slug ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_status ON blog_posts (status);
CREATE INDEX IF NOT EXISTS idx_published_at ON blog_posts (published_at);

CREATE TABLE IF NOT EXISTS messages (
    id                 BIGSERIAL PRIMARY KEY,
    thread_id          BIGINT,
    parent_message_id  BIGINT REFERENCES messages(id),
    is_reply           BOOLEAN NOT NULL DEFAULT FALSE,
    sender_type        VARCHAR(20) NOT NULL DEFAULT 'customer',
    first_name         VARCHAR(100),
    last_name          VARCHAR(100),
    email              VARCHAR(255) NOT NULL,
    phone              VARCHAR(20),
    address            TEXT,
    message            TEXT NOT NULL,
    read               BOOLEAN NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMP NOT NULL,
    updated_at         TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_read ON messages (read);
CREATE INDEX IF NOT EXISTS idx_created_at ON messages (created_at);
CREATE INDEX IF NOT EXISTS idx_thread_id ON messages (thread_id);
CREATE INDEX IF NOT EXISTS idx_parent_message_id ON messages (parent_message_id);
