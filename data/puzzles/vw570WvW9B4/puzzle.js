// Title: Forty Six & No 2
// Author: TotallyNormalCat
// Video: https://www.youtube.com/watch?v=vw570WvW9B4
// Source: https://app.crackingthecryptic.com/sudoku/qJTLmTRTFm

// Normal sudoku rules apply (standard rows/columns/3x3 boxes; no jigsaw).
// Along thermometers, digits increase from the bulb end. Eleven
// thermometers are drawn (grey lines), each bulb marked by a matching grey
// circle underlay at the line's first waypoint; two thermometers (the R5C5
// pair) share one bulb cell.
// The payload carries no rules text at all; this reading rests on format
// convention (a solid-filled circle underlay marks a thermometer bulb, not
// an arrow bulb) plus the -63eV8B8-Xw precedent, which draws thermometers
// with identical styling and states the rule.

const givens = [
  new Given('R1C1', 4),
  new Given('R9C9', 6),
];

// Thermo(...cells): first cell is the bulb; values strictly increase from
// there. Paths interpolated from the drawn waypoints (grid cell centres at
// half-integers); each path's first cell matches a drawn grey circle
// underlay (the bulb).
const thermos = [
  new Thermo('R2C4', 'R1C3', 'R1C2'),
  new Thermo('R2C6', 'R1C7', 'R1C8', 'R1C9'),
  new Thermo('R2C7', 'R3C7', 'R4C8', 'R4C9'),
  new Thermo('R4C5', 'R4C6'),
  new Thermo('R5C5', 'R4C4', 'R3C5'),
  new Thermo('R5C5', 'R6C6', 'R5C7'),
  new Thermo('R4C2', 'R3C3', 'R2C3'),
  new Thermo('R6C2', 'R7C3', 'R8C3'),
  new Thermo('R9C1', 'R9C2', 'R9C3', 'R8C4'),
  new Thermo('R8C7', 'R7C7', 'R6C8', 'R6C9'),
  new Thermo('R9C8', 'R9C7', 'R8C6'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...thermos,
];
