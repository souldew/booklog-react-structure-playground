import { useSuspenseQueries } from "@tanstack/react-query";

import { getGetBookProgressSuspenseQueryOptions } from "@/generated/book-progress/book-progress";

import { toBookProgress } from "../mappers/toBookProgress";
import type { BookProgress } from "../../model";

// 複数の本の進捗をまとめて取る。進捗は本ごとに別エンドポイントなので、本の数だけ並列に叩く。
// 結果は bookIds と同じ並び。本が無い (404) 場合は mutator が throw するので、ここには届かず境界のエラーになる。
export function useBookProgresses(bookIds: string[]): BookProgress[] {
  return useSuspenseQueries({
    queries: bookIds.map((bookId) =>
      getGetBookProgressSuspenseQueryOptions(bookId, {
        query: {
          select: (response) =>
            response.status === 200 ? toBookProgress(response.data) : undefined,
        },
      }),
    ),
    combine: (results) =>
      results.flatMap((result) => (result.data === undefined ? [] : [result.data])),
  });
}
