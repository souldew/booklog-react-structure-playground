import type { ReactNode } from "react";

type Props = {
  /** フォーム本体。Container が Suspense で包んで注入する */
  form: ReactNode;
};

// /settings/notifications の画面。自分がタブの中身であることは知らない。タブバーと「設定」の見出しは
// /settings のレイアウト (src/app/layouts/SettingsLayout) が持ち、この Page はその内側に描かれる。
export function SettingsNotificationsPage({ form }: Props) {
  return (
    <section aria-labelledby="settings-notifications-heading" className="space-y-4">
      <h2 id="settings-notifications-heading" className="text-lg font-semibold">
        通知
      </h2>
      {form}
    </section>
  );
}
