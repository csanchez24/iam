/** Capitalizes word(s) including composed words separated by spaces e.g 'primer nombre' */
export function capitalize(word: string) {
  return word
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}
