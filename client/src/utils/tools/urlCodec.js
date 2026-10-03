export const urlActions = [
  { id: 'encode-component', label: 'Encode component' },
  { id: 'decode-component', label: 'Decode component' },
  { id: 'encode-url', label: 'Encode full URL' },
  { id: 'decode-url', label: 'Decode full URL' },
];

export function convertUrl(value, action) {
  switch (action) {
    case 'encode-component': return encodeURIComponent(value);
    case 'decode-component': return decodeURIComponent(value);
    case 'encode-url': return encodeURI(value);
    case 'decode-url': return decodeURI(value);
    default: return value;
  }
}
