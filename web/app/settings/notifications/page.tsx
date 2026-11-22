import { SettingsNotificationsPageContainer } from "@/views/settings-notifications/pages/SettingsNotificationsPageContainer";

// 複数形だが通知のコレクションではなく設定の区分なので、この下に動的セグメントは無い (docs/screens.md §2)。
export default function Page() {
  return <SettingsNotificationsPageContainer />;
}
