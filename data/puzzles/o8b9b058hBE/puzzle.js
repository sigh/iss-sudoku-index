// Title: NYE 23
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=o8b9b058hBE
// Source: https://app.crackingthecryptic.com/sudoku/7Q6dBrG9fN

// Normal sudoku rules (rows/cols/boxes). Standard 3x3 boxes, no givens.
//
// Three outside diagonal-sum clues, each "23", repeats allowed along the
// diagonal (LittleKiller's own semantics).
//
// Three thermometer bulbs, each with multiple arms ("end(s)" in the rules
// text). Two of the three bulbs have a shared stem before their arms split;
// each drawn stroke (bulb-to-branch or branch-to-end) is its own Thermo,
// matching the puzzle's own line segments -- Thermo's strict increase is
// transitive, so chaining the shared-stem segment with each branch segment
// enforces "increasing from the bulb to every end" exactly as if the full
// bulb-to-end path were spelled out in one call.
//
// Four white dots (consecutive, adjacent cells). Rules note not all
// possible dots are shown, so no negative ("no dot => not consecutive") is
// encoded.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Diagonal sum clues, all down-right (+1 row, +1 col per cell).
  LittleKiller.fromCells(23, graph.ray('R1C6', 1, 1), geometry),
  LittleKiller.fromCells(23, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(23, graph.ray('R6C1', 1, 1), geometry),

  // Thermometers. Bulb R3C3, two arms.
  new Thermo('R3C3', 'R2C3', 'R1C3', 'R2C2', 'R3C1'),
  new Thermo('R3C3', 'R4C3', 'R3C4', 'R2C5'),

  // Bulb R6C4: shared stem R6C4-R5C5-R4C6, then splits into two arms.
  new Thermo('R6C4', 'R5C5', 'R4C6', 'R3C6', 'R2C6'),
  new Thermo('R6C4', 'R5C5', 'R4C6', 'R4C7', 'R4C8'),

  // Bulb R7C5: one arm direct from the bulb, plus a shared stem
  // R7C5-R6C6 that then splits into two more arms.
  new Thermo('R7C5', 'R8C6', 'R9C7'),
  new Thermo('R7C5', 'R6C6', 'R5C7', 'R6C8', 'R7C9'),
  new Thermo('R6C6', 'R7C7', 'R8C8'),

  // White dots (consecutive), adjacent cells only.
  new WhiteDot('R1C4', 'R1C5'),
  new WhiteDot('R7C4', 'R8C4'),
  new WhiteDot('R9C2', 'R9C3'),
  new WhiteDot('R7C1', 'R8C1'),
];
