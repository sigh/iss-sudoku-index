// Title: Think Outside the Box
// Author: Frippe
// Video: https://www.youtube.com/watch?v=L7JlTO588xM
// Source: https://sudokupad.app/kjlvev0m76

// Rules encoded here:
//   - Normal 9x9 Sudoku (rows, columns and boxes all-different), no givens.
//   - Row indexers, over the whole grid: "digits in row X indicate the row in
//     which the digit X appears in that column" -- the rules' own worked
//     example is "if r3c6 is a 8, r8c6 is a 3".
//
// Rules deliberately omitted -- every drawn clue:
//   - The three totalled cages (24, 45, 45) and the fourth, untotalled cage
//     fragment.
//   - The two arrows.
// The source draws only a 3x3 patch of cells and does not say where in the 9x9
// that patch sits, so no drawn clue has known cells; and each clue is cut off
// at the patch's edge and continues through cells that are not drawn, so no
// drawn clue has a known extent either. The accompanying description sets out
// the patch, the cage fragments and the arrow segments in full.

return [
  new Shape('9x9'),
  // One control cell per grid cell: the rule is stated for the entire grid.
  new Indexing('R', ...cellGraph('9x9').cells()),
];
