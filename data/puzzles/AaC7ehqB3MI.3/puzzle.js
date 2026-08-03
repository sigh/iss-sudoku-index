// Title: Give It To Me
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=AaC7ehqB3MI
// Source: https://tinyurl.com/yc3h468v

// Normal sudoku rules apply (default row/column/box all-different, no givens).
// Grey lines are palindromes: each must read the same from either end, which
// is exactly Palindrome's semantics regardless of the direction cells are
// listed in.
// Digits printed at a cell intersection must appear somewhere in the
// surrounding 2x2 square: Quad(topLeftCell, ...values) expresses that
// directly; the top-left cell of each square is read off the drawn 2x2 in
// the source payload.

const palindromes = [
  ['R5C2', 'R6C2', 'R7C3', 'R7C4', 'R7C5'],
  ['R8C5', 'R8C6', 'R7C7', 'R6C7', 'R5C7'],
  ['R5C8', 'R4C8', 'R3C7', 'R3C6', 'R3C5'],
  ['R2C5', 'R2C4', 'R3C3', 'R4C3', 'R5C3'],
  ['R4C9', 'R3C8', 'R2C7'],
  ['R6C1', 'R7C2', 'R8C3'],
  ['R9C6', 'R8C7', 'R7C8'],
  ['R3C2', 'R2C3', 'R1C4'],
].map((cells) => new Palindrome(...cells));

// [topLeftCell, ...requiredDigits], one per drawn quadruple.
const quads = [
  ['R1C5', 5, 6],
  ['R2C5', 1, 2, 3, 4],
  ['R4C7', 2, 4, 6, 8],
  ['R4C8', 1, 5],
  ['R5C1', 2, 6],
  ['R5C2', 1, 3, 5, 7],
  ['R7C4', 5, 6, 7, 8],
  ['R8C1', 3, 4, 6],
  ['R8C4', 1, 2],
  ['R1C8', 1, 4, 8],
].map(([topLeft, ...values]) => new Quad(topLeft, ...values));

return [
  new Shape('9x9'),
  ...palindromes,
  ...quads,
];
