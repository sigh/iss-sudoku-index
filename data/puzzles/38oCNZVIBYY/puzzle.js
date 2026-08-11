// Title: Duo Quads Sudoku
// Author: Marvin Kannhauser
// Video: https://www.youtube.com/watch?v=38oCNZVIBYY
// Source: https://app.crackingthecryptic.com/sudoku/4rPjgJNdF2
//
// Normal sudoku rules apply (AllDifferent rows/cols/boxes via Shape).
// Identical digits cannot be a knight's move apart (AntiKnight, global).
// Consecutive digits cannot be orthogonal neighbours (AntiConsecutive,
// global -- the class only ever binds orthogonally-adjacent cells).
// A number in a white circle must appear at least once in the four
// surrounding cells (Quad, non-strict "at least present" semantics). Two
// circles (rounded, black border, white fill -- the drawn clue-circle
// style), given as their 2x2 top-left cell and value:
//   corner R3C6/R3C7/R4C6/R4C7 -> 3
//   corner R6C3/R6C4/R7C3/R7C4 -> 2
// A number outside the grid appears in the first four cells of that
// row/column from that direction (ContainAtLeast, same "at least once"
// semantics as Quad but over an arbitrary cell list rather than a fixed
// 2x2, since these clues sit on a 1x4 line). Nine outside clues:
//   left R5 -> 2, left R7 -> 2
//   top C3 -> 6, top C4 -> 2, top C6 -> 1
//   right R3 -> 2, right R6 -> 1, right R8 -> 3, right R9 -> 6

const WHITE_CIRCLES = [
  { topLeft: 'R3C6', value: 3 },
  { topLeft: 'R6C3', value: 2 },
];

const OUTSIDE_CLUES = [
  { cells: ['R5C1', 'R5C2', 'R5C3', 'R5C4'], value: 2 },
  { cells: ['R7C1', 'R7C2', 'R7C3', 'R7C4'], value: 2 },
  { cells: ['R1C3', 'R2C3', 'R3C3', 'R4C3'], value: 6 },
  { cells: ['R1C4', 'R2C4', 'R3C4', 'R4C4'], value: 2 },
  { cells: ['R1C6', 'R2C6', 'R3C6', 'R4C6'], value: 1 },
  { cells: ['R3C9', 'R3C8', 'R3C7', 'R3C6'], value: 2 },
  { cells: ['R6C9', 'R6C8', 'R6C7', 'R6C6'], value: 1 },
  { cells: ['R8C9', 'R8C8', 'R8C7', 'R8C6'], value: 3 },
  { cells: ['R9C9', 'R9C8', 'R9C7', 'R9C6'], value: 6 },
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  new AntiConsecutive(),
  ...WHITE_CIRCLES.map(c => new Quad(c.topLeft, c.value)),
  ...OUTSIDE_CLUES.map(c => new ContainAtLeast(String(c.value), ...c.cells)),
];
