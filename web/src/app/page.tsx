import { redirect } from "next/navigation";

// 最終的には /dashboard へ飛ばす (docs/screens.md §1)。段階 4 で /dashboard ができるまでは /books へ。
export default function Page() {
  redirect("/books");
}
