// Title: Revolutionary
// Author: Malrog
// Video: https://www.youtube.com/watch?v=ERjgMK0XNUY
// Source: https://tinyurl.com/2hv3n33v

// Normal sudoku rules apply.
// Every cage and every arrow below is given in its drawn reference
// orientation, but its true cell set is that shape rotated clockwise around
// its own pivot cell (the purple dot) by (pivot digit mod 4) quarter turns:
// mod 4 == 0 (digits 4, 8) is the reference orientation itself, mod 4 == 1
// (1, 5, 9) is one quarter turn clockwise, == 2 (2, 6) a half turn, == 3
// (3, 7) three quarter turns. A quarter turn that would push any cell of the
// clue off the grid cannot occur, which forbids the corresponding digits at
// that pivot cell -- this is encoded by simply omitting that turn's branch
// below, since no branch then accepts the forbidden digits at the pivot.
// Cages: digits may not repeat and sum to the printed total.
// Arrows: the arm digits sum to the bulb (first cell).

// Rotate a (row, col) offset clockwise by k quarter turns (screen coords:
// row increases downward, col increases rightward).
function rotateOffset(dr, dc, k) {
  let r = dr, c = dc;
  for (let i = 0; i < k; i++) [r, c] = [c, -r];
  return [r, c];
}

// digit -> quarter-turn count, by (digit mod 4).
const DIGITS_FOR_TURN = { 0: [4, 8], 1: [1, 5, 9], 2: [2, 6], 3: [3, 7] };

// Rotate `cells` (a cage's cells, or an arrow's [bulb, ...arm]) by k quarter
// turns around `pivot`. Returns null if any rotated cell leaves the 9x9 grid.
function rotatedCells(pivot, cells, k) {
  const { row: pr, col: pc } = parseCellId(pivot);
  const out = [];
  for (const cell of cells) {
    const { row, col } = parseCellId(cell);
    const [dr, dc] = rotateOffset(row - pr, col - pc, k);
    const nr = pr + dr, nc = pc + dc;
    if (nr < 1 || nr > 9 || nc < 1 || nc > 9) return null;
    out.push(makeCellId(nr, nc));
  }
  return out;
}

// One branch per quarter turn that keeps the clue on-grid: the pivot holds a
// digit for that turn, and `build` states the rule over the turn's rotated
// cells.
function pivotedClue(pivot, cells, build) {
  const branches = [];
  for (let k = 0; k < 4; k++) {
    const rotated = rotatedCells(pivot, cells, k);
    if (!rotated) continue;
    branches.push(new And([
      new Given(pivot, ...DIGITS_FOR_TURN[k]),
      build(rotated),
    ]));
  }
  return new Or(branches);
}

function pivotedCage(pivot, cells, total) {
  return pivotedClue(pivot, cells, rotated => new Cage(total, ...rotated));
}

function pivotedArrow(pivot, path) {
  return pivotedClue(pivot, path, rotated => new Arrow(...rotated));
}

// Cages: cells in drawn order, pivot per the purple dot on one cage cell.
const cages = [
  ['R1C1', ['R1C1', 'R2C1'], 15],
  ['R1C9', ['R1C9', 'R2C9'], 15],
  ['R1C5', ['R1C5', 'R1C6', 'R2C6'], 21],
  ['R2C4', ['R2C4', 'R3C4', 'R3C5', 'R4C5'], 15],
];

// Arrows: [bulb, ...arm] in drawn order, pivot per the purple dot on one
// bulb/arm cell.
const arrows = [
  ['R4C2', ['R6C2', 'R5C2', 'R4C2', 'R3C1']],
  ['R4C4', ['R6C4', 'R5C4', 'R4C4']],
  ['R3C7', ['R5C9', 'R4C9', 'R4C8', 'R3C7']],
  ['R6C6', ['R6C6', 'R6C7', 'R5C8', 'R4C8']],
  ['R6C8', ['R7C6', 'R7C7', 'R6C8']],
  ['R7C2', ['R7C3', 'R7C2', 'R6C1']],
  ['R7C5', ['R8C5', 'R7C5', 'R6C5']],
];

return [
  new Shape('9x9'),
  ...cages.map(([pivot, cells, total]) => pivotedCage(pivot, cells, total)),
  ...arrows.map(([pivot, path]) => pivotedArrow(pivot, path)),
];
