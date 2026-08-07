// Title: Capsules Sudoku
// Author: bakpao
// Video: https://www.youtube.com/watch?v=IbyFPWoj7JA
// Source: https://tinyurl.com/yc5ctxvj

// Normal sudoku rules apply. Each of the 12 capsules below (drawn as
// two-cell pill overlays, not arrows) contains exactly one odd and one
// even digit. Encoded as a Pair over each edge with a custom relation
// checking differing parity.
const capsules = [
  ['R2C2', 'R2C3'],
  ['R8C7', 'R8C8'],
  ['R3C1', 'R3C2'],
  ['R7C8', 'R7C9'],
  ['R7C1', 'R8C1'],
  ['R8C2', 'R9C2'],
  ['R2C9', 'R3C9'],
  ['R1C8', 'R2C8'],
  ['R7C5', 'R8C5'],
  ['R5C7', 'R5C8'],
  ['R2C5', 'R3C5'],
  ['R5C2', 'R5C3'],
];

return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R1C2', 2),
  new Given('R2C1', 4), new Given('R2C2', 3), new Given('R2C7', 1),
  new Given('R3C6', 8), new Given('R3C7', 9), new Given('R3C8', 2),
  new Given('R4C6', 1), new Given('R4C7', 8),
  new Given('R5C5', 5),
  new Given('R6C3', 6), new Given('R6C4', 2),
  new Given('R7C2', 6), new Given('R7C3', 3), new Given('R7C4', 4),
  new Given('R8C3', 2), new Given('R8C8', 7), new Given('R8C9', 8),
  new Given('R9C8', 1), new Given('R9C9', 3),
  ...capsules.map(cells => new Pair(
    Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9),
    '', ...cells
  )),
];
