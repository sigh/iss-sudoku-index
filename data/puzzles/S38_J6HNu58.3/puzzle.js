// Title: July 24, 2022: Antirenban
// Author: clover!
// Video: https://www.youtube.com/watch?v=S38_J6HNu58
// Source: https://tinyurl.com/yf5pffaw

// Normal sudoku rules apply. Each drawn cage (no total shown on any of them)
// forbids both duplicate digits and consecutive digits between every pair of
// its cells -- not just cells adjacent within the cage. A single PairX
// predicate over each cage's whole cell set expresses both clauses at once:
// abs(a - b) > 1 is false when a === b (duplicate) and false when the values
// are consecutive. The lavender highlight in the source draws exactly the
// union of these cage cells (47 = the sum of the cage sizes below) and adds
// no separate rule.
const antirenbanKey = PairX.fnToKey((a, b) => Math.abs(a - b) > 1, 9);

// Drawn cages; none carries a printed total.
const CAGES = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1'],
  ['R1C8', 'R1C9', 'R2C9', 'R3C9'],
  ['R8C9', 'R9C7', 'R9C8', 'R9C9'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2'],
  ['R1C5', 'R1C6', 'R2C5', 'R2C6'],
  ['R8C4', 'R8C5', 'R9C4', 'R9C5'],
  ['R4C1', 'R4C2', 'R5C1', 'R5C2'],
  ['R5C8', 'R5C9', 'R6C8', 'R6C9'],
  ['R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'],
  ['R3C4', 'R4C4'],
  ['R6C6', 'R7C6'],
  ['R3C7', 'R3C8', 'R4C7'],
  ['R6C3', 'R7C2', 'R7C3'],
];

return [
  new Shape('9x9'),
  new Given('R1C1', 2),
  new Given('R1C8', 3),
  new Given('R1C9', 6),
  new Given('R2C1', 5),
  new Given('R2C5', 9),
  new Given('R3C4', 7),
  new Given('R5C2', 3),
  new Given('R5C8', 7),
  new Given('R7C6', 3),
  new Given('R8C5', 1),
  new Given('R8C9', 5),
  new Given('R9C1', 4),
  new Given('R9C2', 7),
  new Given('R9C9', 8),
  ...CAGES.map(cells => new PairX(antirenbanKey, 'Antirenban', ...cells)),
];
