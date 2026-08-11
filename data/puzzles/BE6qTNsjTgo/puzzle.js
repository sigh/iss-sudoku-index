// Title: Hybrid
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=BE6qTNsjTgo
// Source: https://app.crackingthecryptic.com/sudoku/fm92h9Dn93

// Normal sudoku rules apply, standard 3x3 boxes, two givens. Cages sum to
// the small clue in the cage's top-left cell; every cage here is a 2-cell
// domino confined to a single row or column, so sudoku's own row/column
// all-different already forbids the repeat within the cage (Cage, not Sum).
// Off-grid diagonal badges sum the digits along the indicated diagonal, and
// the rules explicitly allow repeats there (LittleKiller's own semantics,
// no Cage uniqueness). Purple lines hold a non-repeating set of consecutive
// digits in any order (Renban).

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

const givens = [
  ['R8C3', 9],
  ['R8C7', 2],
];

// Cages: [total, ...cells], transcribed from the payload's cages array.
const cages = [
  [5, 'R1C3', 'R1C4'],
  [10, 'R1C5', 'R2C5'],
  [15, 'R1C6', 'R1C7'],
  [5, 'R4C7', 'R4C8'],
  [15, 'R5C7', 'R6C7'],
  [10, 'R4C3', 'R5C3'],
  [10, 'R6C2', 'R6C3'],
  [10, 'R9C3', 'R9C4'],
  [5, 'R8C5', 'R9C5'],
  [10, 'R9C6', 'R9C7'],
];

// Off-grid diagonal-sum clues: [total, entry cell, dRow, dCol], entry cell
// and direction read from each arrow's drawn waypoints (badge position plus
// travel direction into the grid); graph.ray walks the full diagonal to the
// opposite edge.
const littleKillers = [
  [14, 'R3C1', -1, 1],
  [20, 'R6C1', 1, 1],
  [13, 'R7C1', 1, 1],
  [11, 'R3C9', -1, -1],
  [22, 'R4C9', -1, -1],
  [15, 'R7C9', 1, -1],
];

// Purple (non-repeating consecutive set, any order) lines, transcribed from
// the drawn wayPoints.
const renbanLines = [
  ['R3C1', 'R2C1', 'R2C2', 'R3C2'],
  ['R3C8', 'R2C8', 'R2C9', 'R3C9'],
  ['R7C1', 'R8C1', 'R8C2', 'R7C2'],
  ['R7C8', 'R8C8', 'R8C9', 'R7C9'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...littleKillers.map(([total, cell, dRow, dCol]) =>
    LittleKiller.fromCells(total, graph.ray(cell, dRow, dCol), geometry)),
  ...renbanLines.map(cells => new Renban(...cells)),
];
