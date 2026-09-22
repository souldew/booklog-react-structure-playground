// Book ドメインの model。型と、型を導く元になる値を置く (docs/directory-conventions.md「model と constants の線引き」)。
// 生成された API 型 (snake_case、id は number) とは別物で、両者の変換は lib/ の mapper が持つ。
// Presentational はこちらだけを知る。

// 値の一覧も要る (絞り込みの選択肢など) ので、配列から型を導く。
// API の on_hold はドメインでは onHold。この差を apis/mappers/mapBookStatus.ts が埋める。
export const BOOK_STATUSES = ["unread", "reading", "onHold", "finished"] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];

export type Book = {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  totalPages: number;
  /** ISO 8601 */
  createdAt: string;
};

// 一覧の絞り込み条件。Provider が持ち、セクション寿命で残る。
export type BookFilter = {
  status: BookStatus | "all";
  keyword: string;
};

export const EMPTY_BOOK_FILTER: BookFilter = { status: "all", keyword: "" };
