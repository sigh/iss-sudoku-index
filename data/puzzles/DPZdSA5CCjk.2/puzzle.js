// Title: September 4, 2022: Two for One
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=DPZdSA5CCjk
// Source: https://tinyurl.com/2pjh85jw

// Normal sudoku rules apply. Digits joined by a black dot must be in a 2:1
// ratio. No negative constraint: undotted adjacent pairs may also be 2:1.
// Black dot pairs from the drawn dots.

return [
  new Shape('9x9'),
  new BlackDot('R3C4', 'R3C5'),
  new BlackDot('R2C5', 'R2C6'),
  new BlackDot('R1C7', 'R1C6'),
  new BlackDot('R2C8', 'R2C7'),
  new BlackDot('R1C8', 'R1C9'),
  new BlackDot('R7C6', 'R7C5'),
  new BlackDot('R8C5', 'R8C4'),
  new BlackDot('R9C3', 'R9C4'),
  new BlackDot('R8C2', 'R8C3'),
  new BlackDot('R9C1', 'R9C2'),
];
