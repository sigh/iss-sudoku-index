// Title: Moles
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=-iYj9pKijqY
// Source: https://app.crackingthecryptic.com/sudoku/DFNBq8T6hj

// Normal sudoku rules apply (standard 3x3 box regions, no non-standard
// regions in the payload). Cages: digits do not repeat within a cage, and
// where a total is printed the cage's digits sum to it; three cages have no
// printed total and are encoded as all-different only. Thermometers: digits
// strictly increase starting at the bulb (first cell in each path below).
// The six grey circles in the payload sit exactly on the six thermometer
// bulb cells and draw no separate clue.

return [
  new Shape('9x9'),

  // Cages, top-left-to-cell-order as drawn; totals per the printed corner
  // clue, absent for three cages (all-different only).
  new Cage(34, 'R3C6', 'R2C6', 'R2C7', 'R1C7', 'R2C8', 'R2C9', 'R1C9'),
  new Cage(32, 'R5C7', 'R6C7', 'R5C8', 'R6C8', 'R6C9', 'R7C9', 'R8C9'),
  new AllDifferent('R5C6', 'R6C6', 'R7C6', 'R7C7', 'R7C8', 'R8C8', 'R8C7', 'R9C8', 'R9C9'),
  new Cage(36, 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R8C3', 'R8C2'),
  new AllDifferent('R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R3C2'),
  new AllDifferent('R3C3', 'R4C3', 'R4C2', 'R5C2', 'R5C3', 'R6C3', 'R6C2', 'R7C2', 'R7C3'),
  new Cage(25, 'R4C4', 'R5C4', 'R6C4', 'R6C5', 'R7C5'),

  // Thermometers, bulb-first per the drawn waypoint order.
  new Thermo('R4C2', 'R3C2'),
  new Thermo('R4C6', 'R3C6'),
  new Thermo('R4C7', 'R5C6', 'R6C6'),
  new Thermo('R9C8', 'R8C9', 'R7C9'),
  new Thermo('R9C7', 'R8C6', 'R7C5'),
  new Thermo('R9C1', 'R8C2', 'R8C3'),
];
