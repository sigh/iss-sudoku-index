// Title: Numbered Regions
// Author: Jesper
// Video: https://www.youtube.com/watch?v=8cVWUjV4Ps8
// Source: https://app.crackingthecryptic.com/sudoku/Hf9QqQMD7J

// Chaos construction: the nine 9-cell sudoku regions (orthogonally
// connected) are not drawn and must be discovered by the solver.
// Region numbers: the digit at a region's top-left cell (the leftmost cell
// in its highest row) is that region's number; the nine region numbers are
// all different.
// Pointing arrows: a cell holding digit X and marked with an arrow sits in
// some region numbered N; the cell X steps away in the arrow's direction
// belongs to the region numbered N+1. Not all possible arrows are given, so
// an absent arrow implies nothing.

const graph = cellGraph('9x9');

// CC#: Chaos Construction's own region-label overlay (one label 1-9 per
// grid cell, shared by every cell of a region).
const cc = graph.makeOverlay('CC');
// RN#: this puzzle's "region number" overlay -- the digit at a cell's
// region's top-left cell, forced equal for every cell of that region below.
const rn = graph.makeOverlay('VN');

// --- Deriving RN from CC and the grid digits --------------------------
//
// regionNumberSync (one NFA per orthogonally-adjacent cell pair): whenever
// two neighbours share a CC label -- i.e. are proven co-regional -- they
// must share the same RN. Chaos Construction regions are connected, so
// applying this to every adjacent pair propagates a single RN value across
// each whole region.
//
// topLeftPins (one NFA over the whole grid, row-major order): tracks the
// highest CC label seen so far while scanning top row left-to-right, then
// the next row, and so on. A cell whose CC label exceeds that running
// maximum is -- by the solver's canonical first-occurrence-order labelling
// of Chaos Construction regions -- the first such cell in row-major order,
// i.e. exactly the rule's "leftmost cell in the highest row" of its region.
// At such a cell RN is pinned to equal the grid digit; every other cell is
// left unconstrained here (regionNumberSync propagates the pinned value to
// it instead).

const regionNumberSyncSpec = NFA.encodeSpec({
  // Reads [CC(a), RN(a), CC(b), RN(b)] for one adjacent pair (a, b).
  startState: { phase: 0 },
  transition(state, value) {
    switch (state.phase) {
      case 0: return { phase: 1, ccA: value };
      case 1: return { phase: 2, ccA: state.ccA, rnA: value };
      case 2: return { phase: 3, ccA: state.ccA, rnA: state.rnA, ccB: value };
      case 3:
        if (state.ccA === state.ccB && state.rnA !== value) return undefined;
        return { phase: 0 };
    }
  },
  accept: (state) => state.phase === 0,
}, 9);

const adjacentPairs = graph.cells().flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  return [right, down].filter(Boolean).map(nb => [cell, nb]);
});

const regionNumberSync = adjacentPairs.map(([a, b]) =>
  new NFA(regionNumberSyncSpec, 'RegionNumberSync',
    cc.at(a), rn.at(a), cc.at(b), rn.at(b)));

const topLeftPinSpec = NFA.encodeSpec({
  // Reads [CC(1), value(1), RN(1), CC(2), value(2), RN(2), ...] for every
  // grid cell in row-major order.
  startState: { phase: 0, maxSeen: 0 },
  transition(state, value) {
    switch (state.phase) {
      case 0: {
        const isTopLeft = value > state.maxSeen;
        return { phase: 1, maxSeen: Math.max(state.maxSeen, value), isTopLeft };
      }
      case 1:
        return {
          phase: 2, maxSeen: state.maxSeen, isTopLeft: state.isTopLeft,
          digit: value,
        };
      case 2:
        if (state.isTopLeft && value !== state.digit) return undefined;
        return { phase: 0, maxSeen: state.maxSeen };
    }
  },
  accept: (state) => state.phase === 0,
}, 9);

const rowMajorTriples = graph.cells().flatMap(cell => [cc.at(cell), cell, rn.at(cell)]);
const topLeftPins = new NFA(topLeftPinSpec, 'TopLeftPins', ...rowMajorTriples);

// All nine region numbers differ: equivalently (RN is constant across each
// 9-cell region, and there are nine regions) every digit 1-9 appears in the
// RN layer exactly nine times -- one run of nine per region.
const distinctRegionNumbers = new ContainExact(
  Array.from({ length: 9 }, (_, d) => Array(9).fill(d + 1)).flat().join('_'),
  ...rn.cells());

// --- Pointing arrows ------------------------------------------------------
//
// Each entry is [control cell, row step, col step], decoded from a small
// triangular arrowhead mark drawn near one edge/corner of its host cell; the
// mark's apex (the point farthest from the shaft) gives the direction. Two
// cells (R3C3, R3C4) each carry two arrows pointing in opposite directions.
const ARROWS = [
  ['R1C1', 1, 1],
  ['R1C6', 0, -1],
  ['R2C9', 0, -1],
  ['R2C3', 1, 0],
  ['R3C3', 0, -1],
  ['R3C4', 0, -1],
  ['R3C3', 0, 1],
  ['R3C4', 0, 1],
  ['R3C2', 1, 1],
  ['R4C1', 1, 1],
  ['R5C1', -1, 1],
  ['R4C4', 1, -1],
  ['R7C4', 0, 1],
  ['R7C7', 0, -1],
  ['R7C9', 0, -1],
  ['R8C2', 1, 1],
  ['R8C3', 0, 1],
  ['R8C8', -1, 0],
  ['R9C9', -1, 0],
];

// Reads [digit(control), RN(control), RN(target_1), RN(target_2), ...],
// where target_v is the cell v steps away along the arrow. Only the target
// at the position matching the control digit is constrained (to
// RN(control) + 1); a digit whose target would fall off the grid has no
// target token at all and is therefore left unconstrained by this NFA.
const arrowStepSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition(state, value) {
    if (state.phase === 0) return { phase: 1, distance: value };
    if (state.phase === 1) {
      return { phase: 2, distance: state.distance, base: value, pos: 0 };
    }
    const pos = state.pos + 1;
    if (pos === state.distance && value !== state.base + 1) return undefined;
    return { phase: 2, distance: state.distance, base: state.base, pos };
  },
  accept: (state) => state.phase !== 0,
  // Longest sequence is [digit, RN, RN_1, ..., RN_8] = 10 tokens (max
  // in-grid step count from a corner is 8).
  maxDepth: 10,
}, 9);

const arrowConstraints = ARROWS.map(([cellId, dr, dc]) => {
  const { row, col } = parseCellId(cellId);
  const targets = [];
  for (let v = 1; ; v++) {
    const r = row + v * dr, c = col + v * dc;
    if (r < 1 || r > 9 || c < 1 || c > 9) break;
    targets.push(makeCellId(r, c));
  }
  return new NFA(arrowStepSpec, 'PointingArrow',
    cellId, rn.at(cellId), ...rn.at(targets));
});

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  rn.toVar('regionNumber'),
  ...regionNumberSync,
  topLeftPins,
  distinctRegionNumbers,
  ...arrowConstraints,
];
