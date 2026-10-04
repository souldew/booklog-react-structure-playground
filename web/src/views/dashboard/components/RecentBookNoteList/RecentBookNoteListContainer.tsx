import { fetchRecentBookNotes } from "@/entities/book-note/apis/functions/fetchRecentBookNotes";

import { RecentBookNoteList } from "./RecentBookNoteList";

// サーバーで取得して Presentational に渡す。件数は api の既定 (5 件) に任せる。
export async function RecentBookNoteListContainer() {
  const notes = await fetchRecentBookNotes();
  return <RecentBookNoteList notes={notes} />;
}
