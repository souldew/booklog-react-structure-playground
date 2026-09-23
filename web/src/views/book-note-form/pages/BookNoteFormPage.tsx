import type { ReactNode } from "react";

import { FormPageLayout } from "@/shared/layouts/FormPageLayout/FormPageLayout";

type Props = {
  title: string;
  /** 戻り先。作成も編集もメモ一覧 */
  backHref: string;
  backLabel: string;
  /** フォーム本体。編集では Container が Suspense で包んで注入する。作成ではそのまま置く */
  form: ReactNode;
};

// 作成と編集で共有する骨格。BookFormPage と同じ形で、差は Container 側に出る。
export function BookNoteFormPage({ title, backHref, backLabel, form }: Props) {
  return (
    <FormPageLayout title={title} backHref={backHref} backLabel={backLabel}>
      {form}
    </FormPageLayout>
  );
}
