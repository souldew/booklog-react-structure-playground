"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { EMPTY_BOOK_FILTER, type BookFilter } from "../model";

type BookFilterContextValue = {
  filter: BookFilter;
  updateFilter: (patch: Partial<BookFilter>) => void;
};

const BookFilterContext = createContext<BookFilterContextValue | undefined>(undefined);

// web/app/books/layout.tsx にマウントする。寿命は /books セクション。
// 一覧 → 詳細 → 一覧 と next/link で往復しても条件が残り、フル再読み込みでは消える。
export function BookFilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<BookFilter>(EMPTY_BOOK_FILTER);

  const updateFilter = useCallback((patch: Partial<BookFilter>) => {
    setFilter((current) => ({ ...current, ...patch }));
  }, []);

  const value = useMemo(() => ({ filter, updateFilter }), [filter, updateFilter]);

  return <BookFilterContext.Provider value={value}>{children}</BookFilterContext.Provider>;
}

export function useBookFilter(): BookFilterContextValue {
  const value = useContext(BookFilterContext);
  if (!value) {
    throw new Error("useBookFilter は BookFilterProvider の中で使う");
  }
  return value;
}
