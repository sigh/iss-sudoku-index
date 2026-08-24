// Title: DSM Qualitraining 2021: Position Sums Sudoku
// Author: Christoph Seeliger
// Video: https://www.youtube.com/watch?v=imDipnpHjBU
// Source: https://app.crackingthecryptic.com/sudoku/7m8jdnD8r8

// Normal sudoku rules apply on the playable 9x9 grid (default row/column/box
// all-different). For each row, A is the digit in its first (leftmost) cell
// and B is the digit in its second cell; for each column, A is the digit in
// its first (topmost) cell and B is the digit in its second cell. Two rings
// of clues sit outside the grid describing A and B for that row/column:
//   - The ring immediately adjacent to the grid gives A+B directly.
//   - The outer, grey-shaded ring gives the sum of the digits sitting at
//     position A and position B within that same row/column (counted from
//     the same side) -- a self-referential dereference, not A+B itself.
// Every row and every column carries exactly one of the two clue types
// (never both, never neither): odd sudoku rows/columns (1,3,5,7,9) carry the
// A+B clue, even ones (2,4,6,8) carry the position-sum clue. Transcribed
// from the drawn clue cells outside the printed 9x9 grid:
//   A+B rows (sudoku rows 1,3,5,7,9): 11,8,9,11,8
//   Position-sum rows (sudoku rows 2,4,6,8): 10,8,3,8
//   A+B cols (sudoku cols 1,3,5,7,9): 8,7,14,8,6
//   Position-sum cols (sudoku cols 2,4,6,8): 12,7,5,11

const graph = cellGraph('9x9');

const rowAB = { 1: 11, 3: 8, 5: 9, 7: 11, 9: 8 };
const colAB = { 1: 8, 3: 7, 5: 14, 7: 8, 9: 6 };
const rowPos = { 2: 10, 4: 8, 6: 3, 8: 8 };
const colPos = { 2: 12, 4: 7, 6: 5, 8: 11 };

const abSums = [
  ...Object.entries(rowAB).map(([r, sum]) => {
    const cells = graph.row(+r);
    return new Sum(sum, cells[0], cells[1]);
  }),
  ...Object.entries(colAB).map(([c, sum]) => {
    const cells = graph.column(+c);
    return new Sum(sum, cells[0], cells[1]);
  }),
];

// Position-sum clues need two dereferences per clue: the digit at position A
// and the digit at position B within the same row/column, where A and B are
// the values already in that row/column's own first two cells (A's cell also
// serves as the ValueIndexing control cell -- the same self-reference pattern
// used by NumberedRoom clues). One Var group of 16 cells holds both
// dereferenced digits for the 4 row + 4 column position-sum clues.
const aux = new Var('P', 'position-sum lookups', 16);
let auxIdx = 0;
const nextAux = () => aux.cell(++auxIdx);

const posSums = [];
for (const [entries, lineFn] of [[rowPos, r => graph.row(+r)], [colPos, c => graph.column(+c)]]) {
  for (const [key, sum] of Object.entries(entries)) {
    const cells = lineFn(key);
    const [controlA, controlB] = cells;
    const auxA = nextAux();
    const auxB = nextAux();
    posSums.push(
      new ValueIndexing(auxA, controlA, ...cells),
      new ValueIndexing(auxB, controlB, ...cells),
      new Sum(sum, auxA, auxB));
  }
}

return [
  new Shape('9x9'),
  aux,
  ...abSums,
  ...posSums,
];
