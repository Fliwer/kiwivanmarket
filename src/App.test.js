import { safeDate } from './utils/dateHelper';

test('safeDate parses supported date formats', () => {
  const parsed = safeDate('2024-05-12 12:30:00');
  expect(parsed).toBeInstanceOf(Date);
  expect(parsed?.toISOString()).toContain('2024-05-12');
  expect(Number.isNaN(parsed?.getTime())).toBe(false);
});
