// 画面の URL を組み立てる関数。URL の形を知っているのはここと app/ のルート定義だけで、
// リンクを書く側 (views、features、entities、app のレイアウト) は文字列を組まずにこれを呼ぶ。
// 引数は id の文字列だけで、どの本かを取得する処理は持たない (それは呼ぶ側の仕事)。
// キー名は docs/screens.md の view 名に対応させる。
export const routes = {
  home: () => "/",
  books: () => "/books",
  bookNew: () => "/books/new",
  bookDetail: (bookId: string) => `/books/${bookId}`,
  bookEdit: (bookId: string) => `/books/${bookId}/edit`,
  bookNotes: (bookId: string) => `/books/${bookId}/notes`,
  bookNoteNew: (bookId: string) => `/books/${bookId}/notes/new`,
  bookNoteEdit: (bookId: string, noteId: string) => `/books/${bookId}/notes/${noteId}/edit`,
  bookProgress: (bookId: string) => `/books/${bookId}/progress`,
} as const;
