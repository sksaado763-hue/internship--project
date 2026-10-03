export const base64Actions = [
  { id: 'encode', label: 'Encode to Base64' },
  { id: 'decode', label: 'Decode from Base64' },
];

export function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

export function decodeBase64(value) {
  const normalized = value.replace(/\s+/gu, '').replace(/-/gu, '+').replace(/_/gu, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error('This Base64 value does not contain valid UTF-8 text.');
  }
}
