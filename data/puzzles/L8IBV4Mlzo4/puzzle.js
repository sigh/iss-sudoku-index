// Title: Triple Double
// Author: Jaxar
// Video: https://www.youtube.com/watch?v=L8IBV4Mlzo4
// Source: https://sudokupad.app/r5wcz6yjxu
//
// Normal sudoku (default row/column/box regions), no givens.
// Kropki Pairs (white dot): the two cells differ by 1 -> WhiteDot.
// Triple Double Dots (green dot): one of the two cells' digits is exactly
// double or triple the other -> a custom Pair over the symmetric predicate
// a == 2b || a == 3b || b == 2a || b == 3a.
// Dynamic Fog is solving UI (progressive reveal) and imposes no rule on the
// finished grid, so it is not encoded.

const tripleDoubleKey = Pair.fnToKey(
  (a, b) => a === 2 * b || a === 3 * b || b === 2 * a || b === 3 * a,
  9);

// Green dot edges (cell pairs sharing the drawn dot), transcribed from the
// puzzle's drawn edge overlays. Two chains cross at R4C5 (column 5, rows
// 1-6, and row 4, columns 2-6); the rest are independent pairs.
const tripleDoubleEdges = [
  // Column-5 vertical chain (rows 1-6).
  ['R1C5', 'R2C5'], ['R2C5', 'R3C5'], ['R3C5', 'R4C5'],
  ['R4C5', 'R5C5'], ['R5C5', 'R6C5'],
  // Row-4 horizontal chain (columns 2-6), crossing the column-5 chain.
  ['R4C2', 'R4C3'], ['R4C3', 'R4C4'], ['R4C4', 'R4C5'], ['R4C5', 'R4C6'],
  // Remaining pairs.
  ['R1C8', 'R1C9'],
  ['R2C7', 'R3C7'],
  ['R3C7', 'R3C8'], ['R3C8', 'R3C9'], ['R3C9', 'R4C9'],
  ['R4C8', 'R4C9'],
  ['R5C7', 'R5C8'], ['R5C8', 'R5C9'], ['R5C8', 'R6C8'],
  ['R6C8', 'R7C8'],
  ['R7C2', 'R7C3'], ['R7C2', 'R8C2'], ['R7C3', 'R8C3'],
  ['R7C7', 'R7C8'], ['R7C8', 'R7C9'],
  ['R8C2', 'R8C3'], ['R8C3', 'R9C3'],
  ['R8C6', 'R8C7'],
  ['R8C9', 'R9C9'],
  ['R9C3', 'R9C4'], ['R9C4', 'R9C5'], ['R9C5', 'R9C6'], ['R9C6', 'R9C7'],
];

return [
  new Shape('9x9'),

  // Kropki white dots: differ by 1.
  new WhiteDot('R3C1', 'R4C1'),
  new WhiteDot('R6C1', 'R7C1'),

  // Triple Double green dots.
  ...tripleDoubleEdges.map(
    ([a, b]) => new Pair(tripleDoubleKey, 'TripleDouble', a, b)),
];
