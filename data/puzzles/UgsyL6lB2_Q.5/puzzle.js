// Title: Nine Pins Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=UgsyL6lB2_Q
// Source: https://tinyurl.com/5n6juawb

// Normal Sudoku rules apply.
// "Each number from 1-9 must appear three times in a row along a diagonal in
// this puzzle": for every digit 1-9, some three cells consecutive along one
// diagonal line of the grid all hold that digit. "A diagonal" (not "the
// diagonal[s]") and no drawn diagonal overlay in the source read as any
// diagonal line of the grid, either direction, not just the two length-9
// diagonals -- the broader, less-restrictive reading. Diagonals carry no
// all-different constraint here, so repeats along one are otherwise
// unconstrained.

const N = 9;

function* rangeI(from, to) {
  for (let i = from; i <= to; i++) yield i;
}

// Every length-3 window of cells consecutive along a grid diagonal, both
// diagonal directions (down-right and down-left), derived from the grid
// geometry rather than hand listed.
const windows = [];
for (const dc of [1, -1]) {
  for (let r = 1; r + 2 <= N; r++) {
    for (let c = 1; c <= N; c++) {
      const c2 = c + 2 * dc;
      if (c2 < 1 || c2 > N) continue;
      windows.push([
        makeCellId(r, c),
        makeCellId(r + 1, c + dc),
        makeCellId(r + 2, c2),
      ]);
    }
  }
}

return [
  new Shape('9x9'),

  new Given('R1C1', 4), new Given('R1C9', 5),
  new Given('R2C2', 9),
  new Given('R3C3', 1), new Given('R3C4', 2), new Given('R3C6', 6), new Given('R3C7', 8),
  new Given('R4C3', 3), new Given('R4C4', 4), new Given('R4C5', 2), new Given('R4C6', 5), new Given('R4C7', 7),
  new Given('R5C4', 3), new Given('R5C6', 7),
  new Given('R6C3', 7), new Given('R6C4', 8), new Given('R6C5', 6), new Given('R6C6', 1), new Given('R6C7', 3),
  new Given('R7C3', 5), new Given('R7C4', 6), new Given('R7C6', 4), new Given('R7C7', 9),
  new Given('R8C8', 4),
  new Given('R9C1', 8), new Given('R9C9', 1),

  // For each digit, at least one diagonal window has all three cells equal
  // to that digit.
  ...rangeI(1, 9).map(d => new Or(
    windows.map(cells => new And(cells.map(cell => new Given(cell, d))))
  )),
];
