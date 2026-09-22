import { expect, waitFor } from "storybook/test";

// story の play 専用。until が満たされる (throw しなくなる) まで待ち、その前後で element の上端が動いていないことを検査する。
// Skeleton と中身の高さがずれていると、下にある要素が動いてここで落ちる。
export async function expectStable(element: Element, until: () => unknown, timeout = 5000) {
  const topBefore = element.getBoundingClientRect().top;
  await waitFor(until, { timeout });
  await expect(element.getBoundingClientRect().top).toBe(topBefore);
}
