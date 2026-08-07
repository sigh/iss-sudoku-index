// Title: August 23, 2022: Word Search Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=PJcHdl4BYbQ
// Source: https://tinyurl.com/2qmoyotg

// Rules encoded here:
//  - Fill the grid with the letters BESOLVING, one of each per row, column and
//    3x3 box (standard 9x9 boxes; the grid has no given letters).
//  - Each heavy grey line must contain one of the words in the word bank drawn
//    to the right of the grid. All six words must be used, and a word's letters
//    appear in order along its line, starting from either end.
// Nothing is omitted.
//
// ISS works over digits, so the letter bank is read as the value order
// BESOLVING = 123456789; the grid below is a digit grid under that mapping.

// Letter bank, in the order printed under the grid ("LETTER BANK: BESOLVING").
const LETTER_BANK = 'BESOLVING';
const toDigits = (word) =>
  Array.from(word, (letter) => LETTER_BANK.indexOf(letter) + 1).join('');

// Word bank as drawn to the right of the grid, top to bottom.
const WORDS = ['NONSENSE', 'BOBBINS', 'SOLVING', 'BEGIN', 'GIVEN', 'VIBES'];

// The six heavy grey lines, each listed end to end in its drawn order.
const LINES = [
  ['R9C8', 'R9C7', 'R8C6', 'R8C5', 'R7C4', 'R7C3', 'R6C2', 'R6C1'],
  ['R5C8', 'R5C7', 'R6C6', 'R6C5', 'R6C4'],
  ['R4C7', 'R4C6', 'R5C5', 'R5C4', 'R5C3', 'R5C2', 'R4C1'],
  ['R4C4', 'R3C5', 'R2C6', 'R3C7', 'R4C8', 'R4C9', 'R3C9'],
  ['R2C5', 'R2C4', 'R2C3', 'R2C2', 'R3C1'],
  ['R8C1', 'R9C1', 'R9C2', 'R8C3', 'R9C3'],
];

// "a word can start at either end of its line": the line reads as the word or
// as its reversal.
const wordOnLine = (word, cells) => new Regex(
  [toDigits(word), toDigits(Array.from(word).reverse().join(''))].join('|'),
  ...cells);

const permutations = (items) => items.length <= 1 ? [items] :
  items.flatMap((item, i) => permutations(
    [...items.slice(0, i), ...items.slice(i + 1)]).map((rest) => [item, ...rest]));

// The rules pair words with lines only through "all words must be used", so the
// pairing is part of the solve: take the disjunction over every pairing the
// drawn lengths admit. Six words for six lines is a bijection; no word can be
// longer than its line; and the line lengths (8,7,7,5,5,5) are exactly the word
// lengths (8,7,7,5,5,5), so each word fills a line of its own length and the
// surviving pairings are the 1 x 2 x 6 = 12 below.
const assignments = permutations(WORDS).filter(
  (words) => words.every((word, i) => word.length === LINES[i].length));

return [
  new Shape('9x9'),
  new Or(assignments.map((words) => new And(
    words.map((word, i) => wordOnLine(word, LINES[i]))))),
];
