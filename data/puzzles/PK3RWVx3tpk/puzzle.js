// Title: Losing My Religion
// Author: matyas
// Video: https://www.youtube.com/watch?v=PK3RWVx3tpk
// Source: https://tinyurl.com/39dnrsv5

// Standard 9x9 sudoku (rows/columns/3x3 boxes), no givens.
// Arrows: arm cells sum to the circle digit (bulb cell listed first).
// Corner rule ("3 in the corner"): at least one of the four pink corner
// cells holds a 3.
// Spotlight cages (yellow): no repeats within the cage, and each cage must
// contain a 3.

return [
  new Shape('9x9'),

  // Arrows: circle (bulb) first, then arm cells.
  new Arrow('R1C1', 'R1C2', 'R2C3'),
  new Arrow('R1C9', 'R1C8', 'R2C7'),
  new Arrow('R3C8', 'R3C7', 'R2C6'),
  new Arrow('R3C2', 'R3C3', 'R2C4'),
  // Double-armed arrow: one circle (R3C5), two independent arms, each
  // summing to R3C5's digit -- the source entry lists two separate `lines`
  // both starting at the R3C5 bulb.
  new Arrow('R3C5', 'R4C4', 'R5C4'),
  new Arrow('R3C5', 'R4C6', 'R5C6'),
  new Arrow('R5C1', 'R4C2', 'R4C3'),
  new Arrow('R5C9', 'R4C8', 'R4C7'),
  new Arrow('R7C5', 'R7C4', 'R8C4'),
  new Arrow('R9C5', 'R9C6', 'R8C6', 'R7C6'),
  new Arrow('R9C9', 'R9C8', 'R9C7'),
  new Arrow('R9C1', 'R9C2', 'R9C3'),

  // Spotlight cages: digits cannot repeat, and each cage must contain a 3.
  // Cage cells from the source's killercage array (no totals given).
  new AllDifferent('R3C2', 'R3C3', 'R4C2', 'R4C3', 'R4C4', 'R5C3'),
  new ContainExact('3', 'R3C2', 'R3C3', 'R4C2', 'R4C3', 'R4C4', 'R5C3'),
  new AllDifferent('R4C7', 'R4C8', 'R5C7', 'R5C8'),
  new ContainExact('3', 'R4C7', 'R4C8', 'R5C7', 'R5C8'),
  new AllDifferent('R8C4', 'R8C5', 'R9C4', 'R9C5'),
  new ContainExact('3', 'R8C4', 'R8C5', 'R9C4', 'R9C5'),

  // At least one of the four pink corner cells holds a 3.
  new Or([
    new Given('R1C1', 3),
    new Given('R1C9', 3),
    new Given('R9C1', 3),
    new Given('R9C9', 3),
  ]),
];
