import type { BookNote } from "../model";

// story とテストで使う BookNote。bookId は features/book/fixtures の reading (id: "2") に合わせる。
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
