// Title: December 25
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=oqjwqM7csr4
// Source: https://app.crackingthecryptic.com/sudoku/M4Qfffphnf
//
// Normal sudoku rules apply (default row/column/box AllDifferent, no givens).
// Green lines: adjacent cells differ by >= 5 -> Whisper(5, ...).
// Cages: distinct digits summing to the shown total -> Cage(total, ...).
// Diagonals: digits along the diagonal sum to the shown total, repeats
// permitted -> LittleKiller, generated from the ray of cells so the corner
// cell is derived rather than hand-picked.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Cages, transcribed from the drawn cage outlines.
const cages = [
  ['R1C2', 'R2C2', 'R3C2', 'R4C2'],
  ['R1C5', 'R2C5', 'R3C5', 'R4C5'],
  ['R5C7', 'R6C7', 'R7C7', 'R8C7', 'R9C7'],
];

// Green whisper lines, transcribed from the drawn strokes (10 separate
// strokes; two of them cross at R2C5 but remain separate clues).
const whisperLines = [
  ['R2C2', 'R2C3'],
  ['R2C7', 'R2C8'],
  ['R1C4', 'R2C5', 'R3C6'],
  ['R1C6', 'R2C5', 'R3C4'],
  ['R6C1', 'R5C1', 'R4C1', 'R5C2', 'R4C3', 'R5C3', 'R6C3'],
  ['R7C4', 'R6C4', 'R5C4', 'R4C5', 'R5C6', 'R6C6', 'R7C6'],
  ['R3C9', 'R3C8', 'R4C7', 'R5C8', 'R6C9', 'R7C8', 'R7C7'],
  ['R8C9', 'R9C8', 'R8C8'],
  ['R8C4', 'R8C5', 'R8C6'],
  ['R8C1', 'R9C2', 'R8C2'],
];

return [
  new Shape('9x9'),

  ...cages.map(cells => new Cage(25, ...cells)),

  ...whisperLines.map(cells => new Whisper(5, ...cells)),

  // Each diagonal is generated as a ray from its edge-entry cell so the
  // LittleKiller corner is derived, not hand-picked: down-right from the
  // left edge, and down-left / up-left from the same right-edge cell.
  LittleKiller.fromCells(25, graph.ray('R5C1', 1, 1), geometry),
  LittleKiller.fromCells(25, graph.ray('R5C9', 1, -1), geometry),
  LittleKiller.fromCells(25, graph.ray('R5C9', -1, -1), geometry),
];
