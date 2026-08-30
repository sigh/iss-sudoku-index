// Title: Diagonally Consecutive Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=LzWuevhbjmM
// Source: https://cracking-the-cryptic.web.app/sudoku/7F7q3fH3nR

// Rules encoded:
// - Normal sudoku rules (rows, columns, 3x3 boxes -- the default grid).
// - Each pair of cells joined by a drawn grey diagonal tick mark holds
//   consecutive digits. The payload carries no rules text at all; the marks'
//   own geometry (each spans exactly the shared corner of two
//   diagonally-adjacent cells) is what grounds the rule, corroborated by
//   this video's own description naming the puzzle "Diagonally Consecutive".
// - No "all such pairs are marked" sentence exists to license a negative
//   constraint on unmarked diagonally-adjacent pairs, so that reading is
//   omitted.

const consecutive = Pair.fnToKey((a, b) => a === b + 1 || a === b - 1, 9);

// Diagonal-consecutive pairs -- provenance: the 19 short grey line segments
// drawn on the board (colour #CFCFCF, thickness 5), each centred on one grid
// vertex and spanning the two diagonally-adjacent cells that touch it.
const diagonalPairs = [
  ['R2C9', 'R1C8'], ['R2C8', 'R3C7'], ['R2C5', 'R1C4'], ['R3C5', 'R2C4'],
  ['R2C2', 'R1C1'], ['R3C2', 'R4C3'], ['R4C3', 'R5C2'], ['R4C2', 'R5C3'],
  ['R7C3', 'R8C2'], ['R7C2', 'R8C1'], ['R9C5', 'R8C4'], ['R8C5', 'R9C4'],
  ['R6C5', 'R5C4'], ['R4C6', 'R5C5'], ['R4C9', 'R5C8'], ['R4C8', 'R5C9'],
  ['R5C8', 'R6C7'], ['R7C8', 'R8C7'], ['R8C9', 'R9C8'],
];
const diagonalConsecutive = diagonalPairs.map(
  ([a, b], i) => new Pair(consecutive, `diagonal-consecutive-${i}`, a, b));

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
