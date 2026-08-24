// Title: Atoll Bridge
// Author: shye, T. Snibbob, Nityant, R Cruz, Leyrann
// Video: https://www.youtube.com/watch?v=UXsVRqkbkGk
// Source: https://app.crackingthecryptic.com/sudoku/Qdm8h9FQfh
//
// Normal sudoku (standard 3x3 boxes, from the payload's own `regions`).
// Cages: sum to the corner total, no repeats (Cage covers both). Thermometer:
// increasing from the bulb (Thermo). Black dot: ratio 1:2 (BlackDot). White
// dot: consecutive (WhiteDot). "Not all possible dots are given" rules out
// the exhaustive/negative Kropki reading, so only the drawn dots are
// constrained -- no StrictKropki. Grey circle: odd; grey square: even,
// encoded as candidate-restricting Givens (no dedicated Odd/Even class).
//
// A fifth grey rounded underlay sits at the thermometer's bulb cell (R7C3),
// sized 0.7x0.7 versus the 0.8x0.8 odd-circle underlays and centered exactly
// on the bulb. Read as the thermometer's own bulb-cap rendering, not a
// second grey-circle clue -- omitted from the odd-cell givens below.

return [
  new Shape('9x9'),

  // Cages (top-left small clue = sum).
  new Cage(16, 'R2C3', 'R3C3', 'R3C2'),
  new Cage(5, 'R2C4', 'R3C4'),
  new Cage(14, 'R2C5', 'R2C6', 'R3C6'),
  new Cage(7, 'R2C7', 'R2C8', 'R3C8'),
  new Cage(18, 'R4C8', 'R5C8', 'R4C7'),
  new Cage(17, 'R4C5', 'R4C6', 'R5C6'),
  new Cage(6, 'R6C7', 'R6C8'),
  new Cage(14, 'R7C8', 'R7C7', 'R8C7'),
  new Cage(15, 'R8C6', 'R8C5'),
  new Cage(40, 'R7C4', 'R8C4', 'R8C3', 'R8C2', 'R7C2', 'R6C2', 'R6C3'),
  new Cage(15, 'R5C2', 'R4C2'),

  // Thermometer, bulb at R7C3, running diagonally to the tip at R3C7.
  new Thermo('R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7'),

  // Dots (edge-centered marks).
  new BlackDot('R2C2', 'R3C2'),
  new WhiteDot('R3C8', 'R4C8'),
  new WhiteDot('R7C8', 'R8C8'),

  // Odd/even cells (grey circle = odd, grey square = even). No dedicated
  // Odd/Even class; encoded as candidate-restricting Givens.
  new Given('R4C5', 1, 3, 5, 7, 9),
  new Given('R4C2', 1, 3, 5, 7, 9),
  new Given('R5C6', 2, 4, 6, 8),
  new Given('R8C6', 2, 4, 6, 8),
];
