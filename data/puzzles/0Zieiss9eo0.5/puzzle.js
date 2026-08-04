// Title: March 24, 2023: HI
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=0Zieiss9eo0
// Source: https://tinyurl.com/4srh85vy

// Normal sudoku rules apply. Each black dot is a Kropki-style 2:1 ratio pair
// between the two orthogonally adjacent cells it separates; the rules state
// there is no negative constraint, so absent dots carry no information and
// only the drawn dots are encoded.

const ratioDots = [
  ['R2C2', 'R3C2'],
  ['R3C2', 'R4C2'],
  ['R4C2', 'R5C2'],
  ['R3C3', 'R4C3'],
  ['R2C4', 'R3C4'],
  ['R3C4', 'R4C4'],
  ['R4C4', 'R5C4'],
  ['R6C5', 'R6C6'],
  ['R6C6', 'R6C7'],
  ['R6C7', 'R6C8'],
  ['R8C5', 'R8C6'],
  ['R8C6', 'R8C7'],
  ['R8C7', 'R8C8'],
  ['R7C6', 'R7C7'],
];

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C6', 5),
  new Given('R1C9', 4),
  new Given('R2C6', 9),
  new Given('R4C1', 8),
  new Given('R5C5', 9),
  new Given('R6C9', 6),
  new Given('R8C4', 9),
  new Given('R9C1', 2),
  new Given('R9C4', 7),
  new Given('R9C9', 3),

  ...ratioDots.map(([a, b]) => new BlackDot(a, b)),
];
