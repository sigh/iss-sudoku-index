// Title: Peacock Butterfly
// Author: Miky
// Video: https://www.youtube.com/watch?v=PP_2LpXXXdM
// Source: https://app.crackingthecryptic.com/sudoku/92DBfq9dL9
//
// Standard 9x9 sudoku (default box regions, no givens) plus:
// - Arrow: digits along the arm sum to the digit in the bulb cell.
// - Grey square / grey circle cells restrict to even / odd digits.
// - An outside clue gives the sum of the main diagonal (repeats allowed).
// - White dots mark some (not all) consecutive-digit adjacent pairs.
//
// The lone off-grid arrow stub (wayPoints [-0.2,-0.2] -> [0,0], paired with
// the "42" corner overlay) is not a real Arrow: an Arrow's bulb digit would
// have to equal the sum of 8 arm cells, which is unsatisfiable for a single
// digit. It is the outside diagonal-sum badge instead, so it is encoded as
// LittleKiller over the main diagonal, not as an Arrow.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const arrows = [
  new Arrow('R1C7', 'R1C6', 'R2C5'),
  new Arrow('R4C9', 'R3C8', 'R2C8'),
  new Arrow('R7C9', 'R8C8', 'R9C9'),
  new Arrow('R9C4', 'R8C3'),
  new Arrow('R7C1', 'R6C1', 'R5C2'),
  new Arrow('R4C5', 'R3C4', 'R2C4', 'R1C4'),
  // Second arrow sharing the R4C5 bulb (two separate arms into one circle).
  new Arrow('R4C5', 'R5C6', 'R5C7', 'R5C8'),
  new Arrow('R5C4', 'R4C3', 'R4C2', 'R4C1'),
  // Second arrow sharing the R5C4 bulb.
  new Arrow('R5C4', 'R6C5', 'R7C5', 'R8C5'),
];

const whiteDots = [
  ['R4C8', 'R4C9'],
  ['R5C9', 'R6C9'],
  ['R6C8', 'R6C9'],
  ['R6C7', 'R7C7'],
  ['R7C6', 'R7C7'],
  ['R8C6', 'R9C6'],
  ['R9C5', 'R9C6'],
  ['R8C4', 'R9C4'],
].map(cells => new WhiteDot(...cells));

return [
  new Shape('9x9'),

  // Main diagonal outside-clue sum; digits may repeat (LittleKiller does not
  // impose distinctness beyond what row/col/box already give the diagonal).
  LittleKiller.fromCells(42, graph.ray('R1C1', 1, 1), geometry),

  ...arrows,

  // No dedicated Odd/Even class; parity clues are candidate restrictions.
  new Given('R5C5', 2, 4, 6, 8),
  new Given('R6C6', 2, 4, 6, 8),
  new Given('R6C9', 1, 3, 5, 7, 9),
  new Given('R9C6', 1, 3, 5, 7, 9),

  ...whiteDots,
];
