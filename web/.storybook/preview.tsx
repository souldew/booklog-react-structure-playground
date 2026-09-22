import type { Preview } from "@storybook/nextjs-vite";

// Tailwind と shadcn/ui のテーマを story にも当てる。
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
