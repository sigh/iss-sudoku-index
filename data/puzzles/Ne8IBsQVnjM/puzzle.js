// Title: Killer Cave
// Author: udukos
// Video: https://www.youtube.com/watch?v=Ne8IBsQVnjM
// Source: https://app.crackingthecryptic.com/sudoku/H3Jt9J2fdg
//
// Rules encoded, in the order they appear in the rules text:
//   * normal sudoku (default row/column/box AllDifferent, standard 3x3
//     boxes);
//   * every cell is a wall or a cave cell (the VC overlay);
//   * walls are orthogonally connected to the edge of the grid, and the
//     cave is one orthogonally connected area;
//   * a clue cell must be part of the cave;
//   * a clue is the sum of the digits seen looking N/S/E/W from that cell,
//     counting its own digit once, with walls blocking sight (a wall's own
//     digit is not seen, and nothing past it is either);
//   * within a clue's field of vision, digits may not repeat.
//
// Clue coordinates below are the top-left-corner text overlay positions
// drawn on the board.

const WALL = 1, CAVE = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const cave = graph.makeOverlay('VC');           // WALL / CAVE
const caveVar = cave.toVar('cave');
const caveDomain = cave.makeReplicate(
  new Given(cave.cells()[0], WALL, CAVE));

// --- Wall / cave partition --------------------------------------------

const caveConnected = new ConnectedValues('VC', CAVE);

// "Walls are orthogonally connected to the edge of the grid" says no wall
// component is sealed off by the cave, i.e. the cave (already forced to be
// one connected region by ConnectedValues above) has no holes. That is the
// Euler-characteristic identity for a set with 8-connected components and a
// 4-connected complement: summing a local weight over the 10x10 lattice
// corners gives 4 * (cave components - enclosed wall components), so the
// sum must be 4. At a corner, over its four surrounding cells (off-grid
// cells counted as wall), the weight is +1 for one cave cell, -1 for three,
// -2 for two cave cells placed diagonally, and 0 otherwise. Identical
// construction to Fogrotto (Dvu3m3GMM0w), whose notes record the
// exhaustive check of this identity over 77535 small shadings.
const CORNER_OFFSET = 2;    // weights are -2..+1; cells hold weight + offset
const corners = new Var('E', 'cave corner weight', '10x10');
const outside = new Var('O', 'off-grid cell', 1);
const outsideCell = outside.cell(1);

const cornerWeightMachine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: (state, value) => {
    if (state.done === true) return undefined;   // the weight cell is last
    if (state.seen.length < 4) {
      if (value !== WALL && value !== CAVE) return undefined;
      return { seen: [...state.seen, value] };
    }
    const [tl, tr, bl, br] = state.seen.map(v => v === CAVE ? 1 : 0);
    const count = tl + tr + bl + br;
    const diagonal = (tl && br) || (tr && bl);
    const weight = count === 1 ? 1
      : count === 3 ? -1
        : (count === 2 && diagonal) ? -2 : 0;
    return value === weight + CORNER_OFFSET ? { done: true } : undefined;
  },
  accept: (state) => state.done === true,
}, geometry);

// Lattice corner (r, c) for r, c in 1..10 sits above-left of grid cell RrCc.
const latticeIndices = Array.from({ length: 10 }, (_, i) => i + 1);
const cornerAt = (r, c) => {
  const inGrid = (row, col) => row >= 1 && row <= 9 && col >= 1 && col <= 9;
  const window = [[r - 1, c - 1], [r - 1, c], [r, c - 1], [r, c]].map(
    ([row, col]) => inGrid(row, col)
      ? caveVar.cell(row, col) : outsideCell);
  return {
    cell: corners.cell(r, c),
    rule: new NFA(cornerWeightMachine, 'corner-weight',
      ...window, corners.cell(r, c)),
  };
};
const cornerRules = latticeIndices.flatMap(
  r => latticeIndices.map(c => cornerAt(r, c)));
const noEnclosedWalls = new Sum(
  4 + CORNER_OFFSET * cornerRules.length, ...cornerRules.map(c => c.cell));

// --- Vision clues --------------------------------------------------------

// Cell -> printed clue value, from the top-left-corner text overlays.
const CLUES = {
  R1C1: 41, R1C3: 31, R1C9: 42,
  R2C5: 16,
  R3C7: 13,
  R4C5: 6,
  R5C2: 12, R5C8: 26,
  R7C2: 12, R7C7: 10,
  R8C4: 21,
  R9C1: 37, R9C7: 23, R9C9: 43,
};
const clueCells = Object.keys(CLUES);

const clueIsCave = clueCells.map(cell => new Given(cave.at(cell), CAVE));

// North, south, east, west rays from a clue cell, nearest cell first,
// excluding the clue cell itself. Off-grid directions (a clue on a border
// or corner) give an empty ray, which contributes nothing to the NFAs
// below via an empty (but still present) segment.
const NORTH = [-1, 0], SOUTH = [1, 0], EAST = [0, 1], WEST = [0, -1];
const rayCells = (cell, [dr, dc]) => graph.ray(cell, dr, dc).slice(1);

