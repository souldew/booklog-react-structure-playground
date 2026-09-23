import { useListBooksSuspense } from "@/generated/books/books";

import { toBookStatusResponse } from "../mappers/mapBookStatus";
import { toBook } from "../mappers/toBook";
import type { Book, BookStatus } from "../../model";

type Filter = {
  status?: BookStatus;
};

// fetchBooks のクライアント版。状態で絞るときは api のクエリに載せる (ドメインの onHold は api の on_hold にする)。
export function useBooks(filter: Filter = {}): Book[] {
  const { data } = useListBooksSuspense(
    filter.status === undefined ? undefined : { status: toBookStatusResponse(filter.status) },
    { query: { select: (response) => response.data.map(toBook) } },
  );
  return data;
}
