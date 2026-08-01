// Title: Four-Lane Highways
// Author: GemmaOane
// Video: https://www.youtube.com/watch?v=m80gjzgrIuU
// Source: https://app.crackingthecryptic.com/8JDrMbDgtR

// Normal Sudoku rules apply. Each drawn arrow arm sums to its circle digit.
// The arrow paths below are transcribed from the seventeen individually drawn strokes.
return [
  new Shape('9x9'),

  // Purple arrows.
  new Arrow('R5C6', 'R5C5', 'R4C4'),
  new Arrow('R5C6', 'R6C7', 'R6C8'),
  new Arrow('R7C4', 'R6C3', 'R6C2'),
  new Arrow('R8C1', 'R9C2', 'R9C3'),
  new Arrow('R2C9', 'R1C8', 'R1C7'),
  new Arrow('R2C9', 'R2C8', 'R3C8'),
  new Arrow('R2C9', 'R3C9', 'R4C8'),
  new Arrow('R3C4', 'R4C5'),
  new Arrow('R3C4', 'R2C3'),
  new Arrow('R3C4', 'R3C5', 'R2C5', 'R2C6'),

  // Red arrows.
  new Arrow('R5C4', 'R4C3', 'R4C2'),
  new Arrow('R5C4', 'R6C4', 'R5C5'),
  new Arrow('R3C6', 'R4C5', 'R4C4'),
  new Arrow('R3C6', 'R4C7', 'R4C8'),
  new Arrow('R2C4', 'R1C3', 'R1C2'),
  new Arrow('R8C6', 'R7C5', 'R8C4'),
  new Arrow('R8C6', 'R9C7', 'R9C8'),
];
