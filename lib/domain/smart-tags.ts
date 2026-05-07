import type { AppConfig } from "./config";

const boundary = "[^\\p{L}\\p{N}_]";

function matcherRegex(pattern: string): RegExp {
  return new RegExp(`(^|${boundary})(?:${pattern})($|${boundary})`, "iu");
}

export function matchSmartTags(text: string, config: AppConfig): string[] {
  return config.smartTagMatchers
    .filter((matcher) =>
      matcher.patterns.some((pattern) => matcherRegex(pattern).test(text)),
    )
    .map((matcher) => matcher.tag)
    .sort((left, right) => left.localeCompare(right, "pl-PL"));
}
