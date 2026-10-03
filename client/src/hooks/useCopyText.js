import { useState } from 'react';

export default function useCopyText() {
  const [copyMessage, setCopyMessage] = useState('');

  async function copyText(value, label = 'Text') {
    if (!value) {
      setCopyMessage('There is no text to copy yet.');
      return false;
    }
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage(`${label} copied to clipboard.`);
      return true;
    } catch {
      setCopyMessage('Clipboard access is unavailable. Select the text and copy it manually.');
      return false;
    }
  }

  return { copyMessage, copyText, clearCopyMessage: () => setCopyMessage('') };
}
