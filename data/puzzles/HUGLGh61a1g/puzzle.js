// Title: Equal Sum Lines
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=HUGLGh61a1g
// Source: https://app.crackingthecryptic.com/4fbMt6QrFB
//
// Normal sudoku rules apply (default 3x3 boxes). All lines have the same sum
// of digits; digits may repeat on a line. Each line below is one EqualSum
// segment; the class requires every segment's sum to match one shared,
// solver-determined total.

const lines = [
  ['R1C4', 'R2C3', 'R3C2', 'R4C1'],
  ['R1C6', 'R2C7', 'R3C8', 'R4C9'],
  ['R2C5', 'R3C5', 'R4C5'],
  ['R6C5', 'R7C5', 'R8C5'],
  ['R5C2', 'R5C3', 'R5C4'],
  ['R5C6', 'R5C7', 'R5C8'],
  ['R6C9', 'R7C8', 'R8C7', 'R9C6'],
  ['R6C1', 'R7C2', 'R8C3', 'R9C4'],
];

return [
  new Shape('9x9'),

  new Given('R1C2', 7), new Given('R1C5', 3), new Given('R1C8', 5),
  new Given('R2C1', 4), new Given('R2C4', 2), new Given('R2C6', 5), new Given('R2C9', 9),
  new Given('R3C3', 9), new Given('R3C7', 6),
  new Given('R4C2', 5), new Given('R4C8', 6),
  new Given('R5C1', 6), new Given('R5C9', 2),
  new Given('R6C2', 9), new Given('R6C8', 8),
  new Given('R7C3', 2), new Given('R7C7', 5),
  new Given('R8C1', 8), new Given('R8C4', 1), new Given('R8C6', 2), new Given('R8C9', 6),
  new Given('R9C2', 1), new Given('R9C5', 5), new Given('R9C8', 2),

  new EqualSum(...lines),
];
