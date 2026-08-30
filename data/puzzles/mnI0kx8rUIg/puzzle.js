// Title: Tapa: The Puzzle That's Become A Classic
// Author: Hiro
// Video: https://www.youtube.com/watch?v=mnI0kx8rUIg
// Source: https://cracking-the-cryptic.web.app/sudoku/dTjhGMq232

// Rules encoded (standard Tapa rules for the genre, since the payload
// carries no rules text of its own):
// - Shade some empty cells to form a single orthogonally-connected group
//   (ISS's ConnectedValues is orthogonal-only, which is the only reading a
//   Tapa constraint ever uses).
// - Shaded cells never form a 2x2 square anywhere in the grid (every
//   overlapping window, not just an aligned tiling).
// - A clue cell's printed number(s) give the run-lengths of consecutive
//   shaded cells among its up-to-eight neighbours, read circularly; multiple
//   numbers require >=1 unshaded neighbour between the runs they name. Four
//   clue cells (R2C10, R5C10, R6C1, R9C1) sit on the grid's left/right edge
//   and keep only 5 of the 8 ring positions -- the 3 off-grid positions are
//   forced unshaded (they don't exist to shade) with no Given emitted for
//   them.
// - A clue cell is never itself shaded.
//
// Model: a single Raw grid, value range 1-2, where SHADED=1 and UNSHADED=2.
// No sudoku layer of any kind (no rows/columns/boxes) -- this is a pure
// shading puzzle, so ConnectedValues and the no-2x2 scan apply directly to
// the main grid.

const SHAPE = new Shape('10x10', '1-2', 'Raw');
const graph = cellGraph(SHAPE);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const SHADED = 1;
const UNSHADED = 2;

// Clue cells and their printed number(s). (row, col, [lengths]).
// Single-number clues are read from the payload's own cell `value`;
// multi-number clues are the payload's stacked text overlays in one cell,
// one number per overlay.
const tapaClues = [
  [2, 5, [2, 2, 1]],
  [2, 10, [3]],
  [3, 3, [1, 1]],
  [3, 7, [1, 1, 1]],
  [5, 5, [3]],
  [5, 10, [2, 2]],
  [6, 1, [2, 1]],
  [6, 6, [3]],
  [8, 4, [1, 1]],
  [8, 8, [1, 1, 1]],
  [9, 1, [2]],
  [9, 6, [1, 3]],
];

// Every clue cell holds a clue, never shaded.
const clueGivens = tapaClues.map(
  ([row, col]) => new Given(makeCellId(row, col), UNSHADED));

// Wall connectivity: the shaded cells form one non-empty orthogonally
// connected region.
const connectivity = new ConnectedValues('', [SHADED]);

// No 2x2 all-shaded square anywhere: scan every overlapping 2x2 window and
// reject only once all four cells seen are shaded.
const noAllShaded2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const shaded = value === SHADED ? 1 : 0;
    const next = [...seen, shaded];
    if (next.length < 4) return { seen: next };
    const allShaded = next.every(v => v === 1);
    return allShaded ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noAllShaded2x2 = graph.makeReplicate(
  new NFA(noAllShaded2x2Machine, 'no-all-shaded-2x2',
    ...graph.block(gridCells[0], 2, 2)),
  blockOrigins);

// Tapa ring clue: the eight neighbours in clockwise order starting at N, so
// consecutive list entries are adjacent around the circle. An off-grid step
// yields null (only the four clue cells sitting on the grid's left/right
// edge lose ring positions this way).
const CLOCKWISE_KING_STEPS = [
  [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1],
];
function ring(cell) {
  return CLOCKWISE_KING_STEPS.map(([dRow, dCol]) => graph.step(cell, dRow, dCol));
}

// Every 8-bit shaded(1)/unshaded(0) pattern around a ring whose cyclic
// run-length multiset of shaded bits equals `lengths` exactly. A gap of >=1
// unshaded cell between runs falls out of "run" meaning maximal, so the
// rules' "at least one unshaded cell between groups" needs no separate
// check.
function tapaRingPatterns(lengths) {
  const n = 8;
  const wanted = [...lengths].sort((a, b) => a - b);
  const patterns = [];
  for (let mask = 0; mask < (1 << n); mask++) {
    const bits = Array.from({ length: n }, (_, i) => (mask >> i) & 1);
    let runs;
    if (bits.every(b => b === 1)) {
      runs = [n];
    } else if (bits.every(b => b === 0)) {
      runs = [];
    } else {
      const zeroIdx = bits.indexOf(0);
      const rotated = [...bits.slice(zeroIdx), ...bits.slice(0, zeroIdx)];
      runs = [];
      let i = 0;
      while (i < n) {
        if (rotated[i] === 1) {
          let j = i;
          while (j < n && rotated[j] === 1) j++;
          runs.push(j - i);
          i = j;
        } else {
          i++;
        }
      }
    }
    const got = [...runs].sort((a, b) => a - b);
    if (got.length === wanted.length && got.every((v, i) => v === wanted[i])) {
      patterns.push(bits);
    }
  }
  return patterns;
}

// `ringCells` may hold null for an off-grid position (edge clue cells): keep
// only patterns that force those positions unshaded (bit 0), then emit a
// Given for the real cells only -- there is nothing to constrain off-grid.
function tapaClueConstraint(cell, lengths) {
  const ringCells = ring(cell);
  const patterns = tapaRingPatterns(lengths).filter(
    bits => ringCells.every((c, i) => c !== null || bits[i] === 0));
  return new Or(patterns.map(bits => new And(
    ringCells
      .map((c, i) => (c === null ? null : new Given(c, bits[i] ? SHADED : UNSHADED)))
      .filter(Boolean)
  )));
}

const tapaRingConstraints = tapaClues.map(
  ([row, col, lengths]) => tapaClueConstraint(makeCellId(row, col), lengths));

return [
  SHAPE,
  ...clueGivens,
  connectivity,
  noAllShaded2x2,
  ...tapaRingConstraints,
];
