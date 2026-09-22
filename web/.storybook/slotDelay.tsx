import type { Decorator, Preview } from "@storybook/nextjs-vite";
import { type ReactNode, Suspense, use, useMemo } from "react";

// ツールバーの「スロットの遅延」。
// Page の story は parameters.slots に「スロット名 → Skeleton」を宣言する。
// 遅延を選ぶと、その間だけ Skeleton を出してから中身に切り替わるので、Skeleton からの切り替わり (レイアウトシフト) が見える。
// story から直接 import するものではなく、preview.tsx が登録して全 story に効かせる。

export const slotDelayGlobalTypes: Preview["globalTypes"] = {
  slotDelay: {
    description: "スロットの遅延",
    toolbar: {
      icon: "time",
      items: [
        { value: 0, title: "遅延なし" },
        { value: 800, title: "800ms" },
        { value: 2000, title: "2s" },
      ],
      dynamicTitle: true,
    },
  },
};

export const slotDelayInitialGlobals: Preview["initialGlobals"] = { slotDelay: 0 };

export const withSlotDelay: Decorator = (Story, { args, parameters, globals }) => {
  const slots = parameters.slots as Record<string, ReactNode> | undefined;
  const ms = Number(globals.slotDelay);
  if (!slots || ms === 0) return <Story />;

  const delayed = Object.fromEntries(
    Object.entries(slots).map(([name, fallback]) => [
      name,
      <Delayed key={name} ms={ms} fallback={fallback}>
        {args[name]}
      </Delayed>,
    ]),
  );
  return <Story args={{ ...args, ...delayed }} />;
};

type DelayedProps = {
  ms: number;
  fallback: ReactNode;
  children: ReactNode;
};

// 指定ミリ秒の間 fallback を出し、その後 children に切り替える。
function Delayed({ ms, fallback, children }: DelayedProps) {
  // Suspense 境界の内側は、初回に suspend すると丸ごと捨てられて作り直される。
  // Promise を境界の内側で作ると毎回新しくなって解決しないので、境界の外であるここで持つ。
  const promise = useMemo(() => new Promise<void>((resolve) => setTimeout(resolve, ms)), [ms]);

  return (
    <Suspense fallback={fallback}>
      <Resolve promise={promise}>{children}</Resolve>
    </Suspense>
  );
}

function Resolve({ promise, children }: { promise: Promise<void>; children: ReactNode }) {
  use(promise);
  return children;
}
