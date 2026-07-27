export const capitalize = (text: string): string => {
  const words = text.split(' ');
  return words.map((word) => `${word[0].toUpperCase()}${word.substring(1, word.length)}`).join(' ');
};
