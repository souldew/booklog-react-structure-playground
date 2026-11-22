import { redirect } from "next/navigation";

import { routes } from "@/shared/routes/routes";

// /settings 自体は画面を持たず、1 つ目のタブへ送る。
export default function Page() {
  redirect(routes.settingsProfile());
}
