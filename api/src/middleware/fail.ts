import { createMiddleware } from "hono/factory";

// エラー表示を確認するための仕掛け。?fail=1 を付けたリクエストは必ず 500 を返す。
export const fail = createMiddleware(async (c, next) => {
  if (c.req.query("fail") === "1") {
    return c.json({ message: "failed on purpose (?fail=1)" }, 500);
  }
  await next();
});
