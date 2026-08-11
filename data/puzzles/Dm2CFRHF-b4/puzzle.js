// Title: The Skyscraper Miracle
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=Dm2CFRHF-b4
// Source: https://app.crackingthecryptic.com/sudoku/3M6L2364h2

// Normal sudoku rules (default 9x9 Shape: rows, columns and the nine 3x3
// boxes below are all-different). No given digits.
//
// Two auxiliary digit lanes sit outside the play grid: a purple line runs
// the whole left edge, and a set of pairwise marks sit against the right
// edge. `VL1..VL9` model the left lane, one auxiliary digit per row.
// `VR1..VR7` model the right lane's cells for rows 2-8, the only rows
// carrying a drawn mark there (VR{n} stands for sudoku row n+1). Each Var
// takes the grid's own 1-9 range.
//
// Purple line ("a non-repeating set of consecutive digits, in any order"):
// with exactly 9 cells over a 9-digit alphabet, all-different already forces
// the full 1-9 permutation, which is the only 9-element consecutive set that
// fits -- no separate "consecutive" gadget is needed.
//
// Right-edge marks pair the row's own last grid column (C9) with that row's
// auxiliary cell: an X is "sum to 10", a v/V is "sum to 5", a white dot is
// "consecutive", a black dot is "1:2 ratio". The grey line is drawn twice as
// two disconnected 2-cell runs; "the gray line is a palindrome" reduces, for
// a 2-cell run, to equality. The native X/V/WhiteDot/BlackDot classes
// require grid-adjacent cells and reject an off-grid Var partner, so each is
// rebuilt here with the generic Sum/Pair/SameValues equivalent.
//
// Omitted: the skyscraper visible-count rule (no clue value or locating
// property is drawn or stated for any lane) and the thermometer rule (no
// thermometer geometry is drawn anywhere in the payload).

const left = new Var('L', 'left-edge auxiliary digits, one per row (purple line)', 9);
const right = new Var('R', 'right-edge auxiliary digits, rows 2-8 only', 7);
const rightEdge = row => right.cell(row - 1); // row 2 -> VR1 ... row 8 -> VR7

const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);
const ratioKey = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, 9);

return [
  new Shape('9x9'),
  left,
  right,

  new AllDifferent(...left.cells()),

  // X mark, row 7: R7C9 + right-edge(row 7) = 10.
  new Sum(10, 'R7C9', rightEdge(7)),
  // v mark, row 6: R6C9 + right-edge(row 6) = 5.
  new Sum(5, 'R6C9', rightEdge(6)),
  // White dot, row 3: R3C9 and right-edge(row 3) are consecutive.
  new Pair(consecutiveKey, 'white dot', 'R3C9', rightEdge(3)),
  // Black dot, row 2: R2C9 and right-edge(row 2) are in 1:2 ratio.
  new Pair(ratioKey, 'black dot', 'R2C9', rightEdge(2)),
  // Grey line, run 1 (2 cells): R8C9 and right-edge(row 8).
  new SameValues(2, 'R8C9', rightEdge(8)),
  // Grey line, run 2 (2 cells, both off-grid): right-edge(row 4) and
  // right-edge(row 5).
  new SameValues(2, rightEdge(4), rightEdge(5)),
];
