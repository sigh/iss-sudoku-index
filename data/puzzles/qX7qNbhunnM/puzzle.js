// Title: HohlenSTIL
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=qX7qNbhunnM
// Source: https://sudokupad.app/l0ffcltlz4

// No Sudoku digits anywhere: the grid holds only a shading. Shade some cells
// (the walls) so that:
//   - every unshaded cell (the cave) is orthogonally connected to every other
//     unshaded cell, forming one region;
//   - every shaded cell reaches the edge of the grid through other shaded
//     cells (so shaded cells may form several wall "blobs", each touching the
//     border, rather than one connected region);
//   - a clue cell is unshaded, and its number is the count of unshaded cells
//     it sees along its row and column, itself included, with the first
//     shaded cell in each direction blocking the view.
//
// The rules go on to require a LITS puzzle over the cave and each wall
// section as separate regions (one tetromino per region, no two same-shape
// tetrominoes edge-adjacent, every placed tetromino forming one connected
// area, no 2x2 fully covered by tetrominoes). That half is not encoded: it is
// a rigid-shape placement inside regions whose count, size and membership are
// themselves solver-discovered rather than drawn or bounded by any clue, and
// ISS has no primitive or documented construction for either half of it (a
// per-component "holds one piece" predicate over an unanchored, unbounded
// partition, or a shape-identity comparison between two discovered
// components). The cave/wall shading below is otherwise complete.

const SHADED = 1;
const UNSHADED = 2;

// The real puzzle is 10x10. It is modelled inset in a 12x12 board, its outer
// ring pinned SHADED, so "every shaded cell reaches the edge" is exactly
// "the shaded cells, plus that ring, form one connected region" -- a plain
// ConnectedValues, with no separate border/anchor predicate needed. `inner`
// lists the board cells of that inset block, in the same 1-indexed (row,
// col) reading order as the puzzle's own 10x10 clue table below.
const grid = cellGraph('12x12');
const inner = grid.block('R2C2', 10, 10);
const cellAt = (r, c) => inner[(r - 1) * 10 + (c - 1)];
const innerCells = new Set(inner);
const frameCells = grid.cells().filter(cell => !innerCells.has(cell));

// Drawn data: the 13 clue cells and their printed counts, read from the
// payload's per-cell `value` entries (row, col, 1-indexed against the real
// 10x10 grid).
const clues = [
  [1, 7, 3], [1, 9, 3], [2, 2, 3], [2, 5, 7], [3, 6, 5], [4, 3, 5],
  [5, 1, 4], [6, 10, 3], [8, 1, 4], [8, 3, 8], [8, 10, 3], [10, 4, 5],
  [10, 9, 6],
];

// One machine per clue, reading the four rays out from it (nearest cell
// first), each ray broken from its neighbours by SEGMENT_BREAK. `count` is
// the unshaded cells seen so far in the current ray; `blocked` records that a
// shaded cell has already been seen on it, so nothing further that way is
// visible. The clue's own digit is fixed at build time (it is printed, not
// solved for), so the machine only has to find exactly target - 1 more
// unshaded cells across all four rays than the clue cell itself supplies.
function sightSpec(target) {
  return NFA.encodeSpec({
    startState: { count: 0, blocked: false },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) return { count: state.count, blocked: false };
      if (state.blocked || value !== UNSHADED) {
        return { count: state.count, blocked: true };
      }
      const count = state.count + 1;
      if (count >= target) return undefined; // more than target - 1: dead branch
      return { count, blocked: false };
    },
    accept: (state) => state.count === target - 1,
    // 9 cells each way in a 10-wide/10-tall grid (row/col minus the clue
    // cell itself) across 4 rays, plus 3 breaks between them.
    maxDepth: 21,
  }, 2, { multiSegment: true });
}

const RAY_DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

const sightChecks = clues.map(([r, c, target]) => new NFA(
  sightSpec(target), 'sight',
  ...RAY_DIRECTIONS
    .map(([dRow, dCol]) => grid.ray(cellAt(r, c), dRow, dCol).slice(1))
    .filter(ray => ray.length)));

return [
  new Shape('12x12', '1-2', 'Raw'),

  ...frameCells.map(cell => new Given(cell, SHADED)),

  new ConnectedValues('', SHADED),
  new ConnectedValues('', UNSHADED),

  ...clues.map(([r, c]) => new Given(cellAt(r, c), UNSHADED)),
  ...sightChecks,
];
