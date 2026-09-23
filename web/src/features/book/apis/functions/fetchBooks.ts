import { listBooks } from "@/generated/books/books";

import { toBook } from "../mappers/toBook";
import { toBookStatusResponse } from "../mappers/mapBookStatus";
import type { Book, BookStatus } from "../../model";

type Filter = {
  status?: BookStatus;
};

// 生成クライアントを包んでドメイン型で返す。Container はここだけを呼ぶ。
// 状態で絞るときは api のクエリに載せる (ドメインの onHold は api の on_hold にする)。
// 一覧画面の絞り込みはクライアント側 (lib/filterBooks) で行うので、こちらは取得の時点で絞りたい呼び手が使う。
export async function fetchBooks(filter: Filter = {}): Promise<Book[]> {
  const response = await listBooks(
    filter.status === undefined ? undefined : { status: toBookStatusResponse(filter.status) },
  );
  return response.data.map(toBook);
}
