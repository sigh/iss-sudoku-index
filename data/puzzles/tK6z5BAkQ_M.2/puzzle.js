// Title: Dec. 5, 2021: The Letter K
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=tK6z5BAkQ_M
// Source: https://tinyurl.com/2p8m5nkb

// Normal sudoku rules apply. Digits along a line must have values strictly
// between the values in the circles on the ends of that line: `Between`
// enforces this directly, with the first and last cell of each line as the
// two circle endpoints.
//
// 18 between lines, transcribed from the payload's `betweenline` array
// (each entry is one line, cells given endpoint-to-endpoint).

return [
  new Shape('9x9'),

  new Given('R1C7', 5),
  new Given('R2C2', 9),
  new Given('R2C5', 6),
  new Given('R2C8', 1),
  new Given('R4C1', 4),
  new Given('R5C2', 2),
  new Given('R5C5', 3),
  new Given('R5C8', 7),
  new Given('R7C9', 3),
  new Given('R8C2', 5),
  new Given('R8C5', 8),
  new Given('R8C8', 4),
  new Given('R9C3', 6),

  new Between('R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'),
  new Between('R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'),
  new Between('R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2'),
  new Between('R9C2', 'R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2'),
  new Between('R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8'),
  new Between('R8C8', 'R8C7', 'R8C6', 'R8C5', 'R8C4'),
  new Between('R8C4', 'R7C4', 'R6C4', 'R5C4'),
  new Between('R6C3', 'R7C3', 'R8C3'),
  new Between('R5C4', 'R5C5', 'R5C6', 'R5C7'),
  new Between('R5C7', 'R6C7', 'R7C7'),
  new Between('R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8'),
  new Between('R3C2', 'R3C3', 'R3C4'),
  new Between('R3C6', 'R3C7', 'R3C8'),
  new Between('R2C8', 'R2C7', 'R2C6'),
  new Between('R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1'),
  new Between('R7C1', 'R8C1', 'R9C1'),
  new Between('R2C2', 'R2C3', 'R2C4'),
  new Between('R7C5', 'R7C6', 'R7C7'),
];
