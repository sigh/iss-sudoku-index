// Title: Multiple Role Sudoku
// Author: Daniel Galao Birkmann
// Video: https://www.youtube.com/watch?v=FhKT0w60aWg
// Source: https://cracking-the-cryptic.web.app/sudoku/Jr4LQRpR4M
//
// Normal sudoku (givens + standard rows/columns/boxes). Digits increase along
// thermometers from the bulb. Each number outside the grid is simultaneously
// an X-Sum, a Sandwich sum and a Skyscraper-visibility count for the same
// row/column read from that side. Identical digits cannot be a knight's move
// apart.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Two 2-cell thermometers, bulb first (grey circle + line, geometry helper).
const thermos = [
  ['R6C4', 'R6C5'],
  ['R2C8', 'R2C9'],
];

// Outside clues: value, and the row/column read from the clue's printed side.
// "top of C6" reads column 6 downward; "left of R6" reads row 6 rightward.
const outsideClues = [
  { value: 6, cells: graph.column(6) },
  { value: 5, cells: graph.row(6) },
];

const outsideConstraints = outsideClues.flatMap(({ value, cells }) => [
  XSum.fromCells(value, cells, geometry),
  Sandwich.fromCells(value, cells, geometry),
  Skyscraper.fromCells(value, cells, geometry),
]);

return [
  new Shape('9x9'),

  new Given('R2C2', 5),
  new Given('R2C3', 9),
  new Given('R7C8', 2),
  new Given('R7C9', 5),

  ...thermos.map(cells => new Thermo(...cells)),

  ...outsideConstraints,

  new AntiKnight(),
];
