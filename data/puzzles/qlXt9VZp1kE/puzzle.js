// Title: The Keep
// Author: Myxo
// Video: https://www.youtube.com/watch?v=qlXt9VZp1kE
// Source: https://sudokupad.app/2ds1h40cr9

// Sudoku: standard 6x6 grid, default 2-row x 3-column boxes (row/col/box
// all-different come from Shape('6x6') itself).
//
// Numbered Rooms: 13 blank circles sit outside the grid, one per marked
// row/column edge. Each circle is an unknown digit (Var), not a drawn clue
// number. Reading the rule ("the Xth cell ... contains N, where X is the
// digit in the cell next to the clue") from the first cell of that line: if
// the first cell holds digit A, the A-th cell in the line holds the circle's
// own digit. Modeled as one NFA per circle scanning [line cell 1, ..., line
// cell 6, circle Var]: it captures the target index from the first symbol,
// captures the value at that position as the scan continues, and only
// accepts if the final symbol (the circle Var) matches the captured value.
//
// Antiknight: applies to the whole drawn layout, circles included. The
// built-in AntiKnight below covers grid-cell/grid-cell pairs. Pairs between a
// circle and a grid cell, or between two circles, are added explicitly below
// as two-cell AllDifferent edges, computed from each cell's real board
// position so a knight's-move pair isn't hand-enumerated by eye.

// Circle positions, named for their line, as drawn (each underlay's center,
// floored to a board row/col on the undrawn 8x8 canvas; the 6x6 playing grid
// occupies board rows/cols 1-6, which line up 1:1 with this puzzle's
// R1-R6/C1-C6 cell ids).
const CIRCLE_BOARD_POS = [
  [0, 3], [0, 5],                          // top edge
  [7, 2], [7, 5], [7, 6],                  // bottom edge
  [2, 0], [3, 0], [4, 0], [5, 0], [6, 0],  // left edge
  [1, 7], [5, 7], [6, 7],                  // right edge
];

// A circle on the top/bottom edge clues its column, read top-to-bottom or
// bottom-to-top; one on the left/right edge clues its row, read
// left-to-right or right-to-left. Board row/col 0 and 7 are off-grid edges by
// construction, so this is exhaustive for this puzzle's drawn circles.
function lineForCircle([boardRow, boardCol]) {
  if (boardRow === 0) return { kind: 'C', idx: boardCol, dir: 1 };
  if (boardRow === 7) return { kind: 'C', idx: boardCol, dir: -1 };
  if (boardCol === 0) return { kind: 'R', idx: boardRow, dir: 1 };
  if (boardCol === 7) return { kind: 'R', idx: boardRow, dir: -1 };
  throw new Error('circle is not on a grid edge');
}

// The 6 grid cells for a line, nearest-to-the-clue first.
function lineCells({ kind, idx, dir }) {
  return Array.from({ length: 6 }, (_, i) => {
    const pos = dir === 1 ? i + 1 : 6 - i;
    return kind === 'C' ? makeCellId(pos, idx) : makeCellId(idx, pos);
  });
}

const circleVar = new Var('C', 'Numbered Rooms circles', CIRCLE_BOARD_POS.length);
const circleLines = CIRCLE_BOARD_POS.map(lineForCircle);

// Shared NFA: reads [line cell 1..6, circle Var]. `k` is the target index,
// captured from the first cell's value; `targetVal` is the value found at
// position k once the scan reaches it. Accept only if the final symbol (the
// circle Var) equals targetVal.
const numberedRoomSpec = NFA.encodeSpec({
  startState: { pos: 0, k: null, targetVal: null },
  transition: ({ pos, k, targetVal }, value) => {
    if (pos === 0) {
      // First line cell: its value is the target index k.
      return { pos: 1, k: value, targetVal: value === 1 ? value : null };
    }
    if (pos < 6) {
      const newPos = pos + 1;
      const hit = newPos === k ? value : targetVal;
      return { pos: newPos, k, targetVal: hit };
    }
    // pos === 6: this symbol is the circle Var itself.
    return targetVal === value ? { pos: 7, k, targetVal } : undefined;
  },
  accept: (state) => state.pos === 7,
}, 6);

const numberedRooms = circleLines.map((line, i) =>
  new NFA(numberedRoomSpec, 'Numbered Rooms', ...lineCells(line), circleVar.cell(i + 1))
);

// Antiknight beyond the grid: an explicit two-cell AllDifferent (i.e. not
// equal) wherever a circle and a grid cell, or two circles, are a knight's
// move apart on the drawn board.
const KNIGHT_OFFSETS = [
  [1, 2], [1, -2], [-1, 2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1],
];
const isKnightMove = ([r1, c1], [r2, c2]) =>
  KNIGHT_OFFSETS.some(([dr, dc]) => r1 + dr === r2 && c1 + dc === c2);

const auxAntiknightPairs = [];

// Circle-circle pairs.
for (let i = 0; i < CIRCLE_BOARD_POS.length; i++) {
  for (let j = i + 1; j < CIRCLE_BOARD_POS.length; j++) {
    if (isKnightMove(CIRCLE_BOARD_POS[i], CIRCLE_BOARD_POS[j])) {
      auxAntiknightPairs.push([circleVar.cell(i + 1), circleVar.cell(j + 1)]);
    }
  }
}
// Circle-grid pairs (grid cell board position == its cell id, r,c in 1-6).
for (let i = 0; i < CIRCLE_BOARD_POS.length; i++) {
  for (let r = 1; r <= 6; r++) {
    for (let c = 1; c <= 6; c++) {
      if (isKnightMove(CIRCLE_BOARD_POS[i], [r, c])) {
        auxAntiknightPairs.push([circleVar.cell(i + 1), makeCellId(r, c)]);
      }
    }
  }
}

return [
  new Shape('6x6'),
  new AntiKnight(),
  circleVar,
  ...numberedRooms,
  ...auxAntiknightPairs.map(([a, b]) => new AllDifferent(a, b)),
];
