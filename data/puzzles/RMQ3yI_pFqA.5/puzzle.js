// Title: Wedding in Finistere
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=RMQ3yI_pFqA
// Source: https://tinyurl.com/cb8p7fh2

// Normal sudoku rules apply (rows, columns, 3x3 boxes). Digits on lines
// connecting circles must lie between the circled digits numerically: each
// line's first and last cell are the circled ends; every cell strictly
// between them must be numerically between the two end values (Between's
// semantics per js/sudoku_constraint.js).

const givens = [
  new Given('R1C6', 3), new Given('R1C8', 7),
  new Given('R2C2', 1), new Given('R2C8', 4), new Given('R2C9', 6),
  new Given('R3C4', 4),
  new Given('R4C3', 2), new Given('R4C9', 8),
  new Given('R6C1', 3), new Given('R6C7', 2),
  new Given('R7C6', 6),
  new Given('R8C1', 2), new Given('R8C2', 3), new Given('R8C8', 9),
  new Given('R9C2', 5), new Given('R9C4', 7),
];

// Eight between lines, transcribed from the payload's `betweenline` array
// (endpoint-to-endpoint cell order as drawn).
const betweenLines = [
  new Between('R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6'),
  new Between('R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1'),
  new Between('R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6'),
  new Between('R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6'),
  new Between('R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'),
  new Between('R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'),
  new Between('R9C4', 'R8C4', 'R7C4', 'R6C4', 'R5C4', 'R4C4'),
  new Between('R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...betweenLines,
];
