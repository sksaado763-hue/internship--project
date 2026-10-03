export function countWords(text) {
  return text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

export function countCharacters(text) {
  return Array.from(text).length;
}

export function countCharactersWithoutSpaces(text) {
  return countCharacters(text.replace(/\s/gu, ''));
}

export function countSentences(text) {
  return text.match(/[^.!?…]+(?:[.!?…]+|$)/gu)?.filter((part) => part.trim()).length ?? 0;
}

export function countParagraphs(text) {
  return text.trim() ? text.trim().split(/\n\s*\n/u).filter(Boolean).length : 0;
}

export function countLines(text) {
  return text ? text.split(/\r\n|\r|\n/u).length : 0;
}
