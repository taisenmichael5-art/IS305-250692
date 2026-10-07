// IS305 Lab 3 — Taisen Marainump, 250692.
// Store money as integer toea to avoid accumulating floating-point errors.
export function toCents(amount, label = 'Amount', allowZero = false) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    throw new TypeError(`${label} must be a finite number.`);
  }
  const cents = Math.round(amount * 100);
  if (amount < 0 || (!allowZero && cents <= 0) || amount > 1_000_000_000 ||
      Math.abs(amount * 100 - cents) > 0.00001) {
    throw new RangeError(`${label} must be ${allowZero ? 'non-negative' : 'positive'}, at most K1 billion, and have no more than two decimals.`);
  }
  return cents;
}
export function requiredText(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value.trim();
}
export const formatMoney = amount => `K${amount.toFixed(2)}`;
