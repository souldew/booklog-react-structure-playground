import type { ReactNode } from "react";

import { formatDate } from "@/shared/lib/formatDate";

import type { BookNote } from "../../model";

type Props = {
  notes: BookNote[];
  /** 1 件ごとにメタ行の右端へ出す操作。何を出すかは使う側の view が決める */
  actions?: (note: BookNote) => ReactNode;
};

// メモの一覧。メモには詳細画面が無いので、本文をここに全部出す。
// 本の詳細 (views/book-detail) とメモ一覧 (views/book-note-list) の両方から使う実体の表示なので entities に置く
// (実体の表示は entities。docs/directory-conventions.md)。
// 編集リンクのような操作は実体の関心ではないので、actions で受け取って置き場所だけを決める。
export function BookNoteList({ notes, actions }: Props) {
  if (notes.length === 0) {
    return <p className="text-sm text-muted-foreground">メモはまだありません</p>;
  }

  return (
    <ul className="divide-y rounded-md border">
      {notes.map((note) => (
        <li key={note.id} className="space-y-1 p-3 text-sm">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>ページ {note.page}</span>
            <span>{formatDate(note.createdAt)}</span>
            {actions && <div className="ml-auto">{actions(note)}</div>}
          </div>
          <p className="whitespace-pre-wrap">{note.body}</p>
        </li>
      ))}
    </ul>
  );
}
