import type { BookStatus } from "@/entities/book/model";

// 本の一覧の絞り込み条件。Provider が持ち、/books セクションの寿命で残る。
// 「絞り込む」という操作の状態なので、本の実体 (entities/book) ではなくこの feature が持つ。
export type BookFilter = {
  status: BookStatus | "all";
  keyword: string;
};

export const EMPTY_BOOK_FILTER: BookFilter = { status: "all", keyword: "" };
