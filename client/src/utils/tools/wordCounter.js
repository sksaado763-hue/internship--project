import {
  countCharacters,
  countCharactersWithoutSpaces,
  countParagraphs,
  countSentences,
  countWords,
} from './textMetrics.js';

export function getWordCounterStats(text) {
  const words = countWords(text);
  return {
    words,
    characters: countCharacters(text),
    charactersWithoutSpaces: countCharactersWithoutSpaces(text),
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    readingTime: words ? Math.max(1, Math.ceil(words / 200)) : 0,
  };
}
