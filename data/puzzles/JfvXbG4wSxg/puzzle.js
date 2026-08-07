// Title: Castle Woku
// Author: Wessel Strijkstra
// Video: https://www.youtube.com/watch?v=JfvXbG4wSxg
// Source: https://app.crackingthecryptic.com/sudoku/b6tTH63QF9

// Rules encoded here, in the order the constraints appear below:
//  - Normal sudoku.
//  - A single non-intersecting loop runs through the centres of some cells.
//  - The loop may not enter the ten cells holding a coloured square.
//  - Green squares lie inside the loop, black squares outside; grey squares may
//    be either, so they get no inside/outside constraint.
//  - The digit in a coloured square is the number of times the loop cuts a cell
//    border in one direction (north/south/east/west) from that square. Two
//    squares have the direction drawn as an arrow; for the other eight the
//    direction is unknown, so the clue is a disjunction over all four.
//  - A clue outside a row/column sums the digits of the horizontal/vertical loop
//    segment closest to that clue, including the two cells where the loop turns.
// No rule is omitted.

// --- Loop shape layer (VS): which of a cell's four edges the loop uses.
const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];

// --- Loop orientation layer (VD): which single edge the loop leaves by, once an
// arbitrary travel direction is chosen. Orientation is not part of the puzzle;
// it exists only so the position counters below can be defined.
const D_NONE = 1, D_UP = 2, D_RIGHT = 3, D_DOWN = 4, D_LEFT = 5;
const ALL_DIRS = [D_NONE, D_UP, D_RIGHT, D_DOWN, D_LEFT];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

const shape = graph.makeOverlay('VS');
const dir = graph.makeOverlay('VD');

// Position counters, one layer per modulus (see "single loop" below). The
// moduli are pairwise coprime and their lcm (280) exceeds the longest possible
// loop, which is at most the 71 cells that are not coloured squares.
const COUNTERS = [
  { overlay: graph.makeOverlay('VA'), label: 'pos mod 5', mod: 5 },
  { overlay: graph.makeOverlay('VB'), label: 'pos mod 7', mod: 7 },
  { overlay: graph.makeOverlay('VC'), label: 'pos mod 8', mod: 8 },
];
// Each layer holds 1..mod for a loop cell plus one sentinel for an off-loop cell.
const sentinelOf = mod => mod + 1;

// A step to an orthogonal neighbour, with the shape predicate for "the loop uses
// the edge crossed by this step" and the orientation codes for both endpoints.
const STEPS = [
  { dR: -1, dC: 0, code: D_UP, back: D_DOWN, uses: usesUp },
  { dR: 1, dC: 0, code: D_DOWN, back: D_UP, uses: usesDown },
  { dR: 0, dC: -1, code: D_LEFT, back: D_RIGHT, uses: usesLeft },
  { dR: 0, dC: 1, code: D_RIGHT, back: D_LEFT, uses: usesRight },
];
// Right and down cover every orthogonal pair exactly once.
const PAIR_STEPS = STEPS.filter(s => s.code === D_RIGHT || s.code === D_DOWN);

const memo = (fn) => {
  const m = new Map();
  return (...args) => {
    const k = JSON.stringify(args);
    if (!m.has(k)) m.set(k, fn(...args));
    return m.get(k);
  };
};

// --- Drawn clues, transcribed from the puzzle's coloured squares and the
// numbers printed outside the grid.
const GREEN = ['R3C3', 'R8C2'];
const GREY = ['R2C5', 'R2C8', 'R5C8', 'R7C7', 'R8C5'];
const BLACK = ['R4C6', 'R6C4', 'R5C2'];
const COLOURED = [...GREEN, ...GREY, ...BLACK];
// The two coloured squares that also carry a drawn arrow, with its direction.
const DRAWN_ARROWS = { R8C2: D_RIGHT, R5C2: D_UP };
// Outside clues: [lane cells nearest-first, clue value].
const OUTSIDE_CLUES = [
  [graph.row(5), 12], [graph.row(6), 12],                       // left of R5, R6
  ...[[3, 17], [5, 11], [6, 20], [8, 10], [9, 13]]              // right of R3..R9
    .map(([r, v]) => [[...graph.row(r)].reverse(), v]),
  ...[[1, 11], [3, 6], [6, 18], [7, 8]]                         // above C1..C7
    .map(([c, v]) => [graph.column(c), v]),
  ...[[3, 6], [4, 18], [7, 9]]                                  // below C3, C4, C7
    .map(([c, v]) => [[...graph.column(c)].reverse(), v]),
];

// --- Shape domains: a cell may only take a shape whose edges stay on the grid.
const shapeDomains = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new Given(shape.at(cell), ...ALL_SHAPES.filter(s =>
    !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
    !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s))));
});

