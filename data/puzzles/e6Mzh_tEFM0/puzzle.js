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
// Line paths: SudokuMaker stores only the polyline vertices, so a straight
// run's interior cells are implied. Nine of the thirteen lines have every
// vertex exactly on a cell centre. The other four (zipper #7, modular #4,
// #5, #6 below) end 0.14-0.28 of a cell short of the terminal cell's
// centre, having run a full 0.8 past the previous one -- that is a vertex
// placed in the terminal cell, not decorative overhang, so those cells are
// on the line. Reading them off drops two 3-cell modular windows and both
// outer pairs of a zipper, and leaves the R4C5-R4C4 line a 2-cell clue
// constraining nothing, which no setter draws.

return [
  new Shape('9x9'),

  // Zipper lines (lavender), in path order; Zipper takes the centre from the
  // middle of the list. Each one's centre carries a lavender mid-dot in the
  // payload, which ISS's own Zipper rendering (midMarker) also draws.
  new Zipper('R5C4', 'R5C5', 'R6C6', 'R5C7', 'R5C8'),
  new Zipper('R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3'),
  new Zipper('R7C7', 'R6C7', 'R6C8', 'R6C9', 'R7C9'),
  new Zipper('R9C1', 'R9C2', 'R9C3'),
  new Zipper('R1C2', 'R1C1', 'R2C1'),
  new Zipper('R3C2', 'R4C1', 'R4C2'),
  new Zipper('R1C5', 'R1C6', 'R2C7', 'R3C6', 'R3C5'),

  // Modular lines (darker/off-green), mod 3. Cells transcribed from the
  // drawn line paths.
  new Modular(3, 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6'),
  new Modular(3, 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5'),
  new Modular(3, 'R9C6', 'R9C7', 'R9C8', 'R9C9'),
  new Modular(3, 'R6C9', 'R5C9', 'R4C9', 'R3C9', 'R4C8'),
  new Modular(3, 'R3C5', 'R3C4', 'R2C3', 'R1C4', 'R1C5'),
  new Modular(3, 'R4C5', 'R4C4', 'R5C3'),
];
