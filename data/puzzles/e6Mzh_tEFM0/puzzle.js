// Title: Frankenstein
// Author: zetamath
// Video: https://www.youtube.com/watch?v=e6Mzh_tEFM0
// Source: https://sudokupad.app/zetamath/frankenstein
//
// Normal sudoku rules apply (standard rows/columns/3x3 boxes; the payload's
// drawn regions are exactly the default boxes, so no explicit Regions is
// needed).
//
// Lavender lines are zipper lines: each pair of digits equidistant from the
// centre digit sums to the centre digit. All seven are odd length, so each
// has a single centre cell. The small lavender circle on each zipper's
// centre cell is a rendering of that same centre, not a separate clue.
//
// Darker/off-green lines are modular lines: every set of three sequential
// digits along the line must contain one from {1,4,7}, one from {2,5,8},
// and one from {3,6,9}.
//
// One modular line (the short one from R4C5 to R4C4) is only two cells
// long, so it has no complete 3-cell window and therefore imposes no
// constraint at all; it is still encoded (as a no-op Modular(3,...)) so the
// script draws every line the puzzle draws.

return [
  new Shape('9x9'),

  // Zipper lines (lavender). Cells transcribed from the drawn line paths
  // (centre cell first), confirmed against the matching lavender circle
  // marking each one's centre.
  new Zipper('R5C4', 'R5C5', 'R6C6', 'R5C7', 'R5C8'),
  new Zipper('R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3'),
  new Zipper('R7C7', 'R6C7', 'R6C8', 'R6C9', 'R7C9'),
  new Zipper('R9C1', 'R9C2', 'R9C3'),
  new Zipper('R1C2', 'R1C1', 'R2C1'),
  new Zipper('R3C2', 'R4C1', 'R4C2'),
  new Zipper('R1C6', 'R2C7', 'R3C6'),

  // Modular lines (darker/off-green), mod 3. Cells transcribed from the
  // drawn line paths.
  new Modular(3, 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6'),
  new Modular(3, 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5'),
  new Modular(3, 'R9C6', 'R9C7', 'R9C8', 'R9C9'),
  // This one is a bent line whose drawn waypoints are not all cell-centred,
  // so the path was hand-derived by segment arc-length occupancy (a cell
  // counts once its share of a segment's drawn length reaches half a
  // cell-width). The stroke's starting overshoot into R6C9 (~0.3
  // cell-widths) falls short of that, so R6C9 is not part of the line;
  // the line runs R5C9-R4C9-R3C9 then bends diagonally into R4C8.
  new Modular(3, 'R5C9', 'R4C9', 'R3C9', 'R4C8'),
  new Modular(3, 'R3C4', 'R2C3', 'R1C4'),
  // Only 2 cells by the same occupancy rule (a third point, ~0.42
  // cell-widths into R5C3, falls short of the threshold), so this is a
  // genuine no-op -- Modular needs 3 cells for any window to exist.
  new Modular(3, 'R4C5', 'R4C4'),
];
