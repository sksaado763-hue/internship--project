export function formatJson(value, spacing = 2) {
  return JSON.stringify(JSON.parse(value), null, spacing);
}

export function minifyJson(value) {
  return JSON.stringify(JSON.parse(value));
}

export function validateJson(value) {
  if (!value.trim()) return { valid: false, message: 'Enter JSON to validate.' };
  try {
    JSON.parse(value);
    return { valid: true, message: 'Valid JSON. Ready to format or minify.' };
  } catch (error) {
    return { valid: false, message: error instanceof SyntaxError ? `Invalid JSON: ${error.message}` : 'Unable to parse this JSON.' };
  }
}
