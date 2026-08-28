// Title: Dec 22, 2021: Consec Pairs
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=4cJENB2S1pI
// Source: https://tinyurl.com/2p948fj3

// Normal Sudoku rules. Each white dot below forces its pair of cells to hold
// consecutive digits (WhiteDot). The absence of a dot between two cells
// carries no meaning -- the rules explicitly disclaim any negative
// inference, so no anti-consecutive constraint is added for undotted pairs.

const whiteDots = [
  ['R1C1', 'R1C2'],
  ['R1C3', 'R1C4'],
  ['R1C5', 'R1C6'],
  ['R1C7', 'R1C8'],
  ['R2C3', 'R3C3'],
  ['R2C9', 'R3C9'],
  ['R4C1', 'R4C2'],
  ['R4C5', 'R4C6'],
  ['R6C4', 'R6C5'],
  ['R6C8', 'R6C9'],
  ['R7C7', 'R8C7'],
  ['R7C1', 'R8C1'],
  ['R9C2', 'R9C3'],
  ['R9C4', 'R9C5'],
  ['R9C6', 'R9C7'],
  ['R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C3', 3),
  new Given('R1C5', 5),
  new Given('R1C7', 7),
  new Given('R3C6', 3),
  new Given('R4C2', 1),
  new Given('R4C4', 8),
  new Given('R4C9', 7),
  new Given('R6C1', 5),
  new Given('R6C6', 1),
  new Given('R6C8', 3),
  new Given('R7C4', 2),
  new Given('R9C3', 8),
  new Given('R9C5', 6),
  new Given('R9C7', 4),
  new Given('R9C9', 2),

  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];
