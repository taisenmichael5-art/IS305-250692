function text(value, label, max = 2000) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new Error(`${label} must be non-empty text (maximum ${max} characters).`);
  return value.trim();
}
function choice(value, options, label) {
  if (!options.includes(value)) throw new Error(`${label} must be one of: ${options.join(', ')}.`);
  return value;
}
function email(value) {
  const result = text(value, 'Email', 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new Error('Enter a valid email address.');
  return result;
}
function id(value, label = 'ID') {
  const result = text(value, label, 60);
  if (!/^[A-Za-z0-9_-]+$/.test(result)) throw new Error(`${label} must contain only letters, numbers, underscores or hyphens.`);
  return result;
}
function iso(value, label) {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) throw new Error(`${label} must be an ISO timestamp.`);
  return value;
}
function fields(obj, allowed) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Changes must be an object.');
  if (!Object.keys(obj).length) throw new Error('Provide at least one changed field.');
  for (const key of Object.keys(obj)) if (!allowed.includes(key)) throw new Error(`Field cannot be changed: ${key}.`);
}
module.exports = { text, choice, email, id, iso, fields };
