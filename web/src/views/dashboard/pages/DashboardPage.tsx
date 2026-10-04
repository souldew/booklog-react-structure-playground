import Link from "next/link";
import type { ReactNode } from "react";

import { routes } from "@/shared/routes/routes";

type Props = {
  /** 読書中の本。Container が Suspense で包んで注入する */
  reading: ReactNode;
  /** 最近のメモ。reading とは別の境界 */
  notes: ReactNode;
  /** 月別の記録。さらに別の境界 */
  stats: ReactNode;
};

type PanelProps = {
  title: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

// DashboardPage の付属品。カードの枠と見出し。データに依存しないので境界の外にある。
function DashboardPanel({ title, action, className, children }: PanelProps) {
  return (
    <section className={`space-y-3 rounded-md border p-4 ${className ?? ""}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

// 本・メモ・統計の 3 ドメインを横断する画面。CRUD に対応しないので view 名に suffix が無い (docs/screens.md §3)。
// パネルの枠と見出しは境界の外、中身はパネルごとに別々の境界。api の遅延が違うので、速いパネルから順に出る。
export function DashboardPage({ reading, notes, stats }: Props) {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">ダッシュボード</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardPanel
          title="読書中の本"
          action={
            <Link href={routes.books()} className="text-sm text-muted-foreground hover:underline">
              本の一覧へ
            </Link>
          }
        >
          {reading}
        </DashboardPanel>
        <DashboardPanel title="最近のメモ">{notes}</DashboardPanel>
        <DashboardPanel title="月別の記録" className="lg:col-span-2">
          {stats}
        </DashboardPanel>
      </div>
    </div>
  );
}
