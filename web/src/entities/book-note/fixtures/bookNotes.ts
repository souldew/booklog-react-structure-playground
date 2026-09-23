import type { BookNote, RecentBookNote } from "../model";

// story とテストで使う BookNote。bookId は entities/book/fixtures の reading (id: "2") に合わせる。
export const BOOK_NOTE_FIXTURES: BookNote[] = [
  {
    id: "1",
    bookId: "2",
    page: 12,
    body: "DRY 原則。知識の重複を避ける。コードの重複そのものが悪いわけではない。",
    createdAt: "2026-09-05T03:00:00.000Z",
  },
  {
    id: "2",
    bookId: "2",
    page: 48,
    body: "曳光弾 (tracer bullet)。\n端から端まで通る細い実装を先に作り、そこに肉付けする。\n\nプロトタイプとは違い、捨てない。",
    createdAt: "2026-09-10T12:30:00.000Z",
  },
];

// 本を横断した最近のメモ。新しい順。bookTitle は entities/book/fixtures のタイトルに合わせる。
export const RECENT_BOOK_NOTE_FIXTURES: RecentBookNote[] = [
  { ...BOOK_NOTE_FIXTURES[1]!, bookTitle: "達人プログラマー" },
  {
    id: "3",
    bookId: "3",
    bookTitle: "Clean Architecture",
    page: 203,
    body: "依存の向きを内側に揃える話は、entities と shared の関係そのまま。",
    createdAt: "2026-09-08T12:00:00.000Z",
  },
  { ...BOOK_NOTE_FIXTURES[0]!, bookTitle: "達人プログラマー" },
];
