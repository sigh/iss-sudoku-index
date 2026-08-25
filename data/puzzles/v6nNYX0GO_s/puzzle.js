// Title: Build-a-Sandwich Sudoku
// Author: xoned
// Video: https://www.youtube.com/watch?v=v6nNYX0GO_s
// Source: https://app.crackingthecryptic.com/webapp/tgH6h7pmqh
//
// Normal sudoku rules apply. Sandwich clues (sum of the digits strictly
// between the 1 and the 9 in a row/column) sit above the grid (columns) and
// to the left (rows), but eight of them have been moved below the grid and
// must be restored to their eight vacant slots. The other row/column clue
// slots are drawn solid black: those rows/columns carry no sandwich clue at
// all (not a clue of 0 -- there is simply no clue printed there).
//
// Eight vacant slots (rows clued from the left, columns clued from the top):
//   rows 3, 4, 6, 7, 9   columns 4, 6, 9
// Eight displaced sums, read left-to-right below the grid:
//   12, 14, 18, 20, 22, 25, 32, 33
// The correspondence between slot and sum is not given -- it is a bijection
// the solver must recover from ordinary sudoku/sandwich logic, so it is
// modelled as one selector Var per slot (which of the eight sums it holds),
// all-different (a bijection, since there are exactly 8 slots and 8 values),
// and an Or over which sum makes that row/column's actual Sandwich total.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const VALUES = [12, 14, 18, 20, 22, 25, 32, 33]; // R11C2..R11C9, left to right

const rowSlots = [3, 4, 6, 7, 9]; // vacant left-side (row) clue slots
const colSlots = [4, 6, 9];       // vacant top-side (column) clue slots

const lines = [
  ...rowSlots.map(r => graph.row(r)),
  ...colSlots.map(c => graph.column(c)),
];

const slots = new Var('S', 'sandwich slot value index', lines.length);

return [
  new Shape('9x9'),

  // Givens.
  new Given('R2C2', 4),
  new Given('R2C5', 7),
  new Given('R3C6', 1),
  new Given('R7C4', 9),
  new Given('R8C2', 5),
  new Given('R8C4', 8),

  slots,
  // Restrict each selector to an index into VALUES (1-based).
  ...slots.cells().map(cell => new Given(cell, ...VALUES.map((_, i) => i + 1))),
  new AllDifferent(...slots.cells()),

  // Each vacant line's Sandwich total is whichever VALUES entry its selector
  // picks; AllDifferent above forces the eight selectors into a permutation
  // of 1..8, i.e. a bijection from slots to sums.
  ...lines.map((cells, i) => new Or(
    VALUES.map((value, k) => new And([
      new Given(slots.cell(i + 1), k + 1),
      Sandwich.fromCells(value, cells, geometry),
    ]))
  )),
];
