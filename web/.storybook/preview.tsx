import type { Preview } from "@storybook/nextjs-vite";

import { slotDelayGlobalTypes, slotDelayInitialGlobals, withSlotDelay } from "./slotDelay";

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
  globalTypes: slotDelayGlobalTypes,
  initialGlobals: slotDelayInitialGlobals,
  decorators: [withSlotDelay],
};

export default preview;
