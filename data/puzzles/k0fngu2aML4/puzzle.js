// Title: X-Sums & Sandwiches
// Author: Emre Kolotoglu
// Video: https://www.youtube.com/watch?v=k0fngu2aML4
// Source: https://app.crackingthecryptic.com/sudoku/M82nrpghDB

// Normal sudoku rules apply (default row/column/box all-different, digits
// 1-9). No digits are given anywhere in the grid.
//
// Nine unlabeled markers sit on the border; each one's hidden value is
// simultaneously (a) the X-Sum read from that marker's own direction -- sum
// of the first X digits from that edge, where X is the first digit seen --
// and (b) the sandwich sum of that same row/column -- sum of the digits
// strictly between the 1 and the 9, which does not depend on direction. The
// value itself is never given, only that both readings agree, so each
// marker is encoded as an equality between its XSum reading and its
// Sandwich reading: Or, over every value both clue types can take, of
// And(XSum(v), Sandwich(v)).
//
// A shared value is >=1 (XSum forbids 0) and <=35 (Sandwich's own maximum:
// digits 1 and 9 total 10, so the remaining seven digits {2..8} -- the
// largest possible sandwiched set -- total 45-10=35). Branches for v>35 are
// already unreachable under Sandwich's own semantics, so restricting the Or
// to v=1..35 loses no valid assignment.
const geometry = cellGeometry('9x9');

function colTopDown(col) {
  const cells = [];
  for (let r = 1; r <= 9; r++) cells.push(makeCellId(r, col));
  return cells;
}
function rowLeftRight(row) {
  const cells = [];
  for (let c = 1; c <= 9; c++) cells.push(makeCellId(row, c));
  return cells;
}

// xsumCells is ordered from the marker's own direction; sandwichCells uses
// the row/column's top/left canonical order (Sandwich has no direction of
// its own, so this is the same lane read either way).
function xsumEqualsSandwich(xsumCells, sandwichCells) {
  const branches = [];
  for (let v = 1; v <= 35; v++) {
    branches.push(new And([
      XSum.fromCells(v, xsumCells, geometry),
      Sandwich.fromCells(v, sandwichCells, geometry),
    ]));
  }
  return new Or(branches);
}

const col2 = colTopDown(2), col6 = colTopDown(6), col7 = colTopDown(7);
const col8 = colTopDown(8), col1 = colTopDown(1);
const row1 = rowLeftRight(1), row6 = rowLeftRight(6), row7 = rowLeftRight(7);

return [
  new Shape('9x9'),

  // Marked lanes (border "?" overlay positions in the source payload).
  xsumEqualsSandwich(col2, col2),                     // top of column 2
  xsumEqualsSandwich(col6, col6),                     // top of column 6
  xsumEqualsSandwich(col7, col7),                     // top of column 7
  xsumEqualsSandwich(col8, col8),                     // top of column 8
  xsumEqualsSandwich(row1, row1),                     // left of row 1
  xsumEqualsSandwich(row1.slice().reverse(), row1),   // right of row 1
  xsumEqualsSandwich(row6, row6),                     // left of row 6
  xsumEqualsSandwich(row7, row7),                     // left of row 7
  xsumEqualsSandwich(col1.slice().reverse(), col1),   // bottom of column 1
];
