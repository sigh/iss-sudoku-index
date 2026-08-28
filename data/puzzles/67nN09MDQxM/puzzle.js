// Title: XY Differences
// Author: Unknown
// Video: https://www.youtube.com/watch?v=67nN09MDQxM
// Source: https://cracking-the-cryptic.web.app/sudoku/pQ6QGHrJjM

// Normal sudoku. Each row's leftmost cell is that row's X; every pair of
// horizontally adjacent cells in the row that differ by X carries a diamond,
// and no other pair in that row does (exhaustive marking, both directions).
// Each column's topmost cell is that column's Y; every pair of vertically
// adjacent cells in the column that differ by Y carries a diamond, and no
// other pair in that column does. Diamond positions below are transcribed
// from the drawn markers -- black diamonds straddle a same-row (horizontal)
// border and are the row clues; purple diamonds straddle a same-column
// (vertical) border and are the column clues; the colour split exactly
// tracks that orientation split in the drawn geometry.

// [row, colA, colB] for each drawn row-oriented (black) diamond.
const rowDiamonds = [
  [2, 1, 2], [2, 8, 9], [5, 1, 2], [8, 2, 3], [6, 3, 4],
];

// [col, rowA, rowB] for each drawn column-oriented (purple) diamond.
const colDiamonds = [
  [4, 1, 2], [5, 1, 2], [7, 3, 4], [4, 4, 5], [5, 4, 5],
  [1, 3, 4], [2, 2, 3], [3, 5, 6], [8, 6, 7], [8, 7, 8],
  [4, 7, 8], [3, 8, 9],
];

// One NFA per line (9 rows + 9 columns) scans that line's 9 cells in order.
// State carries X (the line's first cell value), the previous cell's value,
// and a position counter. At each later cell it checks whether a diamond is
// drawn between the previous and current position and rejects the branch
// unless |prev - value| == X agrees with that fact -- this is what makes the
// marking exhaustive rather than a lower bound.
function lineDiamondSpec(diamondAt) {
  // diamondAt[k] (1-indexed positions 1..8) is true iff a diamond sits
  // between line-position k and k+1.
  return NFA.encodeSpec({
    startState: { x: null, prev: null, pos: 0 },
    transition: ({ x, prev, pos }, value) => {
      // `pos` (pre-increment) is the count of symbols already consumed, i.e.
      // the 1-indexed border position between the previous symbol and this
      // one -- that is the index into diamondAt, not pos + 1.
      if (x === null) return { x: value, prev: value, pos: 1 };
      const isMatch = Math.abs(prev - value) === x;
      if (isMatch !== !!diamondAt[pos - 1]) return undefined;
      return { x, prev: value, pos: pos + 1 };
    },
    accept: () => true,
    maxDepth: 9,
  }, 9);
}

const rowCells = (r) => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));
const colCells = (c) => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));

// Reduce a line's diamond triples to the set of border positions marked.
const markedPositions = (triples, line) => new Set(
  triples.filter(([l]) => l === line).map(([, a, b]) => Math.min(a, b))
);

const rowConstraints = [];
for (let r = 1; r <= 9; r++) {
  const marks = markedPositions(rowDiamonds, r);
  const diamondAt = Array.from({ length: 8 }, (_, i) => marks.has(i + 1));
  rowConstraints.push(
    new NFA(lineDiamondSpec(diamondAt), `row ${r} X-diamonds`, ...rowCells(r)));
}

const colConstraints = [];
for (let c = 1; c <= 9; c++) {
  const marks = markedPositions(colDiamonds, c);
  const diamondAt = Array.from({ length: 8 }, (_, i) => marks.has(i + 1));
  colConstraints.push(
    new NFA(lineDiamondSpec(diamondAt), `col ${c} Y-diamonds`, ...colCells(c)));
}

return [
  new Shape('9x9'),
  new Given('R3C4', 3),
  new Given('R4C3', 2),
  ...rowConstraints,
  ...colConstraints,
];
