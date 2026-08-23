// Title: Ready.. Set.. Colour!
// Author: PjotrV
// Video: https://www.youtube.com/watch?v=3bfSTczk4d8
// Source: https://app.crackingthecryptic.com/sudoku/MgrpPMnbB8

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). Cages: digits sum to the small total in the cage's
// top-left cell, no repeated digit within a cage -- Cage(sum, ...cells)
// enforces both. Arrows: digits along the arrow sum to the digit in the
// arrow's circle -- Arrow(...cells) treats the first cell as the circle
// and the rest as the path, matching the drawn bulb-first waypoint order
// (js/sudoku_constraint.js Arrow constructor / builder).
// The six plain white/light-grey circle markers in the payload sit exactly
// on the six arrow bulb cells; they are the rendered bulbs, not a separate
// clue, so they are not encoded.

const cages = [
  [8, 'R4C1', 'R5C1', 'R6C1'],
  [15, 'R4C3', 'R5C3'],
  [22, 'R5C4', 'R5C5', 'R5C6'],
  [15, 'R5C7', 'R6C7'],
  [5, 'R4C5', 'R4C6'],
  [6, 'R6C3', 'R6C4'],
  [15, 'R7C5', 'R8C5'],
  [12, 'R8C3', 'R8C4'],
  [10, 'R9C2', 'R9C3'],
  [9, 'R4C9', 'R5C9', 'R6C9'],
  [15, 'R2C5', 'R3C5'],
  [15, 'R3C4', 'R4C4'],
  [12, 'R2C6', 'R2C7'],
  [10, 'R1C7', 'R1C8'],
];

const arrows = [
  ['R1C1', 'R2C2', 'R3C2', 'R3C3'],
  ['R2C3', 'R1C4', 'R1C5', 'R1C6'],
  ['R1C9', 'R2C8', 'R3C8', 'R3C7'],
  ['R9C9', 'R8C8', 'R7C8', 'R7C7'],
  ['R8C7', 'R9C6', 'R9C5', 'R9C4'],
  ['R9C1', 'R8C2', 'R7C2', 'R7C3'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
];
