// Title: July 5, 2022: Laa Tinvaal
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=glCWGqNR2U0
// Source: https://tinyurl.com/29httahf

// Normal sudoku rules apply. Digits along a line must have values strictly
// between the values in the circles on the ends of that line. `Between`'s own
// semantics ("Values on the line must be strictly between the values in the
// circles") match this rule directly, so each line below is one Between call
// over its full cell list (endpoints included, per the class contract).

// Provenance: the 12 line segments below are the drawn between-lines, each a
// leg of one continuous spiral of circled joints -- adjacent legs share their
// joint cell as a common circled endpoint.
const betweenLines = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1'],
  ['R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1'],
  ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6'],
  ['R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6'],
  ['R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2'],
  ['R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2'],
  ['R4C2', 'R4C3', 'R4C4', 'R4C5'],
  ['R4C5', 'R5C5', 'R6C5', 'R7C5'],
  ['R7C5', 'R7C4', 'R7C3'],
  ['R7C3', 'R6C3', 'R5C3'],
];

// Provenance: the drawn givens.
const givens = [
  ['R1C9', 1], ['R2C4', 7], ['R2C8', 2], ['R3C3', 6], ['R3C7', 3],
  ['R4C6', 4], ['R5C5', 5], ['R6C1', 5], ['R6C8', 9], ['R7C7', 8],
  ['R8C1', 2], ['R9C1', 1], ['R9C2', 3], ['R9C4', 4],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...betweenLines.map(cells => new Between(...cells)),
];
