// Title: Summetros
// Author: Lisztes
// Video: https://www.youtube.com/watch?v=-S-x5sdLfJ4
// Source: https://app.crackingthecryptic.com/sudoku/MDRqntJQg4

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). Two outside diagonal clues give the sum of the digits along
// the marked diagonal; digits there may repeat. Fourteen cages forbid
// repeats within themselves; eight also sum to a printed total.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Outside diagonal-sum clues: each badge sits on the R5/R6 boundary, so the
// lane is ambiguous between the up- and down-diagonal until the drawn
// arrow's own heading is read. Both drawn arrows point toward the bottom
// corners, so both diagonals run downward from R6C1/R6C9.
const littleKillers = [
  LittleKiller.fromCells(16, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(24, graph.ray('R6C9', 1, -1), geometry),
];

// Cages with a printed total (top-left cell), transcribed from the drawn cages.
const totaledCages = [
  new Cage(13, 'R4C9', 'R5C9'),
  new Cage(10, 'R4C1', 'R5C1'),
  new Cage(19, 'R1C5', 'R2C5', 'R3C5'),
  new Cage(10, 'R2C7', 'R3C7'),
  new Cage(13, 'R8C9', 'R9C9'),
  new Cage(10, 'R8C1', 'R9C1'),
  new Cage(11, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(13, 'R2C3', 'R3C3'),
];

// Cages drawn with no printed total: still real cages, all-different only.
const noTotalCages = [
  ['R7C1', 'R6C1', 'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C2', 'R2C1', 'R4C3'],
  ['R1C2', 'R1C3', 'R1C4', 'R2C4', 'R3C4', 'R4C4', 'R5C4'],
  ['R1C8', 'R1C7', 'R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6'],
  ['R2C9', 'R2C8', 'R3C8', 'R4C8', 'R4C7', 'R5C8', 'R6C8', 'R6C9', 'R7C9'],
  ['R8C2', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R8C8'],
  ['R4C5', 'R5C5', 'R6C5', 'R6C4', 'R6C3', 'R5C3', 'R6C6', 'R6C7', 'R5C7'],
].map(cells => new AllDifferent(...cells));

return [
  new Shape('9x9'),

  ...littleKillers,
  ...totaledCages,
  ...noTotalCages,
];
