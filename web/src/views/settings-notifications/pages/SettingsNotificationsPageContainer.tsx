import { Suspense } from "react";

import { NotificationSettingsFormContainer } from "../components/NotificationSettingsForm/NotificationSettingsFormContainer";
import { NotificationSettingsFormSkeleton } from "../components/NotificationSettingsFormSkeleton/NotificationSettingsFormSkeleton";
import { SettingsNotificationsPage } from "./SettingsNotificationsPage";

// 単一リソースなので Container は 1 つで、常に取得するので Suspense がある。URL パラメータが無いので props も無い。
export function SettingsNotificationsPageContainer() {
  return (
    <SettingsNotificationsPage
      form={
        <Suspense fallback={<NotificationSettingsFormSkeleton />}>
          <NotificationSettingsFormContainer />
        </Suspense>
      }
    />
  );
}
