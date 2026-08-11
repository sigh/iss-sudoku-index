// Title: Tapa Sudoku
// Author: Serkan Yurekli
// Video: https://www.youtube.com/watch?v=-Lq56X0NsGg
// Source: https://app.crackingthecryptic.com/sudoku/L64LJ4LQ4t

// Rules encoded:
// - Shade some empty cells grey to form a single orthogonally-connected wall
//   (Tapa's own convention for "wall": ISS's ConnectedValues is orthogonal-only,
//   which is the only reading a Tapa constraint ever uses).
// - Shaded cells never form a 2x2 square anywhere in the grid (every
//   overlapping window, not just an aligned tiling).
// - A circled cell's printed number(s) give the run-lengths of consecutive
//   shaded cells among its up-to-eight neighbours, read circularly; multiple
//   numbers require >=1 unshaded neighbour between the runs they name. Every
//   circled cell in this puzzle is strictly interior (row/col 2-13), so all
//   seven clued circles keep the full 8-neighbour ring -- no boundary
//   truncation to model.
// - Every circled cell holds a digit (so is never shaded). "The digits in
//   circles are valid clues for Tapa and pencilmark clues for sudoku": a
//   circle's printed number(s) also restrict that very cell's own sudoku
//   digit to one of them (its "pencilmarks"). "You should place one or more
//   digits in the empty circles" / "all possible circled cells may not be
//   given" describe the human solving aid of writing in more Tapa clues on
//   blank circles; they add no constraint an un-clued circle does not already
//   have (still unshaded, digit otherwise free) and are not encoded further.
// - All unshaded cells contain the digits 1-7 in each row and column. Grid
//   has no stated box regions, so this is a Raw grid: rows/columns are
//   asserted explicitly, and (as with ordinary Sudoku's "digits 1-N" phrasing)
//   "contain all digits 1-7" is read as each of 1-7 exactly once, which forces
//   exactly 7 unshaded (and so 7 shaded) cells per row/column.
//
// Model: a single grid layer, value range 0-7, where 0 means "shaded" and
// 1-7 is the cell's sudoku digit when unshaded. This lets one ContainExact
// per row/column state both the 7-shaded/7-unshaded split and the digit
// permutation in one constraint, and lets ConnectedValues([0]) state wall
// connectivity directly on the main grid -- no separate shade Var layer
// needed.

const SHAPE = new Shape('14x14', '0-7', 'Raw');
const graph = cellGraph(SHAPE);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Circled cells with a single given sudoku digit (no printed Tapa number).
// [row, col] (1-based) and values read from the puzzle's own given-digit
// cells; ids built with makeCellId since row/col run past 9 on this 14x14
// grid.
const digitGivens = [
  [1, 10, 2], [2, 2, 4], [2, 7, 7], [4, 4, 4], [5, 2, 7],
  [6, 12, 5], [9, 8, 4], [10, 13, 2], [12, 10, 7], [13, 2, 2],
];

// Circled cells carrying two printed Tapa numbers (two text overlays sharing
// one circle underlay). The pair also pencil-marks the cell's own sudoku
// digit to one of the two values.
const tapaClues = [
  [3, 7, [4, 2]],
  [7, 6, [4, 1]],
  [10, 9, [4, 1]],
  [10, 2, [4, 1]],
  [13, 11, [4, 2]],
  [8, 10, [2, 1]],
  [4, 12, [1, 1]],
];

// Every other drawn circle: forced unshaded, digit otherwise unconstrained.
const blankCircles = [
  [1, 1], [3, 1], [3, 2], [3, 4], [2, 5], [4, 10], [5, 5], [5, 6], [6, 7],
  [6, 11], [7, 1], [7, 5], [8, 11], [9, 4], [9, 3], [10, 6], [10, 10],
  [11, 3], [12, 4], [12, 13], [13, 8], [14, 5], [14, 14],
];

const circleGivens = [
  ...digitGivens.map(([row, col, value]) => new Given(makeCellId(row, col), value)),
  ...tapaClues.map(([row, col, values]) => new Given(makeCellId(row, col), ...values)),
  ...blankCircles.map(([row, col]) => new Given(makeCellId(row, col), 1, 2, 3, 4, 5, 6, 7)),
];

// Row/column rule: exactly 7 shaded (0) cells and exactly one each of 1-7,
// tying the shading count and the digit permutation together.
const rowColValueStr = [0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7].join('_');
const rowColRules = [...graph.rows(), ...graph.columns()]
  .map(cells => new ContainExact(rowColValueStr, ...cells));

// Wall connectivity: the shaded (0) cells form one non-empty orthogonally
// connected region.
const connectivity = new ConnectedValues('', [0]);

// No 2x2 all-shaded square anywhere: scan every overlapping 2x2 window
// (not the sudoku's non-existent boxes) and reject only once all four cells
// seen are shaded.
const noAllShaded2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const shaded = value === 0 ? 1 : 0;
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
// consecutive list entries are adjacent around the circle.
const CLOCKWISE_KING_STEPS = [
  [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1],
];
function ring(cell) {
  return CLOCKWISE_KING_STEPS.map(([dRow, dCol]) => graph.step(cell, dRow, dCol));
}

// Every 8-bit shaded(1)/unshaded(0) pattern around a ring whose cyclic
// run-length multiset of shaded bits equals `lengths` exactly. A gap of >=1
// unshaded cell between runs falls out of "run" meaning maximal, so the
// rules' "at least one white cell between groups" needs no separate check.
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

function tapaClueConstraint(cell, lengths) {
  const ringCells = ring(cell);
  const patterns = tapaRingPatterns(lengths);
  return new Or(patterns.map(bits => new And(
    ringCells.map((c, i) => new Given(c, ...(bits[i] ? [0] : [1, 2, 3, 4, 5, 6, 7])))
  )));
}

const tapaRingConstraints = tapaClues.map(
  ([row, col, lengths]) => tapaClueConstraint(makeCellId(row, col), lengths));

return [
  SHAPE,
  ...circleGivens,
  ...rowColRules,
  connectivity,
  noAllShaded2x2,
  ...tapaRingConstraints,
];