// --- Edge agreement: neighbours agree about their shared edge, which is what
// makes the per-cell shapes join up into closed loops. Reads the two shapes;
// `toB`/`toA` say whether each uses the shared edge.
const edgeAgree = memo((stepCode) => {
  const step = STEPS.find(s => s.code === stepCode);
  const back = STEPS.find(s => s.code === step.back);
  return Pair.fnToKey((a, b) => step.uses(a) === back.uses(b), numValues);
});

// --- Orientation: each edge the loop uses is left by exactly one of its two
// cells, so every loop cell has one outgoing and one incoming edge.
// Reads [shape(A), dir(A), dir(B)].
const orientOne = memo((stepCode) => {
  const step = STEPS.find(s => s.code === stepCode);
  return NFA.encodeSpec({
    startState: { phase: 0 },
    transition: (state, value) => {
      if (state.phase === 0) return { phase: 1, used: step.uses(value) };
      if (state.phase === 1) {
        return { phase: 2, used: state.used, aOut: value === step.code };
      }
      const bOut = value === step.back;
      if (!state.used) return { done: true };
      return state.aOut !== bOut ? { done: true } : undefined;
    },
    accept: ({ done }) => done === true,
  }, numValues);
});

// dir(X) names an edge that shape(X) actually uses, and is D_NONE exactly off
// the loop.
const dirMatchesShape = Pair.fnToKey((s, d) => {
  const step = STEPS.find(st => st.code === d);
  return s === OFF ? d === D_NONE : !!step && step.uses(s);
}, numValues);

// --- Single loop. Shapes plus edge agreement give a disjoint union of closed
// loops; orientation turns that into a disjoint union of directed cycles. The
// counters then rule out every cycle but one: each cell's counter is its
// predecessor's plus one, modulo the layer's modulus, except at one seam cell,
// so a cycle avoiding the seam would need a length divisible by all three
// moduli. The seam is R8C1, which the green square at R8C2 forces onto the loop
// (see the inside/outside parity constraint below), and its outgoing edge is
// pinned north to fix the otherwise free travel direction.
const SEAM = 'R8C1';
// Reads [dir(A), dir(B), counter(A), counter(B)] for one neighbouring pair.
const counterRule = memo((stepCode, mod, seamIsA, seamIsB) => {
  const step = STEPS.find(s => s.code === stepCode);
  return NFA.encodeSpec({
    startState: { phase: 0 },
    transition: (state, value) => {
      if (state.phase === 0) return { phase: 1, aToB: value === step.code };
      if (state.phase === 1) {
        return { phase: 2, aToB: state.aToB, bToA: value === step.back };
      }
      if (state.phase === 2) {
        return { phase: 3, aToB: state.aToB, bToA: state.bToA, countA: value };
      }
      if (state.aToB && !seamIsB && value !== (state.countA % mod) + 1) return undefined;
      if (state.bToA && !seamIsA && state.countA !== (value % mod) + 1) return undefined;
      return { done: true };
    },
    accept: ({ done }) => done === true,
  }, numValues);
});

const loopStructure = [
  shape.toVar('loop shape'),
  dir.toVar('loop direction'),
  ...COUNTERS.map(({ overlay, label }) => overlay.toVar(label)),
  ...shapeDomains,
  dir.makeReplicate(new Given(dir.cells()[0], ...ALL_DIRS)),
  ...COUNTERS.map(({ overlay, mod }) => overlay.makeReplicate(new Given(
    overlay.cells()[0],
    ...Array.from({ length: sentinelOf(mod) }, (_, i) => i + 1)))),
  ...gridCells.map(cell => new Pair(
    dirMatchesShape, 'dir-shape', shape.at(cell), dir.at(cell))),
  ...PAIR_STEPS.map(step => shape.makeReplicate(
    new Pair(edgeAgree(step.code), 'edge',
      ...shape.at(['R1C1', graph.step('R1C1', step.dR, step.dC)])),
    shape.at(gridCells.filter(c => graph.step(c, step.dR, step.dC))))),
  ...gridCells.flatMap(cell => PAIR_STEPS.flatMap(step => {
    const other = graph.step(cell, step.dR, step.dC);
    if (!other) return [];
    return [
      new NFA(orientOne(step.code), 'orient',
        shape.at(cell), ...dir.at([cell, other])),
      ...COUNTERS.map(({ overlay, mod }) => new NFA(
        counterRule(step.code, mod, cell === SEAM, other === SEAM), 'pos',
        ...dir.at([cell, other]), ...overlay.at([cell, other]))),
    ];
  })),
  // Off-loop cells hold the sentinel, loop cells hold a real counter value.
  ...COUNTERS.flatMap(({ overlay, mod }) => {
    const key = Pair.fnToKey(
      (s, c) => (s === OFF) === (c === sentinelOf(mod)), numValues);
    return gridCells.map(cell => new Pair(
      key, 'pos-off', shape.at(cell), overlay.at(cell)));
  }),
  new ConnectedValues('VS', ALL_SHAPES.filter(s => s !== OFF)),
  new Given(dir.at(SEAM), D_UP),
  ...COUNTERS.map(({ overlay }) => new Given(overlay.at(SEAM), 1)),
];

