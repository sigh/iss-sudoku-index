// Title: Russian Dolls
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=3o3X36v6vg4
// Source: https://sudokupad.app/8nPBD7G8JG

// Rules: a Latin Square is an NxN grid (N>1) containing only digits 1-N with
// no repeat in a row or column. This 8x8 grid contains exactly three such
// squares, one within another within another (omitted below -- see notes).
// Cells a knight's move apart may not repeat a digit. A white dot between two
// cells means consecutive digits; a black dot means one digit is double the
// other.
//
// No box regions are drawn (the payload's sole "region" spans the whole
// board, SudokuPad's stand-in for "no boxes"), so only rows and columns are
// constrained by default -- matching the outer N=8 Latin Square (the whole
// grid, digits 1-8) directly.
//
// Omitted: which two smaller squares (size and position) are the other two
// Latin Squares. Nothing drawn marks them -- no cage, shading, or region --
// and the rules name no sizes, so this is a deduction the solver makes, not a
// fact this script can read off the payload.

return [
  new Shape('8x8'),
  new NoBoxes(),
  new AntiKnight(),

  // Kropki dots (edge overlays: white fill = consecutive, black fill =
  // ratio 1:2; positions transcribed from the drawn overlay marks).
  new WhiteDot('R6C7', 'R6C8'),
  new WhiteDot('R8C4', 'R8C5'),
  new BlackDot('R4C1', 'R5C1'),
  new BlackDot('R4C5', 'R5C5'),
  new BlackDot('R1C4', 'R1C5'),
  new BlackDot('R1C7', 'R1C8'),
];
