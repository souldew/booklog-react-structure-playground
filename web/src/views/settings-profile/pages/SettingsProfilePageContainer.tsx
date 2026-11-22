import { Suspense } from "react";

import { ProfileSettingsFormContainer } from "../components/ProfileSettingsForm/ProfileSettingsFormContainer";
import { ProfileSettingsFormSkeleton } from "../components/ProfileSettingsFormSkeleton/ProfileSettingsFormSkeleton";
import { SettingsProfilePage } from "./SettingsProfilePage";

// 単一リソースなので Container は 1 つで、常に取得するので Suspense がある (book-progress-form と同じ形)。
// URL パラメータが無いので props も無い。
export function SettingsProfilePageContainer() {
  return (
    <SettingsProfilePage
      form={
        <Suspense fallback={<ProfileSettingsFormSkeleton />}>
          <ProfileSettingsFormContainer />
        </Suspense>
      }
    />
  );
}