// --- The loop may not enter a coloured square.
const colouredCellsOffLoop = COLOURED.map(
  cell => new Given(shape.at(cell), OFF));

// --- Inside/outside. A ray cast west from a cell just above its centre line
// meets the loop only where a cell of that row uses its north edge, so the loop
// encloses the cell exactly when that count, over the cells from column 1 up to
// and including it, is odd.
const parity = memo((want) => NFA.encodeSpec({
  startState: { p: 0 },
  transition: ({ p }, value) => ({ p: (p + (usesUp(value) ? 1 : 0)) % 2 }),
  accept: ({ p }) => p === want,
}, numValues));
const insideOutside = [
  ...GREEN.map(cell => new NFA(parity(1), 'inside',
    ...shape.at(graph.ray(cell, 0, -1)))),
  ...BLACK.map(cell => new NFA(parity(0), 'outside',
    ...shape.at(graph.ray(cell, 0, -1)))),
];

// --- Coloured square counts. Travelling away from the square in one direction,
// each cell border the loop cuts is a loop edge lying across that border, so the
// count is over the ray cells that use their edge back towards the square.
const borderCount = memo((stepCode) => {
  const step = STEPS.find(s => s.code === stepCode);
  const back = STEPS.find(s => s.code === step.back);
  return NFA.encodeSpec({
    startState: { target: null, count: 0 },
    transition: ({ target, count }, value) => {
      if (target === null) return { target: value, count: 0 };  // the square's digit
      const next = count + (back.uses(value) ? 1 : 0);
      return next > target ? [] : { target, count: next };
    },
    accept: ({ target, count }) => target !== null && count === target,
  }, numValues);
});
const countClue = (cell, step) => new NFA(borderCount(step.code), 'border-count',
  cell, ...shape.at(graph.ray(cell, step.dR, step.dC).slice(1)));
const squareCounts = COLOURED.map(cell => {
  const drawn = DRAWN_ARROWS[cell];
  if (drawn !== undefined) return countClue(cell, STEPS.find(s => s.code === drawn));
  // No arrow is drawn, so the rules leave the direction to be determined.
  return new Or(STEPS.map(step => countClue(cell, step)));
});

// --- Outside clues. Scanning the lane away from the clue, the first cell whose
// shape continues in that direction opens the closest straight loop segment,
// and the segment closes at the first cell after it that does not. Reads the
// lane as alternating [shape, digit] and totals the digits of that segment.
const laneSum = memo((stepCode, target) => {
  const step = STEPS.find(s => s.code === stepCode);
  return NFA.encodeSpec({
    startState: { phase: 'shape', status: 'before', sum: 0 },
    transition: (state, value) => {
      if (state.phase === 'shape') {
        const onward = step.uses(value);
        if (state.status === 'before') {
          return { phase: 'digit', status: onward ? 'in' : 'before', sum: state.sum, take: onward };
        }
        if (state.status === 'in') {
          return { phase: 'digit', status: onward ? 'in' : 'last', sum: state.sum, take: true };
        }
        return { phase: 'digit', status: 'done', sum: state.sum, take: false };
      }
      const sum = state.sum + (state.take ? value : 0);
      if (sum > target) return undefined;
      return { phase: 'shape', status: state.status === 'last' ? 'done' : state.status, sum };
    },
    accept: ({ phase, status, sum }) =>
      phase === 'shape' && status === 'done' && sum === target,
  }, numValues);
});
const outsideSums = OUTSIDE_CLUES.map(([lane, value]) => {
  const from = parseCellId(lane[0]), to = parseCellId(lane[1]);
  const step = STEPS.find(s => s.dR === Math.sign(to.row - from.row)
    && s.dC === Math.sign(to.col - from.col));
  return new NFA(laneSum(step.code, value), 'outside-sum',
    ...lane.flatMap(cell => [shape.at(cell), cell]));
});

return [
  new Shape('9x9'),
  ...loopStructure,
  ...colouredCellsOffLoop,
  ...insideOutside,
  ...squareCounts,
  ...outsideSums,
];
