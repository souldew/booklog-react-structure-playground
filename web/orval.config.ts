import { defineConfig } from "orval";

// api の openapi.yaml から、型・fetch クライアント・TanStack Query の hook を生成する。
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
      client: "react-query",
      httpClient: "fetch",
      clean: true,
      override: {
        // base URL の切り替えは mutator が持つ。生成コードは相対パスだけを渡す。
        mutator: {
          path: "./src/shared/apis/customFetch.ts",
          name: "customFetch",
        },
        // hook は既定のまま。GET は useQuery、それ以外は useMutation になる。
        // query.useQuery / useMutation を明示的に true にすると全メソッドに両方が生えるので触らない。
      },
    },
  },
});
