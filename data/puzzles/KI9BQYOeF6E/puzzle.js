// Title: Square of Squares
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=KI9BQYOeF6E
// Source: https://sudokupad.app/0o823lt42s

// LATIN SQUARE: place 1-9 once each in every row and column -- a plain
// Latin square grid, no box constraint (NoBoxes below).
// LATIN SQUARES: the grid is subdivided, by the solver, into axis-aligned
// square blocks of side 2-8 (any size except 1x1, and none the size of the
// whole 9x9 grid -- the rule calls them "smaller" Latin squares) that
// exactly tile the board. Nothing marks the subdivision: no region lines
// are drawn in the payload or on the video's board. Each block of side N
// holds its own NxN Latin square over exactly N of the nine digits, and no
// two same-side blocks may agree at the same relative cell.
// Digits on an arrow sum to the digit in its circle.

const at = (r, c) => makeCellId(r, c);

// Every way to exactly tile the 9x9 board with axis-aligned squares of
// side 2..8. This is a plain geometric fact about a 9x9 board -- computed
// here by exhaustive backtracking over tile placement, with no reference to
// digits or to any solution -- not a search over the puzzle's answer. The
// standard argument applies: the first uncovered cell in reading order must
// be the top-left corner of whichever tile covers it, so trying every legal
// tile there and recursing enumerates every tiling exactly once. There are
// 49 of them (sizes only ever combine as nine 2x2 + five 3x3, one 4x4 +
// five 3x3 + five 2x2, one 6x6 + five 3x3, or nine 3x3 -- verified by
// running this same function standalone).
function allTilings() {
  const N = 9;
  const covered = new Array(N * N).fill(false);
  const idx = (r, c) => r * N + c;
  const tilings = [];

  function firstUncovered() {
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (!covered[idx(r, c)]) return [r, c];
      }
    }
    return null;
  }

  function setRegion(r, c, size, value) {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) covered[idx(r + i, c + j)] = value;
    }
  }

  function recurse(squares) {
    const pos = firstUncovered();
    if (!pos) {
      tilings.push(squares.slice());
      return;
    }
    const [r, c] = pos;
    for (let size = 2; size <= 8; size++) {
      if (r + size > N || c + size > N) continue;
      let clear = true;
      for (let i = 0; i < size && clear; i++) {
        for (let j = 0; j < size && clear; j++) {
          if (covered[idx(r + i, c + j)]) clear = false;
        }
      }
      if (!clear) continue;
      setRegion(r, c, size, true);
      squares.push({ r, c, size });
      recurse(squares);
      squares.pop();
      setRegion(r, c, size, false);
    }
  }
  recurse([]);
  return tilings;
}

// The constraints that the "Latin squares" rule implies once one candidate
// tiling is fixed:
//  - each block of side N is an NxN Latin square over exactly N of the nine
//    digits: every row of the block already has N distinct digits (a
//    subset of a full, all-different grid row), so forcing every row's
//    value SET equal via SameValues pins the block to exactly N shared
//    digits; the same argument over full grid columns then forces every
//    local column to be a permutation of that same N-set too, so the block
//    is a genuine Latin square once its rows agree.
//  - no two same-side blocks share a digit at the same relative cell:
//    grouped by side, every relative offset's cells across all of a size's
//    blocks must be pairwise different (AllDifferent generalises "no two"
//    to any count of same-size blocks).
function tilingConstraints(tiling) {
  const parts = [];
  for (const { r, c, size } of tiling) {
    const rows = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) rows.push(at(r + i + 1, c + j + 1));
    }
    parts.push(new SameValues(size, ...rows));
  }

  const bySize = new Map();
  for (const sq of tiling) {
    if (!bySize.has(sq.size)) bySize.set(sq.size, []);
    bySize.get(sq.size).push(sq);
  }
  for (const [size, squares] of bySize) {
    if (squares.length < 2) continue;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const cells = squares.map((sq) => at(sq.r + i + 1, sq.c + j + 1));
        parts.push(new AllDifferent(...cells));
      }
    }
  }
  return new And(parts);
}

const latinSquares = new Or(allTilings().map(tilingConstraints));

// Arrows -- circle first, then the shaft cells.
const arrows = [
  [[5, 9], [6, 9], [6, 8]],
  [[3, 7], [2, 8], [1, 9]],
  [[5, 2], [6, 2], [6, 1]],
  [[9, 4], [8, 3], [8, 2]],
  [[9, 8], [8, 7], [8, 6]],
  [[3, 4], [2, 3], [1, 4]],
].map((line) => new Arrow(...line.map((rc) => at(...rc))));

return [
  new Shape('9x9'),
  new NoBoxes(),
  latinSquares,
  ...arrows,
];
