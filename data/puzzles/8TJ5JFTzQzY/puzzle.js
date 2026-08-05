// Title: KXVLK
// Author: rdndnt
// Video: https://www.youtube.com/watch?v=8TJ5JFTzQzY
// Source: https://app.crackingthecryptic.com/sudoku/Dt9HR8QPb2

// Normal Sudoku rules apply. Marked Xs sum to 10 and marked Vs sum to 5;
// absent XV marks carry no constraint. The four drawn no-total cages are
// all-different. Outside clues sum their indicated diagonals, with repeats allowed.
const xEdges = [
  ['R1C2', 'R2C2'], ['R3C2', 'R3C3'], ['R3C3', 'R4C3'],
  ['R3C6', 'R3C7'], ['R2C7', 'R3C7'], ['R2C8', 'R2C9'],
  ['R8C8', 'R9C8'], ['R7C7', 'R7C8'], ['R6C7', 'R7C7'],
  ['R7C3', 'R7C4'], ['R7C3', 'R8C3'], ['R8C1', 'R8C2'],
];
const vEdges = [
  ['R9C4', 'R9C5'], ['R6C6', 'R7C6'], ['R5C9', 'R6C9'],
  ['R4C6', 'R4C7'], ['R1C5', 'R1C6'], ['R3C4', 'R4C4'],
  ['R4C1', 'R5C1'], ['R6C3', 'R6C4'],
];

// Cage cells transcribed from the four drawn outlines.
const cages = [
  ['R3C3', 'R3C4', 'R4C4', 'R4C3'],
  ['R3C6', 'R3C7', 'R4C7', 'R4C6'],
  ['R6C7', 'R6C6', 'R7C6', 'R7C7'],
  ['R6C3', 'R6C4', 'R7C4', 'R7C3'],
];
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

return [
  new Shape('9x9'),
  ...xEdges.map(([a, b]) => new X(a, b)),
  ...vEdges.map(([a, b]) => new V(a, b)),
  ...cages.map(cells => new AllDifferent(...cells)),
  // The labelled outside diagonals are read from the arrowhead directions.
  LittleKiller.fromCells(24, graph.ray('R4C1', 1, 1), geometry),
  LittleKiller.fromCells(27, graph.ray('R6C9', 1, -1), geometry),
];
