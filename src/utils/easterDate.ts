// Easter date calculation (Anonymous Gregorian algorithm)
export function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// Check if Dupla de Páscoa highlight should be active (30 days before Easter until 1 day after)
export function isDuplaDePascoaActive(): boolean {
  const now = new Date();
  const year = now.getFullYear();
  const easter = getEasterDate(year);
  const start = new Date(easter);
  start.setDate(start.getDate() - 30);
  const end = new Date(easter);
  end.setDate(end.getDate() + 1);
  return now >= start && now <= end;
}
