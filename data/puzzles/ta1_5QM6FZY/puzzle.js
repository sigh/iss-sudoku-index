// Title: Plaid Lunchbox
// Author: Rdndnt
// Video: https://www.youtube.com/watch?v=ta1_5QM6FZY
// Source: https://app.crackingthecryptic.com/sudoku/9bTTGgnF3D

// Normal sudoku (default 9x9 rows/cols/3x3 boxes). Thirteen killer cages:
// digits cannot repeat within a cage and sum to the corner total (Cage --
// the rule states the no-repeat clause outright). Ten outside clues give
// the sum of the digits strictly between the 1 and the 9 of that row/column
// (ISS's native Sandwich, whose DESCRIPTION matches the rule text verbatim;
// ZERO_VALUE_OK covers the "0" clue on row 7, where 1 and 9 are adjacent).
// The title's "Lunchbox" is a pun -- the rules text spells out the classic
// 1-and-9 sandwich definition, not the min/max region Lunchbox class.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Cage cells and totals, transcribed from the payload's `cages` array
// (cells + value entries only; the three stub entries carry title/author/
// rules metadata, not cage geometry).
const cages = [
  [16, 'R1C2', 'R1C1', 'R2C1'],
  [23, 'R4C1', 'R5C1', 'R6C1'],
  [9, 'R8C1', 'R9C1', 'R9C2'],
  [10, 'R1C4', 'R1C5', 'R1C6'],
  [15, 'R1C8', 'R1C9', 'R2C9'],
  [13, 'R4C9', 'R5C9', 'R6C9'],
  [18, 'R8C9', 'R9C9', 'R9C8'],
  [11, 'R9C4', 'R9C5', 'R9C6'],
  [15, 'R6C3', 'R7C3', 'R7C4'],
  [14, 'R7C6', 'R7C7', 'R6C7'],
  [19, 'R4C7', 'R3C7', 'R3C6'],
  [11, 'R3C4', 'R3C3', 'R4C3'],
  [24, 'R5C4', 'R4C5', 'R5C6', 'R6C5', 'R5C5'],
];

// Outside (sandwich) clues, positioned by overlay `center` [row, col]
// (0-indexed, half-integer offsets place the badge just off the frame) and
// matched to the nearest row/column.
const sandwiches = [
  Sandwich.fromCells(12, graph.column(1), geometry),
  Sandwich.fromCells(14, graph.column(3), geometry),
  Sandwich.fromCells(26, graph.column(6), geometry),
  Sandwich.fromCells(9, graph.column(7), geometry),
  Sandwich.fromCells(5, graph.column(9), geometry),
  Sandwich.fromCells(23, graph.row(1), geometry),
  Sandwich.fromCells(21, graph.row(3), geometry),
  Sandwich.fromCells(6, graph.row(5), geometry),
  Sandwich.fromCells(0, graph.row(7), geometry),
  Sandwich.fromCells(35, graph.row(9), geometry),
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...sandwiches,
];
