// テスト専用。Server Action や parse 関数に渡す FormData を、素のオブジェクトから作る。
// disabled な input が送られない状況は、キーを渡さないことで表す。
export function formDataOf(entries: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(entries)) formData.set(name, value);
  return formData;
}
