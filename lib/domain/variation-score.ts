type VariationScoreInput = {
  sourceTokens: string[];
  candidateTokens: string[];
  sourceTags: string[];
  candidateTags: string[];
};

function tokenChainScore(token: string): number {
  const chainLength = token.split("|").length;

  return chainLength * chainLength;
}

export function scoreVariationCandidate({
  sourceTokens,
  candidateTokens,
  sourceTags,
  candidateTags,
}: VariationScoreInput): number {
  const candidateTokenSet = new Set(candidateTokens);
  const candidateTagSet = new Set(candidateTags);

  const tokenScore = sourceTokens
    .filter((token) => candidateTokenSet.has(token))
    .reduce((score, token) => score + tokenChainScore(token), 0);

  const tagScore = sourceTags
    .filter((tag) => candidateTagSet.has(tag))
    .reduce((score, _tag, index) => score + (index + 1) * 10, 0);

  return tokenScore + tagScore;
}
