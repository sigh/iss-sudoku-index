// Title: Thermo Sudoku
// Author: No-Feet McGee
// Video: https://www.youtube.com/watch?v=CnLNMCD4Rt0
// Source: https://app.crackingthecryptic.com/sudoku/qPb9tF7HRd

// Normal sudoku rules apply (standard rows/columns/3x3 boxes; no jigsaw).
// Along thermometers, digits increase from the bulb end. Eight
// thermometers are drawn (grey lines), each bulb marked by a matching grey
// circle underlay at the line's first waypoint. Two of the eight bulbs
// carry a printed given (3), from the payload's clue cells.

// Given digits, cell taken from the payload's clue cells.
const givens = [
  new Given('R2C7', 3),
  new Given('R9C8', 3),
];

// Thermo(...cells): first cell is the bulb; values strictly increase from
// there. Cell order taken from each line's drawn waypoints.
const thermos = [
  new Thermo('R2C1', 'R1C2', 'R2C2', 'R1C3', 'R2C3', 'R1C4'),
  new Thermo('R2C4', 'R1C5', 'R2C5', 'R1C6', 'R2C6', 'R1C7'),
  new Thermo('R2C7', 'R1C8', 'R2C8'),
  new Thermo('R4C3', 'R4C2', 'R5C2', 'R5C3', 'R5C4', 'R4C4'),
  new Thermo('R7C5', 'R7C6', 'R6C6', 'R5C5'),
  new Thermo('R4C7', 'R4C6', 'R5C6', 'R5C7', 'R5C8', 'R4C8'),
  new Thermo('R8C3', 'R9C3', 'R9C4', 'R9C5', 'R9C6'),
  new Thermo('R9C8', 'R8C8', 'R8C9', 'R7C9'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...thermos,
];
