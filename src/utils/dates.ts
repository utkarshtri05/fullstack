export function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function monthLabel(month: number, year: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(new Date(year, month - 1, 1));
}
