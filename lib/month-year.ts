export const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type MonthYear = {
  month: number;
  year: number;
};

export function formatMonthYear(value: MonthYear): string {
  return `${MONTH_LABELS[value.month]} ${value.year}`;
}

export function monthYearStart(value: MonthYear): number {
  return new Date(value.year, value.month, 1).getTime();
}

export function monthYearEnd(value: MonthYear): number {
  return new Date(value.year, value.month + 1, 0, 23, 59, 59, 999).getTime();
}

export function buildYearOptions(past = 8, future = 2): number[] {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let year = current - past; year <= current + future; year++) {
    years.push(year);
  }
  return years;
}
