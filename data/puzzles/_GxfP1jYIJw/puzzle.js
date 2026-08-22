// Title: King Gambit
// Author: DiMono
// Video: https://www.youtube.com/watch?v=_GxfP1jYIJw
// Source: https://app.crackingthecryptic.com/sudoku/PTD4mDNqnJ

// Standard 9x9 sudoku with default box regions (no region override needed).
// King's move rule: AntiKing() forbids equal digits a king's-move apart,
// covering diagonal neighbours (the orthogonal one-step case is already
// covered by row/column all-different).
// Circle rule: each circled cell's own digit equals the sum of the digits
// diagonally adjacent to it. Encoded per circle as an EqualSum between the
// single-cell segment [circle] and the segment of its diagonal neighbours,
// which are derived from grid geometry via cellGraph().step, clipped at
// edges/corners as the rule requires ("all diagonally adjacent digits").

const CIRCLE_CELLS = [
  // Drawn circle (white, grey-bordered) underlay centers from the source
  // payload, converted from 0-indexed (row+0.5, col+0.5) to 1-indexed R#C#.
  'R1C3', 'R3C3',
  'R1C7', 'R1C8',
  'R4C8', 'R4C9',
  'R6C8', 'R6C6',
  'R8C9', 'R9C4',
];

const graph = cellGraph('9x9');

const diagonalNeighbors = (cellId) => [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  .map(([dr, dc]) => graph.step(cellId, dr, dc))
  .filter(c => c != null);

const circleSumConstraints = CIRCLE_CELLS.map(
  (cell) => new EqualSum([cell], diagonalNeighbors(cell)));

return [
  new Shape('9x9'),
  new Given('R2C8', 1),
  new AntiKing(),
  ...circleSumConstraints,
];
