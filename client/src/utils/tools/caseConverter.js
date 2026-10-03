const minorTitleWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'the', 'to', 'up', 'via', 'with']);

export const caseActions = [
  { id: 'uppercase', label: 'UPPERCASE' },
  { id: 'lowercase', label: 'lowercase' },
  { id: 'title', label: 'Title Case' },
  { id: 'sentence', label: 'Sentence case' },
  { id: 'capitalize', label: 'Capitalize Words' },
  { id: 'alternating', label: 'aLtErNaTiNg CaSe' },
];

function capitalizeWord(word) {
  return word ? word[0].toLocaleUpperCase() + word.slice(1).toLocaleLowerCase() : word;
}

export function convertCase(text, mode) {
  switch (mode) {
    case 'uppercase':
      return text.toLocaleUpperCase();
    case 'lowercase':
      return text.toLocaleLowerCase();
    case 'title': {
      const wordPattern = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
      const lowercaseText = text.toLocaleLowerCase();
      const words = Array.from(lowercaseText.matchAll(wordPattern));
      let wordIndex = 0;
      const wordCount = words.length;
      return lowercaseText.replace(wordPattern, (word) => {
        const current = wordIndex++;
        return current > 0 && current < wordCount - 1 && minorTitleWords.has(word)
          ? word
          : capitalizeWord(word);
      });
    }
    case 'sentence': {
      let shouldCapitalize = true;
      return Array.from(text.toLocaleLowerCase(), (character) => {
        if (shouldCapitalize && /\p{L}/u.test(character)) {
          shouldCapitalize = false;
          return character.toLocaleUpperCase();
        }
        if (/[.!?…]/u.test(character)) shouldCapitalize = true;
        return character;
      }).join('');
    }
    case 'capitalize':
      return text.replace(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu, capitalizeWord);
    case 'alternating': {
      let letterIndex = 0;
      return Array.from(text, (character) => {
        if (!/\p{L}/u.test(character)) return character;
        const result = letterIndex++ % 2 === 0 ? character.toLocaleLowerCase() : character.toLocaleUpperCase();
        return result;
      }).join('');
    }
    default:
      return text;
  }
}
