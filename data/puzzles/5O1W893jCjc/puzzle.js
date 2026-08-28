// Title: How can THIS be a sudoku?
// Author: Unknown
// Video: https://www.youtube.com/watch?v=5O1W893jCjc
// Source: https://cracking-the-cryptic.web.app/sudoku/8D346R4gjB

// Standard row/column/box sudoku: the payload's 9 regions are exactly the 9
// default 3x3 boxes (just listed in column-major order), so Shape('9x9')
// alone already reproduces them -- no explicit Region needed.
//
// The payload carries no metadata.rules text; the only rules text available
// anywhere is the video description: "Arrows point to increasing digits;
// all cells plus their symmetric counterparts sum to 10."
//
// Rule 1, arrows: three diagonals, each drawn as an arrow entering from
// outside the border with no drawn bulb cell. The entry cell and direction
// of travel both come from the arrow's own two drawn waypoints, not from a
// bulb: continuing the arrow's own 45-degree vector one half-step past the
// border lands exactly on one cell's centre, fixing both the entry cell and
// the direction of travel; digits strictly increase from the entry cell to
// the diagonal's far end. Thermo's "increasing order starting at the first
// cell" is exactly this rule, so it
// is used here even though nothing in the art is drawn as a thermometer.
//
// Rule 2, symmetric sum: "symmetric counterparts" is read as the classic
// 180-degree/point symmetry about the grid centre (the only symmetry a
// square grid canonically supports with no further qualifier): cell (r,c)
// and cell (10-r, 10-c) [1-indexed] must sum to 10. Built below as one Sum
// per unordered pair over all 81 cells (40 pairs). The centre cell R5C5 is
// its own counterpart, so the rule forces it directly (2x = 10 -> x = 5);
// that one cell has no partner to pair with, so it is a Given instead.

const symmetricPairSums = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const idx = (r - 1) * 9 + (c - 1);
    const pr = 10 - r, pc = 10 - c;
    const pIdx = (pr - 1) * 9 + (pc - 1);
    if (idx < pIdx) {
      symmetricPairSums.push(new Sum(10, makeCellId(r, c), makeCellId(pr, pc)));
    }
  }
}

return [
  new Shape('9x9'),

  // Centre cell is its own 180-degree counterpart under rule 2.
  new Given('R5C5', 5),

  ...symmetricPairSums,

  // Arrow entering the top border, direction down-left, to the left edge.
  new Thermo('R1C4', 'R2C3', 'R3C2', 'R4C1'),
  // Arrow entering the bottom border, direction up-right, to the right edge.
  new Thermo('R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9'),
  // Arrow entering the right border, direction up-left, to the top edge.
  new Thermo('R7C9', 'R6C8', 'R5C7', 'R4C6', 'R3C5', 'R2C4', 'R1C3'),
];
