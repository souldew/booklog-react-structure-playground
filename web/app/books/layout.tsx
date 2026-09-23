import { BookFilterProvider } from "@/features/book-filter/providers/BookFilterProvider";

// 絞り込み条件はセクション寿命。一覧 → 詳細 → 一覧 と往復しても条件が残る。
// UI はここに置かない。入力欄は BookListPage が持つ (docs/screens.md §6)。
export default function BooksLayout({ children }: LayoutProps<"/books">) {
  return <BookFilterProvider>{children}</BookFilterProvider>;
}
