CREATE TABLE books (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  author      TEXT    NOT NULL,
  status      TEXT    NOT NULL CHECK (status IN ('unread', 'reading', 'on_hold', 'finished')),
  total_pages INTEGER NOT NULL,
  created_at  TEXT    NOT NULL
);

-- books と 1:1。独自の id を持たず、book_id が主キー。
CREATE TABLE book_progress (
  book_id      INTEGER PRIMARY KEY REFERENCES books(id) ON DELETE CASCADE,
  current_page INTEGER NOT NULL DEFAULT 0,
  updated_at   TEXT    NOT NULL
);

-- books と 1:N。
CREATE TABLE book_notes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id    INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  page       INTEGER NOT NULL,
  body       TEXT    NOT NULL,
  created_at TEXT    NOT NULL
);

-- ユーザーは 1 人だけなので単一行。id = 1 に固定する。
CREATE TABLE profile_settings (
  id           INTEGER PRIMARY KEY CHECK (id = 1),
  display_name TEXT    NOT NULL,
  bio          TEXT    NOT NULL
);

CREATE TABLE notification_settings (
  id               INTEGER PRIMARY KEY CHECK (id = 1),
  reading_reminder INTEGER NOT NULL,
  weekly_summary   INTEGER NOT NULL,
  note_digest      INTEGER NOT NULL
);
