// Title: May 24, 2022: Between
// Author: clover!
// Video: https://www.youtube.com/watch?v=gKQTO43SAxY
// Source: https://tinyurl.com/2rysp6an

// Normal sudoku rules apply (default row/column/box all-different). Each
// between line's cells must have values strictly between the values in the
// two circles at its ends; Between takes the full ordered cell list with the
// endpoint circles as its first and last argument, so the circles need no
// separate encoding.
//
// Between lines, transcribed from the payload's `betweenline` entries:
const betweenLines = [
  ['R2C4', 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4'],
  ['R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6'],
  ['R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3'],
  ['R4C2', 'R5C2', 'R6C2'],
  ['R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7'],
  ['R6C8', 'R5C8', 'R4C8'],
  ['R8C1', 'R8C2', 'R9C2'],
  ['R1C8', 'R2C8', 'R2C9'],
];

return [
  new Shape('9x9'),

  new Given('R1C5', 7),
  new Given('R2C4', 2),
  new Given('R2C6', 3),
  new Given('R3C5', 8),
  new Given('R4C2', 7),
  new Given('R4C8', 5),
  new Given('R5C1', 2),
  new Given('R5C4', 4),
  new Given('R5C6', 6),
  new Given('R5C9', 9),
  new Given('R7C3', 3),
  new Given('R7C5', 5),
  new Given('R7C7', 4),
  new Given('R9C5', 4),

  ...betweenLines.map(cells => new Between(...cells)),
];
