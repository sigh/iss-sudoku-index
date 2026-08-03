// Title: July 21, 2023: Stinking Bishop
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=vUnxsoraVuk
// Source: https://tinyurl.com/mtkc6x3k
//
// Normal sudoku. Killer cages: distinct digits summing to the given total.
// Kropki dots: white = consecutive digits, black = 2:1 ratio; no negative
// constraint stated, so unmarked adjacent pairs are unconstrained. XV pairs:
// 'V' = sum to 5, 'X' = sum to 10; same no-negative-constraint reading. No
// given digits.

return [
  new Shape('9x9'),

  // Killer cages, cell-by-cell as drawn.
  new Cage(8, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(13, 'R1C3', 'R1C4', 'R2C4'),
  new Cage(18, 'R1C6', 'R1C7', 'R2C6'),
  new Cage(9, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(6, 'R3C1', 'R4C1', 'R4C2'),
  new Cage(16, 'R3C4', 'R4C3', 'R4C4'),
  new Cage(19, 'R3C6', 'R4C6', 'R4C7'),
  new Cage(19, 'R3C9', 'R4C8', 'R4C9'),
  new Cage(15, 'R6C1', 'R6C2', 'R7C1'),
  new Cage(13, 'R6C3', 'R6C4', 'R7C4'),
  new Cage(24, 'R6C6', 'R6C7', 'R7C6'),
  new Cage(13, 'R6C8', 'R6C9', 'R7C9'),
  new Cage(18, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(15, 'R8C4', 'R9C3', 'R9C4'),
  new Cage(7, 'R8C6', 'R9C6', 'R9C7'),
  new Cage(12, 'R8C9', 'R9C8', 'R9C9'),

  // Kropki white dots.
  new WhiteDot('R6C3', 'R6C2'),
  new WhiteDot('R7C1', 'R8C1'),
  new WhiteDot('R9C3', 'R9C2'),
  new WhiteDot('R7C4', 'R8C4'),

  // Kropki black dots.
  new BlackDot('R2C6', 'R3C6'),
  new BlackDot('R1C7', 'R1C8'),
  new BlackDot('R3C9', 'R2C9'),
  new BlackDot('R4C8', 'R4C7'),

  // V pairs.
  new V('R1C2', 'R1C3'),
  new V('R4C2', 'R4C3'),
  new V('R2C4', 'R3C4'),
  new V('R2C1', 'R3C1'),

  // X pairs.
  new X('R6C7', 'R6C8'),
  new X('R9C7', 'R9C8'),
  new X('R7C9', 'R8C9'),
  new X('R7C6', 'R8C6'),
];
