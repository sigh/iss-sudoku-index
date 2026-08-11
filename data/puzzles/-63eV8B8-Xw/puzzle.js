// Title: Exactly Eighty
// Author: krangune
// Video: https://www.youtube.com/watch?v=-63eV8B8-Xw
// Source: https://app.crackingthecryptic.com/sudoku/j2q9fNRTDf

// Normal sudoku rules apply (standard rows/columns/3x3 boxes; no jigsaw).
// In cages, digits sum to the small clue in the cage's top-left corner (if
// given); digits cannot repeat within a cage. Four 2x2 corner cages each
// carry a printed total (21, 20, 18, 21); a 3-cell cage carries a printed
// total (15). Four 9-cell irregular cages carry no printed total, so only
// the no-repeat requirement applies (Cage with an empty sum) -- with 9
// cells and 9 possible digits this still forces each to hold every digit
// 1-9 exactly once.
// Along thermometers, digits increase from the bulb end. Eight
// thermometers are drawn (grey lines), each bulb marked by a matching grey
// circle underlay at the line's first waypoint.

// Total cages, cell order taken from the drawn cage cell lists.
const totalCages = [
  new Cage(21, 'R1C1', 'R2C1', 'R2C2', 'R1C2'),
  new Cage(20, 'R1C8', 'R2C8', 'R2C9', 'R1C9'),
  new Cage(18, 'R8C1', 'R9C1', 'R9C2', 'R8C2'),
  new Cage(21, 'R8C8', 'R9C8', 'R9C9', 'R8C9'),
  new Cage(15, 'R5C4', 'R6C4', 'R6C5'),
];

// No-total cages (all-different only), cell order taken from the drawn cage
// cell lists.
const noTotalCages = [
  new Cage('', 'R1C3', 'R2C3', 'R2C4', 'R1C4', 'R3C3', 'R3C2', 'R3C1', 'R4C1', 'R4C2'),
  new Cage('', 'R1C6', 'R2C6', 'R2C7', 'R1C7', 'R3C7', 'R3C8', 'R4C8', 'R4C9', 'R3C9'),
  new Cage('', 'R7C9', 'R6C9', 'R6C8', 'R7C8', 'R7C7', 'R8C7', 'R8C6', 'R9C6', 'R9C7'),
  new Cage('', 'R7C1', 'R6C1', 'R6C2', 'R7C2', 'R7C3', 'R8C3', 'R9C3', 'R9C4', 'R8C4'),
];

// Thermo(...cells): first cell is the bulb; values strictly increase from
// there. Paths interpolated from the drawn waypoints (grid cell centres at
// half-integers); each path's first cell matches a drawn grey circle
// underlay (the bulb).
const thermos = [
  new Thermo('R1C1', 'R2C2'),
  new Thermo('R1C4', 'R2C4', 'R3C4', 'R4C3', 'R4C2', 'R4C1'),
  new Thermo('R1C7', 'R2C7', 'R3C7'),
  new Thermo('R2C9', 'R1C8'),
  new Thermo('R8C8', 'R9C9'),
  new Thermo('R9C2', 'R9C3', 'R8C4'),
  new Thermo('R9C6', 'R8C6', 'R7C7', 'R6C8', 'R6C9'),
  new Thermo('R4C6', 'R5C5', 'R6C4'),
];

return [
  new Shape('9x9'),
  ...totalCages,
  ...noTotalCages,
  ...thermos,
];
