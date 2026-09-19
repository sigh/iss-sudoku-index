// Title: Raswor
// Author: Derektionary
// Video: https://www.youtube.com/watch?v=3cH5kQ70b1A
// Source: https://test.crackingthecryptic.com/sudoku/2PqTbt7MhQ

// Normal sudoku rules apply. Digits along an arrow sum to the digit in that
// arrow's circle. Purple lines must contain a string of consecutive digits,
// in any order (Renban). Standard 3x3 boxes (the payload's regions are
// exactly the default boxes).

return [
  new Shape('9x9'),

  new Given('R1C6', 4),

  // Arrows: bulb cell first, then arm cells (Arrow sums the arm to the bulb).
  new Arrow('R2C3', 'R3C3', 'R3C2'),
  new Arrow('R2C7', 'R3C7', 'R3C8', 'R3C9'),
  new Arrow('R4C4', 'R5C4', 'R4C5', 'R4C6'),
  new Arrow('R6C7', 'R5C7', 'R4C7'),
  new Arrow('R7C6', 'R8C7', 'R9C8', 'R9C9'),
  new Arrow('R7C2', 'R7C3', 'R8C3', 'R9C3'),

  // Purple lines: Renban (consecutive digits, any order -- set-based, no
  // direction/order needed).
  new Renban('R3C1', 'R2C1', 'R1C1', 'R1C2', 'R2C2'),
  new Renban('R1C5', 'R2C5', 'R3C4', 'R3C5', 'R3C6'),
  new Renban('R1C8', 'R2C8', 'R2C9'),
  new Renban('R4C9', 'R4C8', 'R5C8', 'R6C8'),
  new Renban('R6C4', 'R6C5', 'R5C5', 'R5C6'),
  new Renban('R8C1', 'R9C2'),
  new Renban('R8C4', 'R8C5', 'R8C6', 'R7C6'),
  new Renban('R8C8', 'R7C8', 'R7C9', 'R8C9'),
];
