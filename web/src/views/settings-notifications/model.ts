// 通知の設定のドメイン型。ユーザーにつき 1 つで id を持たない (docs/screens.md §4)。
// 使う画面がこの view だけなので entities には置かない (docs/directory-conventions.md §1「該当物が出るまで作らない」)。

// 通知の種類。どの通知を出すかは業務の判断なので model に置き、型もここから導く。
export const NOTIFICATION_KINDS = ["readingReminder", "weeklySummary", "noteDigest"] as const;

export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

/** 通知の種類ごとに、受け取るかどうか */
export type NotificationSettings = Record<NotificationKind, boolean>;

// フォームの値。他のフォームは入力したままの文字を再表示するために文字列で持つが、
// checkbox は checked か否かしか無いので真偽値のまま持つ。そのためドメイン型と同じ形になる。
export type NotificationSettingsFormValues = Record<NotificationKind, boolean>;

// useActionState が持つ状態。checkbox は不正な値を入力できないので、項目ごとのエラー (fieldErrors) を持たない。
// 戻り先の画面が無いので、成功しても redirect せずにこの型を返す。
export type NotificationSettingsFormState = {
  values: NotificationSettingsFormValues;
  /** API のエラーなど */
  message?: string;
  /** 直前の送信で保存できたとき true。次の送信の結果で消える */
  saved?: boolean;
};

export type NotificationSettingsFormAction = (
  state: NotificationSettingsFormState,
  formData: FormData,
) => Promise<NotificationSettingsFormState>;
