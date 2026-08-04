// Title: A Mid Sum-mer's Christmas
// Author: Charlie Pugh
// Video: https://www.youtube.com/watch?v=jOA_rZFWPls
// Source: https://app.crackingthecryptic.com/sudoku/Nmg943btqh

// Normal sudoku rules apply.
//
// Anti-king: cells a king's move apart cannot repeat a digit.
//
// Arrows (grey): digits along the arrow sum to the digit in the circled bulb
// cell.
//
// Green line, "same box total": the rules give this puzzle's own worked
// example -- r4c3+r5c2+r5c3+r6c3 = r3c4+r2c5+r3c6 -- equating the box-4 total
// with the box-2 total, so "sum to the same number in each 3x3 box" means one
// shared total across every box the line visits, not just a per-box constant.
// The green marks are drawn as three separate stroke entries that meet at
// shared cells (R5C4, R5C6, R8C5), and the example mixes cells from two of
// those entries into one box total, so all three are read as one connected
// green line for this bookkeeping. Cells are grouped by which 3x3 box they
// fall in (a box visited more than once combines all its cells into one
// total, per "different visits ... count towards the same total for that
// box"); boxes 1 and 3 are never visited and get no segment.
//
// Stars: every star cell must hold digit N, and every star-marked edge's two
// cells must sum to N, for one shared N (rules: "Stars ... represent a single
// digit N"). N has no drawn cell, so it is a Var; a cell star is SameValues
// against it, an edge star is EqualSum against it (its 1-cell segment sums to
// N). Star positions (cell vs. edge) are from the overlay coordinates: an
// edge-centred overlay marks the two cells it separates, a cell-centred
// overlay marks that one cell.

const vN = new Var('N', 'star digit N', 1);

return [
  new Shape('9x9'),
  new Given('R5C5', 1),

  new AntiKing(),

  // Arrows (grey), bulb cell first.
  new Arrow('R5C1', 'R4C2', 'R3C2', 'R3C3'),
  new Arrow('R5C9', 'R4C8', 'R3C8', 'R3C7'),

  // Green line box totals, one segment per visited box (box index in rules'
  // row-major order: box2, box4, box5, box6, box7, box8, box9).
  new EqualSum(
    ['R2C5', 'R3C4', 'R3C6'],
    ['R4C3', 'R5C2', 'R5C3', 'R6C3'],
    ['R5C4', 'R5C5', 'R5C6'],
    ['R5C7', 'R5C8', 'R4C7', 'R6C7'],
    ['R7C2', 'R8C1', 'R8C2', 'R8C3'],
    ['R8C4', 'R8C5', 'R8C6', 'R9C5'],
    ['R8C7', 'R8C8', 'R8C9', 'R7C8'],
  ),

  // Star digit N.
  vN,
  new EqualSum(['R1C5', 'R2C5'], [vN.cell(1)]), // edge star R1C5/R2C5
  new SameValues(2, 'R4C5', vN.cell(1)),         // cell star R4C5
  new EqualSum(['R6C4', 'R6C5'], [vN.cell(1)]), // edge star R6C4/R6C5
  new SameValues(2, 'R7C7', vN.cell(1)),         // cell star R7C7
  new SameValues(2, 'R8C4', vN.cell(1)),         // cell star R8C4
];
