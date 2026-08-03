// Title: Pyramidal Arrows v2
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=9DU-sRXSSD0
// Source: https://app.crackingthecryptic.com/sudoku/J6GdmRM6JT

// Normal sudoku rules apply (default 9x9 rows/columns/boxes).
// Arrow: digits along the arrow sum to the digit in that arrow's circle
// (bulb cell listed first, then the arm cells in path order).
// Cage: the digits in a cage sum to the small clue shown in the cage's
// top-left cell. The rules text does not say cage digits must be distinct,
// but every cage below sits entirely within one row or one column, so
// normal sudoku already forces its digits distinct either way -- Cage vs.
// the repeats-allowed Sum class would produce the same constraint here.

// Bulb cell first, then arm cells, per raw wayPoints order (source: arrows[]).
const arrows = [
  ['R8C1', 'R7C2', 'R6C3', 'R5C4', 'R4C5'],
  ['R8C9', 'R7C8', 'R6C7', 'R5C6', 'R4C5'],
  ['R7C5', 'R8C5', 'R9C5'],
  ['R8C4', 'R8C3', 'R8C2'],
  ['R8C6', 'R8C7', 'R8C8'],
  ['R5C3', 'R4C2', 'R4C1', 'R3C1', 'R2C2'],
  ['R5C7', 'R4C8', 'R4C9', 'R3C9', 'R2C8'],
  ['R2C3', 'R1C4', 'R1C5'],
  ['R2C7', 'R1C6', 'R1C5'],
];

// [sum, ...cells], source: cages[] entries with `cells`.
const cages = [
  [19, 'R3C4', 'R3C5', 'R3C6'],
  [19, 'R4C4', 'R4C5', 'R4C6'],
  [10, 'R5C1', 'R5C2'],
  [10, 'R5C8', 'R5C9'],
  [15, 'R7C3', 'R8C3', 'R9C3'],
  [16, 'R7C7', 'R8C7', 'R9C7'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
