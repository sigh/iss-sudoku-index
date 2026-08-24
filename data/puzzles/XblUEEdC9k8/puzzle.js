// Title: Wave Particles
// Author: TotallyNormalCat
// Video: https://www.youtube.com/watch?v=XblUEEdC9k8
// Source: https://app.crackingthecryptic.com/sudoku/gJp63dMb73

// Standard 9x9 sudoku (rows/columns/3x3 boxes). One given digit. Killer
// cages: digits in a cage do not repeat and sum to the cage's total. Arrows:
// arm cells sum to the bulb cell's digit (bulb listed first). The white
// circle underlay at each bulb cell (R2C5, R5C5, R8C5) coincides exactly
// with the arrow-bulb cells already implied by Arrow -- decoration for two
// overlapping bulbs, not a separate clue -- so it is not separately encoded.

return [
  new Shape('9x9'),

  new Given('R2C1', 5),

  // Killer cages (two cells each, no repeats within a cage).
  new Cage(11, 'R2C8', 'R2C9'),
  new Cage(12, 'R5C3', 'R6C3'),
  new Cage(11, 'R7C4', 'R7C5'),
  new Cage(11, 'R8C1', 'R8C2'),
  new Cage(11, 'R8C8', 'R8C9'),

  // Arrows: bulb cell first, then the bent three-cell arm.
  new Arrow('R2C5', 'R1C6', 'R1C7', 'R1C8'),
  new Arrow('R2C5', 'R3C4', 'R3C3', 'R3C2'),
  new Arrow('R5C5', 'R4C6', 'R4C7', 'R4C8'),
  new Arrow('R5C5', 'R6C4', 'R6C3', 'R6C2'),
  new Arrow('R8C5', 'R9C4', 'R9C3', 'R9C2'),
  new Arrow('R8C5', 'R7C6', 'R7C7', 'R7C8'),
];
