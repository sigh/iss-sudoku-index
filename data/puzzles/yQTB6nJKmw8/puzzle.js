// Title: Bees!
// Author: Lucy Audrin
// Video: https://www.youtube.com/watch?v=yQTB6nJKmw8
// Source: https://app.crackingthecryptic.com/sudoku/r8HJJ2mHTh

// Normal sudoku (default row/col/box). One given. Thermometers strictly
// increase from the bulb; several bulbs fork into multiple arms that each
// increase independently (the source's "end(s)" wording and the drawn art,
// where three/two separate line entries share one bulb cell). Black dots are
// a 1:2 ratio on the marked pair only -- the source states not all dots are
// given, so no global/negative Kropki closure is added.

return [
  new Shape('9x9'),

  new Given('R5C5', 8),

  // Two-cell thermometers, bulb first.
  new Thermo('R1C3', 'R1C4'),
  new Thermo('R1C7', 'R1C6'),

  // Six-cell single-arm thermometers, bulb first.
  new Thermo('R5C4', 'R4C3', 'R4C2', 'R5C1', 'R6C2', 'R6C3'),
  new Thermo('R5C6', 'R4C7', 'R4C8', 'R5C9', 'R6C8', 'R6C7'),

  // Forked thermometer, bulb R4C5, two one-cell arms.
  new Thermo('R4C5', 'R3C4'),
  new Thermo('R4C5', 'R3C6'),

  // Forked thermometer, bulb R8C5, two two-cell arms.
  new Thermo('R8C5', 'R7C4', 'R6C4'),
  new Thermo('R8C5', 'R7C6', 'R6C6'),

  // Six-armed star thermometer, bulb R8C2: three drawn line entries
  // (R9C2-R8C2-R7C2, R7C1-R8C2-R7C3, R8C1-R8C2-R8C3) all pass through the
  // bulb cell, giving six one-cell arms out of it.
  new Thermo('R8C2', 'R7C2'),
  new Thermo('R8C2', 'R9C2'),
  new Thermo('R8C2', 'R7C1'),
  new Thermo('R8C2', 'R7C3'),
  new Thermo('R8C2', 'R8C1'),
  new Thermo('R8C2', 'R8C3'),

  // Six-armed star thermometer, bulb R8C8: mirror of the R8C2 star
  // (R8C7-R8C8-R8C9, R7C7-R8C8-R7C9, R7C8-R8C8-R9C8).
  new Thermo('R8C8', 'R8C7'),
  new Thermo('R8C8', 'R8C9'),
  new Thermo('R8C8', 'R7C7'),
  new Thermo('R8C8', 'R7C9'),
  new Thermo('R8C8', 'R7C8'),
  new Thermo('R8C8', 'R9C8'),

  // Black dots (1:2 ratio, adjacent cells only). R7C2-R8C2 and R7C8-R8C8
  // also lie on the star thermometers' up-arms above.
  new BlackDot('R3C1', 'R3C2'),
  new BlackDot('R4C3', 'R4C4'),
  new BlackDot('R7C2', 'R8C2'),
  new BlackDot('R7C8', 'R8C8'),
  new BlackDot('R3C8', 'R3C9'),
];
