import { redirect } from "next/navigation";

import { routes } from "@/shared/routes/routes";

// 最終的には /dashboard へ飛ばす (docs/screens.md §1)。段階 4 で /dashboard ができるまでは /books へ。
export default function Page() {
  redirect(routes.books());
}
