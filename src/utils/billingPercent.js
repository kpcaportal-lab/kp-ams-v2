export function billingPercent(billed, budget) {
  if (!budget || budget === 0) return 0;
  return Math.round((billed / budget) * 100);
}

export function billingPercentColor(pct) {
  if (pct >= 90) return '#15803d';
  if (pct >= 80) return '#1E5FA8';
  return '#ca8a04';
}
