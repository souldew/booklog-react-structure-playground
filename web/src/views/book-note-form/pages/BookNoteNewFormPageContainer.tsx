import { routes } from "@/shared/routes/routes";

import { createBookNote } from "../apis/functions/createBookNote";
import { BookNoteForm } from "../components/BookNoteForm/BookNoteForm";
import { EMPTY_BOOK_NOTE_FORM_VALUES } from "../model";
import { BookNoteFormPage } from "./BookNoteFormPage";

type Props = {
  bookId: string;
};

// 作成。親 id を持つ作成なので bookId は受け取るが、取得はしない。Suspense も Container も無い。
// bookId は Server Action に bind し、フォームには現れない。
export function BookNoteNewFormPageContainer({ bookId }: Props) {
  return (
    <BookNoteFormPage
      title="メモを追加"
      backHref={routes.bookNotes(bookId)}
      backLabel="メモ一覧へ"
      form={
        <BookNoteForm
          action={createBookNote.bind(null, bookId)}
          defaultValues={EMPTY_BOOK_NOTE_FORM_VALUES}
          submitLabel="追加する"
        />
      }
    />
  );
}
