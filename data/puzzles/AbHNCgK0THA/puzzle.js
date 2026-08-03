// Title: Geometry Exam #2
// Author: Blashyrkh
// Video: https://www.youtube.com/watch?v=AbHNCgK0THA
// Source: https://app.crackingthecryptic.com/sudoku/BpJ3Jgd82T

// Normal sudoku rules apply (default row/col/box all-different; the drawn
// regions are the ordinary 3x3 boxes). Digits along a thermometer increase
// from the bulb end -- Thermo(...) takes cells bulb-first, which is how the
// six lines are transcribed below; each bulb cell is confirmed by a matching
// circle drawn on it.

return [
  new Shape('9x9'),

  new Given('R1C9', 1),
  new Given('R7C6', 2),

  new Thermo('R4C8', 'R3C7', 'R2C7'),
  new Thermo('R5C8', 'R6C8', 'R7C7', 'R8C7', 'R9C7'),
  new Thermo('R4C5', 'R3C4', 'R2C4'),
  new Thermo('R5C5', 'R6C5', 'R7C4', 'R8C4', 'R9C4'),
  new Thermo('R4C2', 'R3C1', 'R2C1'),
  new Thermo('R5C2', 'R6C2', 'R7C1', 'R8C1', 'R9C1'),
];
