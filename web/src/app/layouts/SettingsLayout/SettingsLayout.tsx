import type { ReactNode } from "react";

import { TabNav } from "@/shared/components/TabNav/TabNav";
import { routes } from "@/shared/routes/routes";

type Props = {
  children: ReactNode;
};

const SETTINGS_TABS = [
  { href: routes.settingsProfile(), label: "プロフィール" },
  { href: routes.settingsNotifications(), label: "通知" },
] as const;

// /settings 配下の枠。見出しとタブバーを持ち、タブを切り替えても再マウントされずに残る。
// Page の外側にあってどの Page にも属さないので、AppLayout と同じく app 層に置く (docs/directory-conventions.md の views の節)。
// タブであることを知っているのはこの枠だけで、各タブの view (settings-profile / settings-notifications) は知らない。
export function SettingsLayout({ children }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">設定</h1>
        <TabNav label="設定" links={SETTINGS_TABS} />
      </div>
      {children}
    </div>
  );
}
