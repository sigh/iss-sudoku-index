// Title: Dec. 22, 2022: All Odd or Even
// Author: clover!
// Video: https://www.youtube.com/watch?v=PNpFh4WQ6KU
// Source: https://tinyurl.com/ycp43b65

// Normal sudoku rules apply. Within each 3x3 box, either every shaded cell in
// that box is odd, or every shaded cell in that box is even; each box's
// parity choice is independent of the others. A box with no shaded cells has
// nothing to constrain.
//
// Shaded (grey #A8A8A8) cells, transcribed from the drawn per-cell shading.
const SHADED = [
  'R1C1', 'R1C3', 'R1C5', 'R1C9',
  'R2C7',
  'R3C1', 'R3C3', 'R3C5', 'R3C8',
  'R5C1', 'R5C3',
  'R5C7', 'R5C9',
  'R7C5',
  'R7C7', 'R7C9',
  'R8C2',
  'R9C1', 'R9C5', 'R9C7', 'R9C9',
];

const ODD = [1, 3, 5, 7, 9];
const EVEN = [2, 4, 6, 8];

const graph = cellGraph('9x9');
const shadedSet = new Set(SHADED);

// Group the shaded cells by box (derived from the box tiling, not
// hand-enumerated), then build the "all odd or all even" disjunction for
// each box that actually has shaded cells.
const parityConstraints = graph.boxes()
  .map(box => box.filter(cell => shadedSet.has(cell)))
  .filter(cells => cells.length > 0)
  .map(cells => new Or([
    new And(cells.map(cell => new Given(cell, ...ODD))),
    new And(cells.map(cell => new Given(cell, ...EVEN))),
  ]));

return [
  new Shape('9x9'),

  new Given('R1C7', 9), new Given('R1C8', 7),
  new Given('R2C5', 1), new Given('R2C9', 8),
  new Given('R3C4', 7), new Given('R3C9', 4),
  new Given('R4C1', 8), new Given('R4C7', 3),
  new Given('R5C2', 1), new Given('R5C8', 2),
  new Given('R6C3', 7), new Given('R6C9', 9),
  new Given('R7C1', 3), new Given('R7C6', 9),
  new Given('R8C1', 5), new Given('R8C5', 2),
  new Given('R9C2', 4), new Given('R9C3', 6),

  ...parityConstraints,
];
