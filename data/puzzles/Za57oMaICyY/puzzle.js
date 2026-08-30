// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Za57oMaICyY
// Source: https://cracking-the-cryptic.web.app/sudoku/jn4QhQNbnL

// Rules (video description):
//   Sandwich sudoku: clues outside the grid give the sum of the digits
//   strictly between the 1 and the 9 in that row/column.
//   Also: every 2 in the grid must be immediately followed by a 9,
//   horizontally (to its right) or vertically (below it).
//
// Regions are the standard nine 3x3 boxes, so no custom region constraint
// is needed.
//
// Row sandwich clues, left-to-right lane, top to bottom (overlays #0-#8):
//   R1=24 R2=13 R3=7 R4=10 R5=12 R6=4 R7=25 R8=0 R9=2
// Column sandwich clues, only 4 of 9 columns are marked (overlays #9-#12):
//   C2=29 C5=2 C8=20 C9=20
const rowClues = [24, 13, 7, 10, 12, 4, 25, 0, 2];
const colClues = { 2: 29, 5: 2, 8: 20, 9: 20 };

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const sandwichRows = rowClues.map(
  (value, i) => Sandwich.fromCells(
    value, graph.ray(makeCellId(i + 1, 1), 0, 1), geometry));
const sandwichCols = Object.entries(colClues).map(
  ([col, value]) => Sandwich.fromCells(
    value, graph.ray(makeCellId(1, +col), 1, 0), geometry));

// "Every 2 must be immediately followed (right or down) by a 9": for each
// grid cell, either it does not hold a 2, or its right neighbour is 9, or
// its down neighbour is 9. step() returns null past an edge, so an edge
// cell simply drops the missing branch, and the bottom-right corner (no
// right or down neighbour) reduces to a plain "not 2" restriction.
const followedByNine = graph.cells().map(cell => {
  const branches = [new Given(cell, 1, 3, 4, 5, 6, 7, 8, 9)];
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  if (right) branches.push(new Given(right, 9));
  if (down) branches.push(new Given(down, 9));
  return branches.length === 1 ? branches[0] : new Or(branches);
});

return [
  new Shape('9x9'),
  // Givens (also instances of the 2-then-9 rule below).
  new Given('R1C6', 2),
  new Given('R1C7', 9),
  new Given('R6C1', 2),
  new Given('R7C1', 9),
  ...sandwichRows,
  ...sandwichCols,
  ...followedByNine,
];