// Sum NFA: clue's own digit (segment 0, no flag needed -- clueIsCave above
// already pins it to CAVE) plus each of the four direction rays (segment
// per direction, interleaved digit/flag). A ray keeps consuming after its
// first wall (so segment boundaries stay fixed) but only counts cells
// before it; the running sum is clamped at target+1 (a dead sink) so the
// state stays small regardless of how many further cells remain.
function visionSumSpec(target) {
  return NFA.encodeSpec({
    startState: { sum: 0, blocked: false, pendingDigit: null, sawOwn: false },
    transition: (state, value) => {
      const { sum, blocked, pendingDigit, sawOwn } = state;
      // A SEGMENT_BREAK falls between every pair of segments -- including
      // between the own-digit segment and the first ray -- so it must be
      // checked before any consuming branch.
      if (value === SEGMENT_BREAK) {
        return { sum, blocked: false, pendingDigit: null, sawOwn: true };
      }
      if (!sawOwn) {
        // Own-cell segment: a single digit, no flag.
        if (sum + value > target) return undefined;
        return { sum: sum + value, blocked, pendingDigit: null, sawOwn };
      }
      if (pendingDigit === null) {
        return { sum, blocked, pendingDigit: value, sawOwn };
      }
      const digit = pendingDigit;
      if (blocked) return { sum, blocked, pendingDigit: null, sawOwn };
      if (value === WALL) {
        return { sum, blocked: true, pendingDigit: null, sawOwn };
      }
      // CAVE: this ray cell is seen.
      if (sum + digit > target) return undefined;
      return { sum: sum + digit, blocked, pendingDigit: null, sawOwn };
    },
    accept: ({ sum }) => sum === target,
  }, geometry, { multiSegment: true });
}

const visionSums = clueCells.map(cell => new NFA(
  visionSumSpec(CLUES[cell]), 'vision-sum',
  [cell],
  ...[NORTH, SOUTH, EAST, WEST].flatMap(dir =>
    [rayCells(cell, dir).flatMap(c => [c, cave.at(c)])]),
));

// Distinctness: "within a clue's field of vision, digits may not repeat."
// The clue's own cell and its N/S ray share its column, and its own cell
// and its E/W ray share its row, so those pairs are already forced distinct
// by ordinary sudoku row/column AllDifferent, as is N vs S (same column)
// and E vs W (same row). The only residual possibility is one visible N/S
// cell and one visible E/W cell showing the same digit -- a cross-group
// repeat. Rather than carry a seen-digit bitmask (which multiplies state
// count far past the compiled-state cap), fix the digit d in the closure
// and build one small NFA per (clue, d in 1-9): scan the vertical rays
// (N, S) tracking only whether d was seen, then the horizontal rays (E, W)
// the same way, and reject only if d turned up in both groups.
function visionDistinctSpec(d) {
  return NFA.encodeSpec({
    startState: { group: 0, open: true, pendingDigit: null, sawV: false, sawH: false },
    transition: (state, value) => {
      const { group, open, pendingDigit, sawV, sawH } = state;
      if (value === SEGMENT_BREAK) {
        // Clamp: only "< 2 or not" (vertical vs horizontal segment) is ever
        // inspected, and only 4 segments are ever actually supplied, so the
        // counter has no need to climb past that -- but the compiler
        // explores the spec's abstract state space over arbitrarily many
        // SEGMENT_BREAKs, so leaving it unclamped blows the state cap.
        return { group: Math.min(group + 1, 4), open: true, pendingDigit: null, sawV, sawH };
      }
      if (pendingDigit === null) {
        return { group, open, pendingDigit: value, sawV, sawH };
      }
      const digit = pendingDigit;
      if (!open) return { group, open, pendingDigit: null, sawV, sawH };
      if (value === WALL) {
        return { group, open: false, pendingDigit: null, sawV, sawH };
      }
      // CAVE: this ray cell is seen. Segments 0,1 are N,S (vertical);
      // segments 2,3 are E,W (horizontal).
      const isD = digit === d;
      const vertical = group < 2;
      return {
        group, open, pendingDigit: null,
        sawV: sawV || (vertical && isD),
        sawH: sawH || (!vertical && isD),
      };
    },
    accept: ({ sawV, sawH }) => !(sawV && sawH),
  }, geometry, { multiSegment: true });
}

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const visionDistinct = clueCells.flatMap(cell => {
  const rays = [NORTH, SOUTH, EAST, WEST].map(
    dir => rayCells(cell, dir).flatMap(c => [c, cave.at(c)]));
  return DIGITS.map(d => new NFA(
    visionDistinctSpec(d), 'vision-distinct', ...rays));
});

return [
  new Shape('9x9'),
  caveVar,
  caveDomain,
  corners,
  outside,
  new Given(outsideCell, WALL),
  caveConnected,
  ...cornerRules.map(c => c.rule),
  noEnclosedWalls,
  ...clueIsCave,
  ...visionSums,
  ...visionDistinct,
];
