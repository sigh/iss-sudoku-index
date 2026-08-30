// Title: Thermo Sudoku
// Author: Kurt Hugo Schneider
// Video: https://www.youtube.com/watch?v=kxcFKeyER0o
// Source: https://cracking-the-cryptic.web.app/sudoku/BjDnndmJF7

// Normal sudoku rules apply (standard rows/columns/3x3 boxes; no jigsaw).
// Along thermometers, digits increase from the bulb end. The payload carries
// no rules text; this is read from the drawn geometry -- grey lines (thickness
// 8) each ending in a matching grey, red-bordered rounded overlay at one end,
// the standard bulb rendering for this puzzle type.

// Given digit, cell taken from the payload's clue cells. It sits on a
// thermometer bulb (the first cell of the first Thermo below).
const givens = [
  new Given('R9C9', 5),
];

// Thermo(...cells): first cell is the bulb; values strictly increase from
// there. Cell order taken from each line's drawn waypoints, except the sixth
// entry below (drawn waypoints R3C7-R4C7-R4C6-R4C5-R4C4-R4C3, no bulb overlay
// of its own): its direction is reversed from the drawn order, bulb at R4C3.
// The drawn bulb overlays at R4C3 and R3C7 belong to the neighbouring
// thermometers (4th and 7th below); reading this segment bulb-first at R3C7
// instead would force R4C3 to be both <=2 (low end of the 8-cell 4th
// thermometer) and >=6 (high end of a 6-cell chain from R3C7), which no digit
// 1-9 satisfies. Bulb-first at R4C3 has no such conflict.
const thermos = [
  new Thermo('R9C9', 'R8C9', 'R7C9', 'R6C9'),
  new Thermo('R7C7', 'R7C6', 'R6C6', 'R6C7', 'R6C8', 'R7C8', 'R8C8', 'R8C7'),
  new Thermo('R6C3', 'R7C3', 'R7C4', 'R7C5', 'R6C5'),
  new Thermo('R4C3', 'R5C3', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R8C3', 'R8C4'),
  new Thermo('R3C1', 'R3C2', 'R2C2'),
  new Thermo('R2C2', 'R2C3', 'R1C3', 'R1C4', 'R1C5'),
  new Thermo('R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R3C7'),
  new Thermo('R3C7', 'R3C6', 'R2C6'),
  new Thermo('R3C8', 'R2C8', 'R1C8', 'R1C9'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...thermos,
];
