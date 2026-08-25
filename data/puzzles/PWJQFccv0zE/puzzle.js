// Title: Brambles
// Author: Henk Nicolai
// Video: https://www.youtube.com/watch?v=PWJQFccv0zE
// Source: https://app.crackingthecryptic.com/sudoku/bpN9rFng8p

// Normal sudoku rules apply (default row/column/box all-different, no givens).
// Digits along an arrow must sum to the digit in its circle. Digits may
// repeat along an arrow. Arrow(bulb, ...shaft) sums the shaft cells into the
// bulb and allows shaft repeats, matching both clauses.
//
// Arrow bulb/shaft cells transcribed from the drawn circle+line geometry
// (each arrow's circle paired with its line path).
const arrows = [
  ['R1C1', 'R2C2', 'R3C2', 'R4C1'],
  ['R1C2', 'R2C1', 'R3C1', 'R4C2'],
  ['R3C5', 'R3C4', 'R2C3'],
  ['R2C7', 'R2C8', 'R3C8', 'R3C7'],
  ['R4C6', 'R4C7', 'R4C8', 'R4C9'],
  ['R5C5', 'R5C6', 'R6C6'],
  ['R6C3', 'R5C3', 'R5C4'],
  ['R7C1', 'R6C2'],
  ['R9C3', 'R8C3', 'R7C3', 'R6C4', 'R6C5'],
  ['R7C9', 'R6C9', 'R5C8'],
  ['R8C9', 'R9C9', 'R9C8'],
  ['R7C7', 'R8C6', 'R8C5', 'R7C5'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
];
