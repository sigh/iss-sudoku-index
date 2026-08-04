// Title: New Order T-Shirt
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=t7hYdmUfG1U
// Source: https://tinyurl.com/3kvnv468

// Normal sudoku. Each of the 9 purple lines is a Renban line: the cells it
// covers hold a set of consecutive, non-repeating digits in any order.
// Line cells transcribed from the `renban`/`line` arrays in the source payload.
const renbanLines = [
  ['R3C1', 'R2C2', 'R1C3'],
  ['R1C4', 'R2C5', 'R3C6'],
  ['R3C7', 'R2C8', 'R1C9'],
  ['R4C7', 'R5C8', 'R6C9'],
  ['R4C6', 'R5C5', 'R6C4'],
  ['R6C3', 'R5C2', 'R4C1'],
  ['R9C1', 'R8C2', 'R7C3'],
  ['R7C4', 'R8C5', 'R9C6'],
  ['R9C7', 'R8C8', 'R7C9'],
];

return [
  new Shape('9x9'),

  new Given('R1C1', 4),
  new Given('R1C6', 6),
  new Given('R1C7', 3),
  new Given('R3C3', 7),
  new Given('R3C4', 4),
  new Given('R3C9', 6),
  new Given('R4C3', 8),
  new Given('R4C4', 2),
  new Given('R4C9', 3),
  new Given('R6C1', 7),
  new Given('R6C6', 8),
  new Given('R6C7', 6),
  new Given('R7C1', 3),
  new Given('R7C6', 2),
  new Given('R7C7', 4),
  new Given('R9C3', 6),
  new Given('R9C4', 3),
  new Given('R9C9', 7),

  ...renbanLines.map((cells) => new Renban(...cells)),
];
