// Title: 11/27: Oxalis Quadrangularis
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=rV-Z57M3y9I
// Source: https://tinyurl.com/mu9c6wp2

// Normal sudoku rules apply (standard 3x3 boxes, from the payload's regions).
// Each marked (grey) line must contain a non-repeating set of consecutive
// digits, in any order: Renban. Four bent lines, each 8 cells.

const renbanLines = [
  ['R2C3', 'R1C4', 'R1C5', 'R1C6', 'R2C7', 'R3C7', 'R4C7', 'R5C6'],
  ['R3C8', 'R4C9', 'R5C9', 'R6C9', 'R7C8', 'R7C7', 'R7C6', 'R6C5'],
  ['R5C4', 'R6C3', 'R7C3', 'R8C3', 'R9C4', 'R9C5', 'R9C6', 'R8C7'],
  ['R4C5', 'R3C4', 'R3C3', 'R3C2', 'R4C1', 'R5C1', 'R6C1', 'R7C2'],
];

return [
  new Shape('9x9'),

  new Given('R1C1', 7), new Given('R1C2', 5), new Given('R1C3', 6),
  new Given('R1C7', 2), new Given('R1C8', 1), new Given('R1C9', 3),
  new Given('R2C1', 9), new Given('R2C9', 6),
  new Given('R3C1', 1), new Given('R3C9', 8),
  new Given('R4C5', 1),
  new Given('R5C4', 9), new Given('R5C6', 2),
  new Given('R6C5', 8),
  new Given('R7C1', 2), new Given('R7C9', 9),
  new Given('R8C1', 3), new Given('R8C9', 1),
  new Given('R9C1', 4), new Given('R9C2', 9), new Given('R9C3', 1),
  new Given('R9C7', 8), new Given('R9C8', 7), new Given('R9C9', 5),

  ...renbanLines.map((cells) => new Renban(...cells)),
];
