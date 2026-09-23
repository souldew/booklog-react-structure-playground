import { defineConfig } from "orval";

// api の openapi.yaml から、型と fetch クライアントを生成する。
// 生成物は src/generated/ に置き、Presentational には渡さない (docs/tech-stack.md §3)。
export default defineConfig({
  booklog: {
    input: {
      target: "../api/openapi.yaml",
    },
    output: {
      target: "./src/generated/api.ts",
      schemas: "./src/generated/model",
      mode: "tags-split",
      // 取得はすべてサーバー (Server Component / Server Action) で行うので、hook は生成しない。
      // 生成されるのはエンドポイントごとの関数だけで、entities の apis/functions がそれを包む。
      client: "fetch",
      httpClient: "fetch",
      clean: true,
      override: {
        // base URL の切り替えは mutator が持つ。生成コードは相対パスだけを渡す。
        mutator: {
          path: "./src/shared/apis/customFetch.ts",
          name: "customFetch",
        },
      },
    },
  },
});
