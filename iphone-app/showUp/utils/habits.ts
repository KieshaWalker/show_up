export const frequencyWeekMultiplier: Record<string, number> = {
  daily: 7,
  weekly: 1,
  monthly: 0.25,
  'every-other-day': 4,
  'twice-a-week': 2,
  'three-times-a-week': 3,
  weekdays: 5,
  weekends: 2,
};

export function weeklyTarget(frequency: string) {
  return frequencyWeekMultiplier[frequency] ?? 0;
}
