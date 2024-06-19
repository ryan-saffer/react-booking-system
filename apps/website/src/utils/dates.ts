export function getDateSuffix(day: number): string {
  if (day < 1 || day > 31) {
    throw new Error("Invalid day of the month");
  }

  const suffixes = ["th", "st", "nd", "rd"];
  const v = day % 100;

  return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
}
