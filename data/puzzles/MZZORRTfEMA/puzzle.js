// Title: X-Men Sudoku
// Author: Arun Iyer
// Video: https://www.youtube.com/watch?v=MZZORRTfEMA
// Source: https://app.crackingthecryptic.com/sudoku/dmbQ84rL2r
//
// Normal sudoku rules apply (standard rows/columns/boxes, no givens).
// Clues outside the grid give the sum of the digits along the indicated
// diagonal; digits along the diagonal may repeat -> LittleKiller per clue,
// built from the drawn diagonal's own cells so the canonical corner is
// derived rather than guessed.
// Cages: digits sum to the clue in the cage's top-left corner, no repeats
// within a cage -> Cage per cage.
// Grey lines: the digits read the same forwards and backwards -> Palindrome
// per line.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Cage cell lists, transcribed from the puzzle's drawn cage geometry.
const cages = [
  [9, 'R1C2', 'R1C1', 'R2C1'],
  [34, 'R2C3', 'R2C2', 'R3C2', 'R3C3', 'R3C4', 'R4C4', 'R4C3'],
  [25, 'R4C5', 'R5C5', 'R6C5', 'R5C4', 'R5C6'],
  [33, 'R6C6', 'R7C6', 'R7C7', 'R6C7', 'R8C7', 'R8C8', 'R7C8'],
  [10, 'R8C9', 'R9C9', 'R9C8'],
  [36, 'R3C6', 'R4C6', 'R4C7', 'R3C7', 'R2C7', 'R2C8', 'R3C8'],
  [21, 'R1C8', 'R1C9', 'R2C9'],
  [37, 'R6C3', 'R6C4', 'R7C4', 'R7C3', 'R7C2', 'R8C2', 'R8C3'],
  [20, 'R8C1', 'R9C1', 'R9C2'],
];

// Grey palindrome lines, transcribed from the puzzle's drawn line geometry
// (a 5th line entry has no coordinates and renders nothing, so it is
// omitted).
const palindromeLines = [
  ['R1C2', 'R1C3', 'R2C4', 'R3C4'],
  ['R4C7', 'R4C8', 'R3C9', 'R2C9'],
  ['R7C6', 'R8C6', 'R9C7', 'R9C8'],
  ['R8C1', 'R7C1', 'R6C2', 'R6C3'],
];

return [
  new Shape('9x9'),

  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),

  ...palindromeLines.map(cells => new Palindrome(...cells)),

  // Outside diagonal-sum clues. Each fromCells() call is built from the
  // drawn arrow's own cell path, which also settles the one clue (bottom
  // "29") whose outside position was equidistant between two candidate
  // diagonals -- the drawn arrow direction picks R9C5-...-R5C9 over the
  // alternate R9C3-R8C2-R7C1 reading.
  LittleKiller.fromCells(65, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(25, graph.ray('R1C9', 1, -1), geometry),
  LittleKiller.fromCells(29, graph.ray('R9C5', -1, 1), geometry),
];
