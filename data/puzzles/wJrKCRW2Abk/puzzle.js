// Title: Trail Map
// Author: rdndnt
// Video: https://www.youtube.com/watch?v=wJrKCRW2Abk
// Source: https://app.crackingthecryptic.com/sudoku/QBD477g7G3

// Normal sudoku rules apply (standard 3x3 boxes, per the payload's `regions`).
// Cells a knight's move apart cannot repeat a digit.
// In cages, digits sum to the small clue in the top-left corner and cannot
// repeat within the cage.
// The grey line is a palindrome: it reads the same from both directions.
// No givens.

// Cages (top-left cell first, matching each cage's own cell order).
const cages = [
  { sum: 5, cells: ['R1C4', 'R2C4'] },
  { sum: 7, cells: ['R1C6', 'R2C6', 'R2C7'] },
  { sum: 21, cells: ['R2C9', 'R3C9', 'R3C8'] },
  { sum: 19, cells: ['R7C2', 'R6C2', 'R6C3'] },
  { sum: 14, cells: ['R8C5', 'R7C5', 'R7C6'] },
  { sum: 7, cells: ['R4C4', 'R4C5', 'R5C5'] },
];

// Grey palindrome line: the single drawn line, interpolated segment-by-segment
// (some segments are diagonal) to the covered cells. 27 distinct cells, no
// repeats -- an open path, not a loop.
const palindrome = [
  'R7C9', 'R8C9', 'R8C8', 'R7C8', 'R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C9',
  'R3C8', 'R4C7', 'R5C8', 'R6C7', 'R7C6', 'R8C5', 'R7C5', 'R7C4', 'R7C3',
  'R6C2', 'R5C2', 'R5C1', 'R4C1', 'R3C1', 'R4C2', 'R3C2', 'R3C3', 'R2C4',
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages.map(({ sum, cells }) => new Cage(sum, ...cells)),
  new Palindrome(...palindrome),
];
