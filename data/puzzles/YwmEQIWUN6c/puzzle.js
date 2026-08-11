// Title: Odd Pentominoes On The Loose
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=YwmEQIWUN6c
// Source: https://app.crackingthecryptic.com/sudoku/tbdnBm9fJp

// Rules encoded here:
//   Normal sudoku rules apply.
//   Drawn X pairs sum to 10; drawn V pairs sum to 5 (X, V -- adjacent-cell
//   sum markers).
//   Along the thermometer, digits increase from the bulb end (Thermo).
// Omitted: the 12-pentomino partition of the grid (which cells belong to a
// pentomino at all, and which of the 12 free pentomino shapes each one is),
// the "9 of the 12 pentominoes hold only odd digits" count, and the "each
// X/V pair's two cells belong to two separate pentominoes" restriction --
// all four depend on that unknown partition. Digits repeating inside a
// pentomino needs no encoding (it states the absence of a constraint), and
// "not every X and V is given" is the standard negative-marker disclaimer:
// no constraint is added for an unmarked adjacent pair.

return [
  new Shape('9x9'),

  // Drawn X pairs (sum to 10), from the overlay edge marks.
  new X('R1C3', 'R2C3'),
  new X('R2C5', 'R3C5'),
  new X('R4C1', 'R5C1'),
  new X('R4C4', 'R5C4'),
  new X('R6C1', 'R7C1'),
  new X('R6C5', 'R7C5'),
  new X('R8C5', 'R9C5'),

  // Drawn V pairs (sum to 5), from the overlay edge marks.
  new V('R1C7', 'R2C7'),
  new V('R3C5', 'R3C6'),
  new V('R3C8', 'R3C9'),
  new V('R5C3', 'R6C3'),
  new V('R6C5', 'R6C6'),
  new V('R8C4', 'R8C5'),

  // Thermometer, bulb at R7C8 (the filled-circle underlay).
  new Thermo('R7C8', 'R8C9', 'R9C8'),
];
