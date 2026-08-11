// Title: Unknown
// Author: Orvos
// Video: https://www.youtube.com/watch?v=hB5S4p-1H20
// Source: https://app.crackingthecryptic.com/sudoku/nFdT3HhB2q

// Normal sudoku rules apply (rows, columns, and the drawn 3x3 boxes each
// contain 1-9 once, handled by the default Shape('9x9') regions). Digits on
// an arrow sum to the digit in the attached circle. The diagonal line
// (top-right to bottom-left) contains no repeated digits.
//
// The 8 drawn circles each anchor 1-4 arrows; Arrow(control, ...arm) matches
// ISS's control-cell-first convention.

return [
  new Shape('9x9'),

  // Circle R1C1 -- 3 arrows
  new Arrow('R1C1', 'R1C2', 'R1C3'),
  new Arrow('R1C1', 'R2C2', 'R3C3'),
  new Arrow('R1C1', 'R2C1', 'R3C1'),

  // Circle R1C5 -- 3 arrows
  new Arrow('R1C5', 'R1C4', 'R2C4'),
  new Arrow('R1C5', 'R2C5', 'R3C5'),
  new Arrow('R1C5', 'R1C6', 'R2C6'),

  // Circle R1C9 -- 3 arrows
  new Arrow('R1C9', 'R1C8', 'R1C7'),
  new Arrow('R1C9', 'R2C9', 'R3C9'),
  new Arrow('R1C9', 'R2C8', 'R3C7'),

  // Circle R4C1 -- 3 arrows
  new Arrow('R4C1', 'R5C2', 'R6C3'),
  new Arrow('R4C1', 'R4C2', 'R5C3'),
  new Arrow('R4C1', 'R5C1', 'R6C2'),

  // Circle R5C5 -- 4 arrows
  new Arrow('R5C5', 'R5C6', 'R4C6'),
  new Arrow('R5C5', 'R5C4', 'R6C4'),
  new Arrow('R5C5', 'R6C6', 'R6C7'),
  new Arrow('R5C5', 'R4C4', 'R3C4'),

  // Circle R5C9 -- 1 arrow
  new Arrow('R5C9', 'R4C8', 'R3C8'),

  // Circle R8C8 -- 1 arrow
  new Arrow('R8C8', 'R7C8', 'R7C9'),

  // Circle R9C1 -- 3 arrows
  new Arrow('R9C1', 'R8C1', 'R7C1'),
  new Arrow('R9C1', 'R9C2', 'R9C3'),
  new Arrow('R9C1', 'R8C2', 'R7C3'),

  // The drawn diagonal runs from R1C9 to R9C1 (top-right to bottom-left);
  // direction=1 walks that anti-diagonal (ISS: c = numCols - r - 1),
  // matching the drawn line's cells exactly.
  new Diagonal(1),
];
