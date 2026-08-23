// Title: Biscuit
// Author: Jakhob
// Video: https://www.youtube.com/watch?v=EfzQGgl4ozI
// Source: https://app.crackingthecryptic.com/sudoku/7fgN2Pmp3h

// Standard 9x9 sudoku (rows/columns/3x3 boxes).
// Cage: sum, distinct -> Cage.
// Grey circle / grey square: odd/even candidate restriction -> Given with the
// allowed value set (no dedicated Odd/Even class).
// Thermometers: strictly increasing from the bulb -> Thermo.
// The R4C5 thermometer is drawn as two strokes sharing cell R4C4: one stroke
// carries the only bulb mark (R4C5) and the other (R4C4-R5C4) has no bulb of
// its own, so it is a second arm of the same thermometer rather than a
// separate one. Encoded per drawn segment, both starting from the bulb side.
// White dot: consecutive -> WhiteDot. Black dot: ratio 1:2 -> BlackDot.
// "Not all possible dots are given" means undrawn adjacent pairs carry no
// constraint; only the drawn dots are encoded.

return [
  new Shape('9x9'),

  new Given('R1C1', 2),
  new Given('R4C3', 1),
  new Given('R9C5', 4),

  new Cage(15, 'R9C6', 'R9C7'),

  new Thermo('R2C8', 'R3C8', 'R3C7', 'R2C7', 'R1C7', 'R1C8'),
  new Thermo('R4C5', 'R4C4', 'R3C4', 'R3C5'),
  new Thermo('R4C4', 'R5C4'),
  new Thermo('R4C1', 'R4C2', 'R5C1', 'R5C2'),
  new Thermo('R6C1', 'R7C2', 'R6C3', 'R7C4', 'R6C5'),

  // Odd cells (grey circle).
  new Given('R4C8', 1, 3, 5, 7, 9),
  new Given('R6C7', 1, 3, 5, 7, 9),
  new Given('R6C9', 1, 3, 5, 7, 9),

  // Even cells (grey square).
  new Given('R5C1', 2, 4, 6, 8),
  new Given('R5C3', 2, 4, 6, 8),

  new WhiteDot('R7C6', 'R7C7'),
  new WhiteDot('R7C6', 'R8C6'),
  new WhiteDot('R1C6', 'R2C6'),
  new WhiteDot('R5C4', 'R5C5'),
  new WhiteDot('R5C5', 'R5C6'),

  new BlackDot('R1C4', 'R2C4'),
  new BlackDot('R1C5', 'R2C5'),
  new BlackDot('R8C2', 'R8C3'),
  new BlackDot('R8C7', 'R8C8'),
];
