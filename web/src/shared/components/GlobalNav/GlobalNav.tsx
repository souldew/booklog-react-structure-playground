"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "@/shared/routes/routes";

// グローバルナビのリンク一覧。画面が増えたらここに足す (docs/screens.md §7)。
// パスは文字列で書かず shared/routes から取る。
const NAV_LINKS = [
  { href: routes.dashboard(), label: "ダッシュボード" },
  { href: routes.books(), label: "本" },
] as const;

// 現在地の判定。/books のリンクは /books/1 のような下の階層でも現在地とみなす。
// ただし / (ルート) は完全一致だけ。前方一致にすると全ページで現在地になる。
function isCurrent(pathname: string, href: string): boolean {
  if (href === routes.home()) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

// 静的なリンクだけを並べる。ユーザー情報など取得が要るものは持たない (それは widgets の仕事)。
// usePathname を読むので Client Component。通信はしないので Presentational。
export function GlobalNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
      <Link href={routes.home()} className="font-semibold">
        booklog
      </Link>
      {NAV_LINKS.map((link) => {
        const current = isCurrent(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
            className={
              current
                ? "text-sm font-medium text-foreground"
                : "text-sm text-muted-foreground hover:text-foreground"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
