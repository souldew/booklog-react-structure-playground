"use client";

import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { BOOK_STATUS_LABELS } from "@/entities/book/constants";
import { BOOK_STATUSES } from "@/entities/book/model";

import type { BookFilter } from "../../model";
import { useBookFilter } from "../../providers/BookFilterProvider";

const KEYWORD_PLACEHOLDER = "タイトル・著者で絞り込む";

// Provider の条件を読み書きする入力欄。通信はしないので Presentational。
// 「絞り込む」という操作の UI なので、本の一覧画面 (views/book-list) ではなくこの feature が持つ。
export function BookFilterField() {
  const { filter, updateFilter } = useBookFilter();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <NativeSelect
        aria-label="状態"
        value={filter.status}
        onChange={(event) => updateFilter({ status: event.target.value as BookFilter["status"] })}
      >
        <NativeSelectOption value="all">すべて</NativeSelectOption>
        {BOOK_STATUSES.map((status) => (
          <NativeSelectOption key={status} value={status}>
            {BOOK_STATUS_LABELS[status]}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <Input
        type="search"
        className="max-w-sm"
        placeholder={KEYWORD_PLACEHOLDER}
        aria-label={KEYWORD_PLACEHOLDER}
        value={filter.keyword}
        onChange={(event) => updateFilter({ keyword: event.target.value })}
      />
    </div>
  );
}
