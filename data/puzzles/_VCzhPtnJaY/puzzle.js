// Title: The Sudoku Devil Strikes Back!
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=_VCzhPtnJaY
// Source: https://cracking-the-cryptic.web.app/sudoku/DhJD3bG9bF

// Normal sudoku rules (rows, columns, standard 3x3 boxes; boxes come from the
// default Shape('9x9') regions, which match the payload's own drawn regions).
//
// Both full corner-to-corner diagonals are drawn as a plain 2-waypoint stroke
// (start/end at the grid's own corners, not a per-cell path) -- the standard
// SudokuPad idiom for a decorative diagonal highlight rather than a computed
// line constraint -- with no other marks on them. Read as classic X-Sudoku:
// each diagonal is all-different.
const diagonals = [
  new Diagonal(1),   // R9C1-R1C9
  new Diagonal(-1),  // R1C1-R9C9
];

// Five cages print a total (killer cages: all-different + sum), transcribed
// from the payload's `cages` array.
const totaledCages = [
  new Cage(25, 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'), // plus-pentomino
  new Cage(15, 'R3C4', 'R3C5', 'R3C6'),
  new Cage(10, 'R6C8', 'R7C8'),
  new Cage(14, 'R8C6', 'R8C7'),
  new Cage(8, 'R7C4', 'R8C4'),
];

// The remaining cage outlines print no total but are still real cages
// (all-different only) -- standard cage semantics for a no-total outline.
// `Nc` carries no colour fill. `Pa`/`Pb`, `Ya`/`Yb`, `Ga`/`Gb`/`Gc` each carry
// one of three background colours (purple, yellowgreen, grey respectively),
// matching the three colour swatches read below.
const noTotalCages = [
  new Cage(0, 'R6C1', 'R7C1', 'R7C2', 'R7C3'), // Nc
  new Cage(0, 'R2C1', 'R3C1', 'R3C2'),         // Pa (purple)
  new Cage(0, 'R2C9', 'R3C8', 'R3C9'),         // Pb (purple)
  new Cage(0, 'R5C7', 'R5C8', 'R5C9'),         // Ya (yellowgreen)
  new Cage(0, 'R5C1', 'R5C2'),                 // Yb (yellowgreen)
  new Cage(0, 'R1C2', 'R1C3', 'R2C3'),         // Ga (grey)
  new Cage(0, 'R4C3', 'R5C3', 'R6C3'),         // Gb (grey)
  new Cage(0, 'R8C3', 'R9C2', 'R9C3'),         // Gc (grey)
];

// Below the grid, three small square overlays are plain colour swatches
// (purple/yellowgreen/grey, no text) under columns 1/4/7, matching the three
// cage-fill colours above; the other six margin cells under columns 2,3 /
// 5,6 / 8,9 spell out "= 17;", "= 18;", "= 31" -- a caption typed into the
// outside-clue row rather than a little-killer diagonal arrow (no direction
// marker accompanies these cells). Read as: each colour's combined cage
// cells (both/all same-coloured cage outlines) sum to the printed total.
// Repeats are allowed across the combined group beyond what the component
// cages above already forbid, so `Sum`, not `Cage`.
const colourGroupSums = [
  new Sum(17, 'R2C1', 'R3C1', 'R3C2', 'R2C9', 'R3C8', 'R3C9'), // purple: Pa + Pb
  new Sum(18, 'R5C7', 'R5C8', 'R5C9', 'R5C1', 'R5C2'),         // yellowgreen: Ya + Yb
  new Sum(31, 'R1C2', 'R1C3', 'R2C3', 'R4C3', 'R5C3', 'R6C3', 'R8C3', 'R9C2', 'R9C3'), // grey: Ga+Gb+Gc
];

return [
  new Shape('9x9'),
  ...diagonals,
  ...totaledCages,
  ...noTotalCages,
  ...colourGroupSums,
];
