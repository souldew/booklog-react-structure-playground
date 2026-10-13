"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isCurrentPath } from "@/shared/lib/isCurrentPath";

export type TabNavLink = {
  href: string;
  label: string;
};

type Props = {
  /** タブの並び。URL は呼ぶ側が shared/routes から取って渡す */
  links: readonly TabNavLink[];
  /** nav のアクセシブルな名前 */
  label: string;
};

// URL の静的セグメントをタブとして並べる。タブの切り替えは画面遷移で、どのタブが選ばれているかは URL だけが持つ。
// そのため role="tablist" ではなくリンクの並び (nav) にし、現在地は aria-current で示す。
// usePathname を読むので Client Component。通信はしないので Presentational。
export function TabNav({ links, label }: Props) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="flex gap-4 border-b">
      {links.map((link) => {
        const current = isCurrentPath(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
            className={
              current
                ? "-mb-px border-b-2 border-foreground pb-2 text-sm font-medium text-foreground"
                : "-mb-px border-b-2 border-transparent pb-2 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
