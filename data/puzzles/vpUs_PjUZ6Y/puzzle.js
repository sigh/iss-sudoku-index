// Title: Z Is For Zebra
// Author: Josh Johnson
// Video: https://www.youtube.com/watch?v=vpUs_PjUZ6Y
// Source: https://app.crackingthecryptic.com/sudoku/8JhRLBh8bt

// Normal sudoku rules apply. Black dot: the two digits are in a 1:2 ratio
// (one double the other). White dot: the two digits are consecutive. Not
// all possible dots are given, so absence of a dot is not encoded -- only
// the drawn dots below are constrained. Digits along an arrow sum to the
// digit in that arrow's circle. Two circles (R5C4, R5C6) each anchor two
// arrows radiating in different directions; each arm is its own Arrow
// constraint sharing that bulb cell.

return [
  new Shape('9x9'),

  // Black dots (ratio 1:2) -- overlays with fill #000000
  new BlackDot('R6C1', 'R6C2'),
  new BlackDot('R6C5', 'R7C5'),
  new BlackDot('R3C5', 'R4C5'),
  new BlackDot('R1C5', 'R1C6'),
  new BlackDot('R9C4', 'R9C5'),
  new BlackDot('R8C2', 'R9C2'),
  new BlackDot('R3C7', 'R4C7'),

  // White dots (consecutive) -- overlays with fill #ffffff
  new WhiteDot('R1C2', 'R1C3'),
  new WhiteDot('R1C8', 'R2C8'),
  new WhiteDot('R4C8', 'R4C9'),
  new WhiteDot('R5C5', 'R5C6'),
  new WhiteDot('R5C4', 'R5C5'),
  new WhiteDot('R6C3', 'R7C3'),
  new WhiteDot('R9C7', 'R9C8'),

  // Arrows (bulb cell first, then arm cells) -- from raw arrows[] wayPoints
  new Arrow('R1C5', 'R1C4', 'R1C3'),
  new Arrow('R5C6', 'R5C7', 'R5C8'),
  new Arrow('R5C4', 'R5C3', 'R5C2'),
  new Arrow('R6C3', 'R7C2', 'R8C1'),
  new Arrow('R4C7', 'R3C8', 'R2C9'),
  new Arrow('R9C5', 'R9C6', 'R9C7'),
  new Arrow('R5C4', 'R6C4', 'R6C5'),
  new Arrow('R5C6', 'R4C6', 'R4C5'),
];
