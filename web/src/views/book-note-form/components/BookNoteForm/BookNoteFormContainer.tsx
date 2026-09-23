import { notFound } from "next/navigation";

import { fetchBookNotes } from "@/features/book-note/apis/functions/fetchBookNotes";

import { updateBookNote } from "../../apis/functions/updateBookNote";
import { toBookNoteFormValues } from "../../lib/toBookNoteFormValues";
import { BookNoteForm } from "./BookNoteForm";

type Props = {
  bookId: string;
  noteId: string;
};

// 編集画面だけが使う Container。作成画面には対応する Container が無い (取得するものが無い)。
// メモには単体の GET が無い (詳細画面を作らないため。docs/backend.md §4)。一覧を取って noteId で選ぶ。
// 本が無ければ一覧が undefined、メモが無ければ find が外れる。どちらも notFound()。
export async function BookNoteFormContainer({ bookId, noteId }: Props) {
  const notes = await fetchBookNotes(bookId);
  const note = notes?.find((candidate) => candidate.id === noteId);
  if (!note) notFound();

  return (
    <BookNoteForm
      action={updateBookNote.bind(null, bookId, note.id)}
      defaultValues={toBookNoteFormValues(note)}
      submitLabel="保存する"
    />
  );
}
