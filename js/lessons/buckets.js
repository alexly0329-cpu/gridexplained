// Hours in the standard power blocks for one calendar month.
// 5×16 on-peak: weekdays, 16 hours a day, excluding NERC holidays. 2×16: weekend and holiday days, 16 hours. 7×8: every night, 8 hours.
// month is 1–12; holidays is a list of day numbers that are NERC holidays in that month (New Year's Day, Memorial Day, Independence Day, Labor Day, Thanksgiving, Christmas).
export function bucketHours(year, month, holidays = []) {
  const days = new Date(year, month, 0).getDate();
  let onDays = 0, offDays = 0;
  for (let d = 1; d <= days; d++) {
    const wd = new Date(year, month - 1, d).getDay();
    if (wd > 0 && wd < 6 && !holidays.includes(d)) onDays++; else offDays++;
  }
  return { days, onDays, offDays, onPeak: onDays * 16, offDayHours: offDays * 16, nights: days * 8, total: days * 24 };
}
