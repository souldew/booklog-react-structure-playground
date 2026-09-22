import type { DatabaseSync } from "node:sqlite";

type BookSeed = {
  title: string;
  author: string;
  status: "unread" | "reading" | "on_hold" | "finished";
  totalPages: number;
  currentPage: number;
  createdAt: string;
  notes: { page: number; body: string; createdAt: string }[];
};

const books: BookSeed[] = [
  {
    title: "リファクタリング 第2版",
    author: "Martin Fowler",
    status: "reading",
    totalPages: 456,
    currentPage: 210,
    createdAt: "2026-06-03T09:00:00.000Z",
    notes: [
      {
        page: 48,
        body: "「不吉な臭い」の一覧は、レビューのチェックリストとして使えそう。",
        createdAt: "2026-06-10T13:20:00.000Z",
      },
      {
        page: 132,
        body: "関数の抽出は、名前を付けられるかどうかで判断する。",
        createdAt: "2026-07-02T21:05:00.000Z",
      },
    ],
  },
  {
    title: "Clean Architecture",
    author: "Robert C. Martin",
    status: "finished",
    totalPages: 352,
    currentPage: 352,
    createdAt: "2026-04-15T09:00:00.000Z",
    notes: [
      {
        page: 203,
        body: "依存の向きを内側に揃える話は、features と shared の関係そのまま。",
        createdAt: "2026-05-01T12:00:00.000Z",
      },
    ],
  },
  {
    title: "Domain Modeling Made Functional",
    author: "Scott Wlaschin",
    status: "on_hold",
    totalPages: 312,
    currentPage: 64,
    createdAt: "2026-08-20T09:00:00.000Z",
    notes: [],
  },
  {
    title: "Learning Domain-Driven Design",
    author: "Vlad Khononov",
    status: "reading",
    totalPages: 340,
    currentPage: 120,
    createdAt: "2026-07-28T09:00:00.000Z",
    notes: [
      {
        page: 77,
        body: "境界付けられたコンテキストと、view の domain の切り方は同じ発想で読める。",
        createdAt: "2026-08-05T22:40:00.000Z",
      },
    ],
  },
  {
    title: "達人プログラマー 第2版",
    author: "David Thomas, Andrew Hunt",
    status: "finished",
    totalPages: 424,
    currentPage: 424,
    createdAt: "2026-03-02T09:00:00.000Z",
    notes: [],
  },
  {
    title: "Software Engineering at Google",
    author: "Titus Winters, Tom Manshreck, Hyrum Wright",
    status: "unread",
    totalPages: 600,
    currentPage: 0,
    createdAt: "2026-09-10T09:00:00.000Z",
    notes: [],
  },
];

export function seed(db: DatabaseSync): void {
  const insertBook = db.prepare(
    `INSERT INTO books (title, author, status, total_pages, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  );
  const insertProgress = db.prepare(
    `INSERT INTO book_progress (book_id, current_page, updated_at) VALUES (?, ?, ?)`,
  );
  const insertNote = db.prepare(
    `INSERT INTO book_notes (book_id, page, body, created_at) VALUES (?, ?, ?, ?)`,
  );

  for (const book of books) {
    const { lastInsertRowid } = insertBook.run(
      book.title,
      book.author,
      book.status,
      book.totalPages,
      book.createdAt,
    );
    const bookId = Number(lastInsertRowid);
    insertProgress.run(bookId, book.currentPage, book.createdAt);
    for (const note of book.notes) {
      insertNote.run(bookId, note.page, note.body, note.createdAt);
    }
  }

  db.prepare(`INSERT INTO profile_settings (id, display_name, bio) VALUES (1, ?, ?)`).run(
    "souldew",
    "設計の本を中心に読んでいます。",
  );
  db.prepare(
    `INSERT INTO notification_settings (id, reading_reminder, weekly_summary, note_digest)
     VALUES (1, 1, 1, 0)`,
  ).run();
}
