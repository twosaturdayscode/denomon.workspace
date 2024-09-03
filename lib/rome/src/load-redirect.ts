import type { Params, Screen } from "./concepts/screen.ts";

export const REDIRECT_SYMBOL = Symbol("rome-router-redirect");

export function redirect<
  S extends Screen<never, never, never>,
  Pa extends Params = never
>(
  screen: S,
  ...context: Pa extends never
    ? Partial<[{ search?: unknown }]>
    : [{ params: Pa; search?: unknown }]
) {
  return { [REDIRECT_SYMBOL]: [screen, context[0]] };
}

export function isRedirect(
  screen: Record<string | symbol, unknown>
): screen is { [REDIRECT_SYMBOL]: Screen<never, never, never> } {
  return screen && typeof screen === "object" && REDIRECT_SYMBOL in screen;
}
