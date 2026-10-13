"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isCurrentPath } from "@/shared/lib/isCurrentPath";
import { routes } from "@/shared/routes/routes";

type NavLink = {
  href: string;
  label: string;
  /** 現在地とみなすセクションの根。省略すると href。リンク先がセクションの根ではないときに指定する */
  section?: string;
};

// グローバルナビのリンク一覧。画面が増えたらここに足す (docs/screens.md §7)。
// パスは文字列で書かず shared/routes から取る。
// 設定はリンク先がタブの 1 つ目 (/settings/profile) なので、/settings/notifications でも現在地になるよう section を持つ。
const NAV_LINKS: readonly NavLink[] = [
  { href: routes.dashboard(), label: "ダッシュボード" },
  { href: routes.books(), label: "本" },
  { href: routes.settingsProfile(), label: "設定", section: routes.settings() },
];

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
        const current = isCurrentPath(pathname, link.section ?? link.href);
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
