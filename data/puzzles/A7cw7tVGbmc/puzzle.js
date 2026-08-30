// Title: Isolation Sudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=A7cw7tVGbmc
// Source: https://cracking-the-cryptic.web.app/sudoku/mdRHm2ffH8

// Rules encoded here:
//  - Standard 9x9 sudoku (rows, columns and the nine ordinary 3x3 boxes hold
//    1-9 once each). There are no given digits.
//  - 32 dashed cages partition all 81 cells. Digits do not repeat within a
//    cage; where a cage carries a printed total, its digits add to that total.
//    16 cages carry a total, 16 do not; an untotalled cage keeps the no-repeat
//    clause only. This is the standard killer reading of the drawn board.
//
// Rule omitted: the "Isolation" rule the puzzle's own name announces. No
// statement of it is published with the puzzle, and the board draws no clue of
// any kind beyond the cage borders and the 16 totals, so there is nothing to
// read the rule off. It is left out rather than invented; with it missing, the
// encoding below admits many completions.

// The 32 cages drawn on the board: printed total first ('' where the cage is
// drawn without one), then the cage's cells.
const CAGES = [
  ['', 'R1C1', 'R2C1', 'R3C1', 'R2C2'],
  [15, 'R1C2', 'R1C3'],
  [15, 'R2C3', 'R3C3', 'R3C2'],
  [12, 'R1C4', 'R1C5', 'R1C6'],
  ['', 'R3C4', 'R2C4', 'R2C5'],
  [9, 'R3C5', 'R4C5'],
  ['', 'R2C6'],
  [10, 'R3C6', 'R4C6'],
  ['', 'R1C7', 'R1C8', 'R1C9'],
  [27, 'R2C7', 'R3C7', 'R2C8', 'R2C9'],
  ['', 'R3C8', 'R3C9', 'R4C9'],
  [16, 'R4C8', 'R5C8', 'R6C8'],
  ['', 'R5C9', 'R6C9'],
  ['', 'R4C7'],
  ['', 'R5C7', 'R6C7'],
  [16, 'R9C8', 'R9C9', 'R7C9', 'R8C9'],
  ['', 'R7C8', 'R8C8'],
  ['', 'R7C7', 'R8C7'],
  [9, 'R9C7', 'R9C6'],
  [10, 'R7C6', 'R8C6'],
  [15, 'R7C4', 'R8C4', 'R7C5'],
  ['', 'R8C5', 'R9C5', 'R9C4'],
  [15, 'R7C1', 'R7C2', 'R8C2'],
  ['', 'R7C3', 'R8C3'],
  [15, 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
  [16, 'R4C1', 'R5C1'],
  [8, 'R6C1', 'R6C2', 'R6C3'],
  ['', 'R5C2', 'R4C2', 'R4C3'],
  ['', 'R5C3', 'R5C4'],
  ['', 'R4C4'],
  ['', 'R5C5', 'R6C5', 'R6C4'],
  [10, 'R5C6', 'R6C6'],
];

// Cage() is sum-and-unique; AllDifferent() is the untotalled cage's unique-only
// half. A single-cell untotalled cage constrains nothing on its own, which is
// what the drawn board says about it.
const cages = CAGES.map(
  ([total, ...cells]) => total === ''
    ? new AllDifferent(...cells)
    : new Cage(total, ...cells));

return [
  new Shape('9x9'),
  ...cages,
];
