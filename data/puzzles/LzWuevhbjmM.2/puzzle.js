// Title: Diagonally Consecutive Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=LzWuevhbjmM
// Source: https://cracking-the-cryptic.web.app/sudoku/7F7q3fH3nR

// Rules encoded here:
//   - Normal Sudoku: digits 1-9 once each per row, column and 3x3 box, over
//     the default nine boxes.
//   - The twelve printed givens.
//   - Two cells joined by a grey diagonal mark hold consecutive digits.
//
// Omitted: whether the marks are exhaustive, i.e. whether an unmarked
// diagonally-adjacent pair is thereby forbidden from holding consecutive
// digits. The source states no rules at all, so nothing grounds that negative
// over the 109 unmarked diagonal pairs, and only the drawn positive relation
// is encoded.

// The pairwise predicate the marks assert: the two digits differ by 1.
// The width 9 is the grid's own digit range, which is what these cells hold.
const consecutive = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);

// The nineteen drawn marks, each as the diagonally-adjacent cell pair it spans.
// Provenance: one pale grey (#CFCFCF) segment per entry, centred on a grid
// vertex with one endpoint lying inside each of the two cells named.
const markedDiagonals = [
  ['R1C1', 'R2C2'], ['R1C4', 'R2C5'], ['R1C8', 'R2C9'],
  ['R2C4', 'R3C5'], ['R2C8', 'R3C7'],
  ['R3C2', 'R4C3'],
  ['R4C2', 'R5C3'], ['R4C3', 'R5C2'], ['R4C6', 'R5C5'],
  ['R4C8', 'R5C9'], ['R4C9', 'R5C8'],
  ['R5C4', 'R6C5'], ['R5C8', 'R6C7'],
  ['R7C2', 'R8C1'], ['R7C3', 'R8C2'], ['R7C8', 'R8C7'],
  ['R8C4', 'R9C5'], ['R8C5', 'R9C4'], ['R8C9', 'R9C8'],
];

// One two-cell Pair per mark. WhiteDot is the named consecutive-domino class
// but binds orthogonally-adjacent cells only, which these diagonal pairs are
// not; and a single Pair over all the cells at once would relate cells that no
// mark joins, since Pair applies its relation along its whole cell list.
const diagonalConsecutive = markedDiagonals.map(
  (cells, i) => new Pair(consecutive, `mark${i + 1}`, ...cells));

return [
  new Shape('9x9'),

  new Given('R1C3', 5), new Given('R1C9', 7),
  new Given('R3C3', 6), new Given('R3C9', 9),
  new Given('R4C1', 3), new Given('R4C7', 5),
  new Given('R6C3', 2), new Given('R6C9', 8),
  new Given('R7C1', 7), new Given('R7C7', 9),
  new Given('R9C1', 6), new Given('R9C7', 1),

  ...diagonalConsecutive,
];
