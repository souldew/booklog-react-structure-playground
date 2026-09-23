import type { Preview } from "@storybook/nextjs-vite";

import { slotDelayGlobalTypes, slotDelayInitialGlobals, withSlotDelay } from "./slotDelay";

// Tailwind と shadcn/ui のテーマを story にも当てる。
import "../src/app/styles/globals.css";

const preview: Preview = {
  parameters: {
    // next/navigation (usePathname など) を story で差し替えるのに要る。現在地は各 story の nextjs.navigation.pathname で指定する
    nextjs: { appDirectory: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: slotDelayGlobalTypes,
  initialGlobals: slotDelayInitialGlobals,
  decorators: [withSlotDelay],
};

export default preview;
