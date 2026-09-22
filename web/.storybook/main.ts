import type { StorybookConfig } from "@storybook/nextjs-vite";

// story は実装とコロケーションする (docs/directory-conventions.md「story とテスト」)。
// Presentational と Skeleton だけに書き、Container には書かない。
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-vitest", "@storybook/addon-docs"],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
};

export default config;
