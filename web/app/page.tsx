import { redirect } from "next/navigation";

import { routes } from "@/shared/routes/routes";

// / はダッシュボードへのリダイレクト (docs/screens.md §1)。
export default function Page() {
  redirect(routes.dashboard());
}
