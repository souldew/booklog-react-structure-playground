import path from "node:path";
import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// 2 つの project に分ける (docs/tech-stack.md §7)。
// - unit: apis/mappers と lib の純粋関数。node で動かす
// - storybook: story を Playwright の chromium で動かす。通信は行わないので msw は入れない
export default defineConfig({
  resolve: {
    alias: { "@": path.join(dirname, "src") },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, ".storybook") })],
        // components/ui が使う外部依存。列挙しないと Vite がテスト中に最適化して再読み込みし、
        // 初回の実行だけ story が落ちる (docs/setup.md §9)。
        optimizeDeps: {
          include: [
            "@base-ui/react/button",
            "@base-ui/react/input",
            "@base-ui/react/merge-props",
            "@base-ui/react/use-render",
            "class-variance-authority",
            "cn",
            "lucide-react",
          ],
        },
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
