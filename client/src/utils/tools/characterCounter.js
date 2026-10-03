import { countCharacters, countCharactersWithoutSpaces, countLines, countWords } from './textMetrics.js';

export function getCharacterCounterStats(text) {
  return {
    characters: countCharacters(text),
    charactersWithoutSpaces: countCharactersWithoutSpaces(text),
    words: countWords(text),
    lines: countLines(text),
    spaces: countCharacters(text) - countCharactersWithoutSpaces(text),
  };
}
