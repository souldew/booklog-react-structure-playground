import { createMiddleware } from "hono/factory";

// ローディング表示を目視できるように、エンドポイントごとに人工的な遅延を入れる。
// /dashboard は 1 画面ぶんをまとめて返すので、一番重い /books に合わせて待ちの長さを見せる。
const rules: [RegExp, number][] = [
  [/^\/books$/, 1200],
  [/^\/books\/[^/]+$/, 400],
  [/^\/dashboard$/, 1200],
];
const DEFAULT_DELAY_MS = 200;

// API_DELAY=0 で無効にできる。curl での確認やスクリプトから叩くときに使う。
const enabled = process.env.API_DELAY !== "0";

export const delay = createMiddleware(async (c, next) => {
  if (enabled && c.req.path !== "/doc") {
    const ms = rules.find(([pattern]) => pattern.test(c.req.path))?.[1] ?? DEFAULT_DELAY_MS;
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
  await next();
});
