// Title: Nine Bent Arrows
// Author: Rodrigo Mahu
// Video: https://www.youtube.com/watch?v=vAhNiOx9qhU
// Source: https://app.crackingthecryptic.com/sudoku/dQdgL4pRt9

// Normal sudoku rules apply (standard rows/columns/boxes from Shape('9x9')).
// Digits along an arrow sum to the digit in that arrow's circle --
// Arrow(circleCell, ...lineCells), circle first then the summed cells, per
// Arrow's semantics. "Digits may repeat along an arrow if allowed by other
// rules" states that no extra all-different applies to an arrow's own
// cells beyond the default row/column/box rules, so no further constraint
// is added for it.
const arrows = [
  ['R3C2', 'R4C3', 'R4C4', 'R5C5'],
  ['R3C4', 'R2C3', 'R2C2', 'R1C1'],
  ['R1C7', 'R2C6', 'R2C5'],
  ['R3C6', 'R2C7', 'R2C8', 'R1C9'],
  ['R3C9', 'R4C8', 'R4C7', 'R5C6'],
  ['R5C8', 'R6C7', 'R6C6'],
  ['R4C1', 'R5C2', 'R5C3', 'R6C4'],
  ['R9C4', 'R8C3', 'R8C2', 'R7C1'],
  ['R9C6', 'R8C7', 'R8C8', 'R7C9'],
].map(cells => new Arrow(...cells));

return [
  new Shape('9x9'),
  ...arrows,
];
