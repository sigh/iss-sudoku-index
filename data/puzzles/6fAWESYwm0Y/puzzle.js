// Title: Clueless Sudoku 6
// Author: Alf Smith
// Video: https://www.youtube.com/watch?v=6fAWESYwm0Y
// Source: https://sudokupad.app/5u9hvqo4on

// Normal sudoku rules apply on a plain 9x9 grid with standard 3x3 boxes; no
// givens or drawn clues. A cell is gold if and only if its digit equals its
// position within its row (reading left-to-right, i.e. the column number),
// its column (reading top-to-bottom, i.e. the row number), or its box
// (reading left-to-right, top-to-bottom, i.e. the box-relative index 1-9).
// White cells are the complement: their digit matches none of the three.
// Both directions of the "if and only if" become a candidate restriction per
// cell below, computed from each cell's fixed row/col/box position rather
// than hand-listing 81 sets.

// Gold cells, read from the yellow (#F7D038) 1x1 underlays in the payload.
const GOLD = [
  [1, 4], [1, 5], [2, 2], [2, 4], [2, 5], [3, 2], [3, 3],
  [4, 6], [4, 7], [4, 9], [5, 2], [5, 3], [5, 7], [5, 8],
  [6, 1], [6, 2], [6, 4], [6, 6],
  [7, 7],
  [8, 1], [8, 7], [8, 8],
  [9, 3], [9, 4],
];
const goldSet = new Set(GOLD.map(([r, c]) => `${r},${c}`));

// Box-relative reading-order index (1-9) for standard 3x3 boxes on a 9x9 grid.
const boxPos = (r, c) => {
  const lr = (r - 1) % 3;
  const lc = (c - 1) % 3;
  return lr * 3 + lc + 1;
};

const givens = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const positions = new Set([c, r, boxPos(r, c)]);
    const isGold = goldSet.has(`${r},${c}`);
    const allowed = [];
    for (let v = 1; v <= 9; v++) {
      if (positions.has(v) === isGold) allowed.push(v);
    }
    givens.push(new Given(makeCellId(r, c), ...allowed));
  }
}

return [
  new Shape('9x9'),
  ...givens,
];
