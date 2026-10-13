import { SettingsLayout } from "@/app/layouts/SettingsLayout/SettingsLayout";

// /settings 配下の枠 (見出しとタブバー)。タブを切り替えても再マウントされない。
// books/layout.tsx が Provider だけをマウントするのに対し、こちらは UI の枠をマウントする (docs/screens.md §7)。
export default function Layout({ children }: LayoutProps<"/settings">) {
  return <SettingsLayout>{children}</SettingsLayout>;
}
