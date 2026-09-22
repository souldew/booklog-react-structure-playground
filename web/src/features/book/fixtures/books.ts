import type { Book } from "../model";

// story とテストで使う Book。状態ごとに 1 冊ずつ揃えておく。
export const BOOK_FIXTURES = {
  unread: {
    id: "1",
    title: "リーダブルコード",
    author: "Dustin Boswell",
    status: "unread",
    totalPages: 260,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  reading: {
    id: "2",
    title: "達人プログラマー",
    author: "David Thomas",
    status: "reading",
    totalPages: 420,
    createdAt: "2026-09-02T00:00:00.000Z",
  },
  onHold: {
    id: "3",
    title: "Clean Architecture",
    author: "Robert C. Martin",
    status: "onHold",
    totalPages: 432,
    createdAt: "2026-09-03T00:00:00.000Z",
  },
  finished: {
    id: "4",
    title: "プログラミング TypeScript",
    author: "Boris Cherny",
    status: "finished",
    totalPages: 336,
    createdAt: "2026-09-04T00:00:00.000Z",
  },
} as const satisfies Record<Book["status"], Book>;

export const BOOK_FIXTURE_LIST: Book[] = Object.values(BOOK_FIXTURES);
