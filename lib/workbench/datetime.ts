export function parseWorkbenchTimestamp(value: string): Date {
  if (/[zZ]|[+-]\d\d:\d\d$/.test(value)) return new Date(value);
  return new Date(`${value.replace(" ", "T")}Z`);
}

export function formatWorkbenchDateTime(value: string): string {
  return parseWorkbenchTimestamp(value).toLocaleString();
}

export function formatWorkbenchDate(value: string): string {
  return parseWorkbenchTimestamp(value).toLocaleDateString();
}
