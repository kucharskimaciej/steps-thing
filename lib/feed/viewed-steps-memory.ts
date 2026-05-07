const viewedStepIds = new Set<string>();

export function hasViewedStepThisLoad(stepId: string): boolean {
  return viewedStepIds.has(stepId);
}

export function markStepViewedThisLoad(stepId: string): void {
  viewedStepIds.add(stepId);
}

export function resetViewedStepsForTests(): void {
  viewedStepIds.clear();
}
