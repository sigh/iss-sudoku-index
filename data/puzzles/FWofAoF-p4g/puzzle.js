// Title: Fishnet
// Author: TotallyNormalCat
// Video: https://www.youtube.com/watch?v=FWofAoF-p4g
// Source: https://app.crackingthecryptic.com/sudoku/f8DbBpbbj7

// Normal sudoku rules apply (Shape + AllDifferent are implicit in the
// sandbox baseline). Along thermometers, digits increase from the bulb end.
//
// Four bulbs (grey circle underlays) sit at R4C4, R4C6, R6C6, R6C4. Each
// bulb forks into two grey arms (colour #CFCFCF), so each bulb yields two
// root-to-leaf thermometers sharing that bulb as their first
// (increasing-from) cell. One drawn line entry has no waypoints and renders
// nothing -- not encoded. The two arms per bulb differ in length at R4C6
// and R6C4 (a 2-cell arm and a 3-cell arm) -- that asymmetry is drawn, not
// an omission.

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R2C2', 8),
  new Given('R6C9', 7),
  new Given('R8C2', 9),
  new Given('R9C1', 2),
  new Given('R9C9', 4),

  // Bulb R4C4 -> two arms.
  new Thermo('R4C4', 'R3C3', 'R2C3'),
  new Thermo('R4C4', 'R3C5', 'R2C5'),

  // Bulb R4C6 -> two arms.
  new Thermo('R4C6', 'R3C7', 'R2C7'),
  new Thermo('R4C6', 'R5C7'),

  // Bulb R6C6 -> two arms.
  new Thermo('R6C6', 'R7C5', 'R8C5'),
  new Thermo('R6C6', 'R7C7', 'R8C7'),

  // Bulb R6C4 -> two arms.
  new Thermo('R6C4', 'R5C3'),
  new Thermo('R6C4', 'R7C3', 'R8C3'),
];
