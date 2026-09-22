// Server Action の戻り値。throw すると error.tsx に落ちてしまうので、
// 行単位や項目単位で扱いたい失敗は値で返す。
export type ActionResult = { ok: true } | { ok: false; message: string };
