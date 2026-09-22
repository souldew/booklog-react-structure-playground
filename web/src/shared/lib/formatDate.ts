// ISO 8601 の文字列を日本語の日付にする。
// タイムゾーンを固定するのは、サーバーとブラウザで結果がずれて hydration の警告が出るのを防ぐため。
const formatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Tokyo",
});

export function formatDate(iso: string): string {
  return formatter.format(new Date(iso));
}
