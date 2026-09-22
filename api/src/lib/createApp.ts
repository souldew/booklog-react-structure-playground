import { OpenAPIHono } from "@hono/zod-openapi";

// バリデーション失敗時のレスポンスをそろえる。
// defaultHook は .openapi() を呼ぶインスタンスごとに要るので、ルートの作成はここを通す。
export function createApp() {
  return new OpenAPIHono({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          {
            message: "validation failed",
            issues: result.error.issues,
          },
          400,
        );
      }
    },
  });
}
