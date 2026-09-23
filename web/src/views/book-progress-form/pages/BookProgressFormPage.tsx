import type { ReactNode } from "react";

import { FormPageLayout } from "@/shared/layouts/FormPageLayout/FormPageLayout";
import { routes } from "@/shared/routes/routes";

type Props = {
  bookId: string;
  /** フォーム本体。Container が Suspense で包んで注入する */
  form: ReactNode;
};

// 単一リソースの form。作成と編集の区別が無いので、タイトルも戻り先も固定で props に出ない。
// BookFormPage / BookNoteFormPage が title / backHref を props で受けるのは new と edit で変わるからで、ここでは変わらない。
export function BookProgressFormPage({ bookId, form }: Props) {
  return (
    <FormPageLayout title="進捗を更新" backHref={routes.bookDetail(bookId)} backLabel="詳細へ">
      {form}
    </FormPageLayout>
  );
}
