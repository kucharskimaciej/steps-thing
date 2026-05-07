const stopCharacters = /[\s\d!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~\-–—]+/gu;

export function tokenizeStepName(name: string, locale = "pl-PL"): string[] {
  const words = name
    .toLocaleLowerCase(locale)
    .replace(stopCharacters, " ")
    .trim()
    .split(/\s+/u)
    .filter((word) => word.length > 2);

  if (words.length === 0) {
    return [];
  }

  const tokens: string[] = [];

  for (let size = 1; size <= 4; size += 1) {
    for (let start = 0; start <= words.length - size; start += 1) {
      tokens.push(words.slice(start, start + size).join("|"));
    }
  }

  return tokens;
}
