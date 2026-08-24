// Title: Chaos Construction 3
// Author: Hong Weihua
// Video: https://www.youtube.com/watch?v=XvkivPHENsc
// Source: https://app.crackingthecryptic.com/sudoku/rLjhGRbDPN

// Rules (video description): divide the grid into 7-cell regions so that
// each row, column and region contains 1-7. The sum of the two cells
// either side of each region border in each row or column is given, in
// order (though some are hidden). A white dot cannot be touched by a
// region border.
//
// The payload's playable area is the 7x7 block at the bottom-right of an
// 11x11 SudokuPad canvas (payload R5C5-R11C11); the outside cells hold the
// border-sum margin clues. This script re-indexes to its own 7x7 grid
// (local Ri Cj = payload R(4+i) C(4+j)) and has no in-grid givens -- every
// drawn digit and "?" in the payload sits in the margin.
//
// "Each row, column and region contains 1-7" for solver-discovered,
// connected, equal-value-count regions is exactly ChaosConstruction's
// stated semantics, so no box regions are declared (a 7x7 grid has no
// default box factorisation to begin with -- 7 is prime).
//
// Border-sum margins: a row's clues sit only in its left margin (columns
// 1-4 of the canvas); a column's only in its top margin (rows 1-4). Each
// margin cell is either a digit, a hidden "?", or blank. Read outward from
// the grid edge, every line's filled run is contiguous with no gaps, and
// "the sum ... is given, in order (though some are hidden)" means every
// border gets a marker (digit or "?") -- so the marker count is the exact
// border count for that line. The margin band is 4 cells deep on every
// side it's used and there is nowhere else on the canvas to draw a longer
// stack, so no line can ever have more than 4 borders either: a filled
// run of k markers is that line's whole border count.
//
// The margin values are read in the canvas's own forward reading order --
// increasing payload column for a row's left margin, increasing payload
// row for a column's top margin -- which starts at the margin cell
// farthest from the grid and ends adjacent to the grid edge; that
// sequence lines up with the true borders scanned from that same grid
// edge inward (nearest-edge border first). What "in order" does not fix
// is which of the line's 6 internal gaps (between its 7 cells) each
// marker belongs to -- only that reading the true borders in that
// direction reproduces the listed sequence. That correspondence is open,
// so each line is encoded as an Or() over every k-subset of its 6 gaps:
// the chosen gaps are pinned to true region borders (AllDifferent on the
// CC region-label overlay), in listed order a known value also pins the
// pair's digit sum (Sum), and every other gap is pinned to no border
// (SameValues on CC).
//
// White dots: a dot sits on an interior grid-line vertex where 4 cells
// meet; "cannot be touched by a region border" means none of the 4 edges
// meeting at that point (top/bottom/left/right of the 2x2) is a region
// border, which forces all 4 cells into the same region.

const graph = cellGraph('7x7');
const cc = graph.makeOverlay('CC');

const cellId = (r, c) => makeCellId(r, c);

// All k-element subsets of arr, in ascending index order (so the returned
// subset is itself ascending -- needed so "chosen[i]" lines up with the
// i-th listed target, in border-scanning order: gap 1 (nearest the margin's
// edge of the grid) first).
function combinations(arr, k) {
  const results = [];
  const combo = [];
  (function recurse(start) {
    if (combo.length === k) { results.push([...combo]); return; }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      recurse(i + 1);
      combo.pop();
    }
  })(0);
  return results;
}

// cells: the line's 7 grid cells, ordered from the margin edge (index 0)
// to the far edge (index 6). targets: this line's margin values in
// border-scanning order (gap 1, nearest the margin's edge of the grid,
// first); each is a sum integer or null for a hidden "?".
function borderLine(cells, targets) {
  const gaps = [1, 2, 3, 4, 5, 6]; // gap p sits between cells[p-1] and cells[p]
  const k = targets.length;
  if (k === 0) {
    return new And(gaps.map(p =>
      new SameValues(2, cc.at(cells[p - 1]), cc.at(cells[p]))));
  }
  const branches = combinations(gaps, k).map(chosen => {
    const parts = [];
    for (const p of gaps) {
      const a = cells[p - 1], b = cells[p];
      const idx = chosen.indexOf(p);
      if (idx === -1) {
        parts.push(new SameValues(2, cc.at(a), cc.at(b)));
      } else {
        parts.push(new AllDifferent(cc.at(a), cc.at(b)));
        const val = targets[idx];
        if (val !== null) parts.push(new Sum(val, a, b));
      }
    }
    return new And(parts);
  });
  return branches.length === 1 ? branches[0] : new Or(branches);
}

// Row/column margin clues, read in the canvas's own forward reading order
// -- increasing payload column (C1->C4) for a row's clues, increasing
// payload row (R1->R4) for a column's clues -- i.e. farthest-from-grid
// margin cell first, nearest-to-grid (adjacent to the grid edge) last.
// Transcribed from the payload's margin cells/overlays (top margin
// rows1-4 for columns, left margin cols1-4 for rows; `null` = hidden "?").
// Reading nearest-to-grid-first instead was refuted: with every row and
// column border-line encoded that way (still paired with borderLine's
// gaps in ascending, i.e. nearest-grid-edge-first, order) plus
// ChaosConstruction and no other constraint, the combined row+column set
// alone is unsatisfiable (full search completes with 0 solutions well
// under the backtrack cap); reversing to this forward reading order makes
// the same combined set satisfiable.
const ROW_TARGETS = {
  1: [3, 7],
  2: [11, null],
  3: [null, null, 9],
  4: [11, 10, 5, 8],
  5: [null, null],
  6: [null, 11],
  7: [null],
};
const COL_TARGETS = {
  1: [null],
  2: [11, 3, 4],
  3: [null, null, null, null],
  4: [null, null, null],
  5: [7, 6, 12, 9],
  6: [null, null, null, null],
  7: [null, null],
};

const rowConstraints = Object.entries(ROW_TARGETS).map(([i, targets]) => {
  const row = i | 0;
  const cells = Array.from({ length: 7 }, (_, j) => cellId(row, j + 1));
  return borderLine(cells, targets);
});
const colConstraints = Object.entries(COL_TARGETS).map(([j, targets]) => {
  const col = j | 0;
  const cells = Array.from({ length: 7 }, (_, i) => cellId(i + 1, col));
  return borderLine(cells, targets);
});

// White dots (drawn corner overlays), each as its 4 surrounding cells,
// converted from payload coordinates (local = payload - 4).
const DOT_CORNERS = [
  [[1, 4], [1, 5], [2, 4], [2, 5]], // payload corner(R5C8,R5C9,R6C8,R6C9)
  [[2, 6], [2, 7], [3, 6], [3, 7]], // payload corner(R6C10,R6C11,R7C10,R7C11)
  [[4, 1], [4, 2], [5, 1], [5, 2]], // payload corner(R8C5,R8C6,R9C5,R9C6)
];
const dotConstraints = DOT_CORNERS.map(corners =>
  new SameValues(4, ...corners.map(([r, c]) => cc.at(cellId(r, c)))));

return [
  new Shape('7x7'),
  new ChaosConstruction(),
  ...rowConstraints,
  ...colConstraints,
  ...dotConstraints,
];
