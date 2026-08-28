// Title: Good Enough for our Book?
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Us-AhQkR7No
// Source: https://cracking-the-cryptic.web.app/sudoku/3GR7nmrhJQ

// Normal sudoku rules apply (standard rows/cols/boxes; no jigsaw).
//
// Rule text: "In each row the digit in the grey cell appears on the arrow
// in the next row. The digit to the right of the grey cell shows how many
// cells in the direction of the arrow this arrow cell must add to reach
// its own total."
//
// Read as: for each row r = 1..8, grey cell G = R(r)C(r);
// the drawn arrow cell A sits in row r+1. A's digit equals G's digit, and
// A's digit also equals the sum of N cells starting next to A and running
// in A's drawn direction, where N is the digit immediately right of G (at
// R(r)C(r+1)). N is not asserted directly -- it is left free over every
// length the drawn direction admits before running off the grid, encoded
// as an Or of (N == k) paired with the length-k Arrow it forces.

const grid = new Shape('9x9');

// Grey cells: one 1x1 grey fill per row, centred at R(r)C(r) for r = 1..8
// (R9C9 carries no grey fill).
const greyCells = [1, 2, 3, 4, 5, 6, 7, 8].map(r => makeCellId(r, r));

// Arrow cells: each a short two-point mark drawn inside a single cell (not
// a line across cells); dr/dc is that mark's row/col step direction. One
// arrow per row 2..9, index i here holding the arrow for row i+2 -- i.e.
// the arrow row r's rule (i = r-1) points at. The R4C4 arrow is drawn
// white since R4C4 is itself grey.
const arrowCells = [
  { row: 2, col: 7, dr: 1, dc: -1 },  // arrows[0]: R2C7 down-left
  { row: 3, col: 7, dr: 1, dc: 0 },   // arrows[1]: R3C7 down
  { row: 4, col: 4, dr: -1, dc: -1 }, // arrows[2]: R4C4 up-left
  { row: 5, col: 2, dr: 1, dc: 1 },   // arrows[3]: R5C2 down-right
  { row: 6, col: 8, dr: 1, dc: 1 },   // arrows[4]: R6C8 down-right
  { row: 7, col: 4, dr: 1, dc: -1 },  // arrows[5]: R7C4 down-left
  { row: 8, col: 6, dr: -1, dc: 1 },  // arrows[6]: R8C6 up-right
  { row: 9, col: 3, dr: 0, dc: 1 },   // arrows[7]: R9C3 right
];

// Cells running from an arrow cell in its own direction, stopping at the
// grid edge -- the longest sum-arrow that direction could ever draw.
function pathCells({ row, col, dr, dc }) {
  const cells = [];
  let r = row + dr, c = col + dc;
  while (r >= 1 && r <= 9 && c >= 1 && c <= 9) {
    cells.push(makeCellId(r, c));
    r += dr;
    c += dc;
  }
  return cells;
}

const rowConstraints = greyCells.flatMap((greyCell, i) => {
  const r = i + 1;
  const countCell = makeCellId(r, r + 1);
  const arrow = arrowCells[i];
  const arrowCell = makeCellId(arrow.row, arrow.col);
  const path = pathCells(arrow);

  // Fact 1: the arrow cell's digit equals the grey cell's digit.
  const arrowEqualsGrey = new SameValues(2, arrowCell, greyCell);

  // Fact 2: the arrow cell sums the first N path cells, N read off
  // countCell. Every geometrically possible N is offered as a branch;
  // the solver picks whichever the grid supports.
  const arrowSumsForLength = new Or(
    path.map((_, k) => new And([
      new Given(countCell, k + 1),
      new Arrow(arrowCell, ...path.slice(0, k + 1)),
    ]))
  );

  return [arrowEqualsGrey, arrowSumsForLength];
});

return [
  grid,
  new Given('R1C4', 9),
  new Given('R3C9', 3),
  new Given('R4C1', 6),
  new Given('R4C9', 9),
  new Given('R5C1', 2),
  new Given('R5C9', 4),
  new Given('R6C1', 3),
  new Given('R6C9', 7),
  new Given('R7C1', 4),
  new Given('R9C6', 5),
  ...rowConstraints,
];
