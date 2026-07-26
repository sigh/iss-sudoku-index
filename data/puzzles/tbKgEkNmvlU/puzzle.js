// Title: The Mysterious Loop
// Author: Die Hard
// Video: https://www.youtube.com/watch?v=tbKgEkNmvlU
// Source: https://sudokupad.app/y5u0ncu31x
//
// Normal sudoku rules apply.
//
// Loop: draw a closed loop between cell centers, king-move (orthogonal or
// diagonal steps), covering no more than 23 distinct cells. The loop visits
// every box except box 5 (R4-6,C4-6), which it must avoid entirely.
// Adjacent digits along the loop differ.
//
// Digit counts: the digit 1 appears on the loop exactly once. The digit
// placed in the circled cell R5C5 appears on the loop exactly twice (R5C5
// is itself in box 5, so it is never a loop cell -- only its eventual value
// is the count target). Every other digit N that appears anywhere on the
// loop appears on the loop exactly N times.
//
// Omitted: "3x3 box borders divide the loop into regions of equal sums" --
// an unknown-partition equal-sum rule over a solver-discovered loop, with no
// faithful ISS primitive.
//
// Omitted: "draw A closed loop" (singular, one loop). The per-cell degree
// links below make every on-loop cell exactly 2-regular, which is necessary
// but not sufficient for a single cycle -- two or more disjoint small closed
// sub-loops can each satisfy degree-2, box coverage in aggregate, and the
// digit-count rules in aggregate. ISS's global-connectivity primitive
// (ConnectedValues) is hardcoded to orthogonal adjacency and is unsound for
// this king-move (orthogonal-or-diagonal) loop, so single-loop connectivity
// is not enforced.
//
// Loop model: one boolean Var per potential king-move edge (four families --
// east, south, south-east, south-west -- cover each of the 8 directions
// exactly once per cell, the reverse 4 directions read off the neighbour's
// own Var) plus one boolean membership Var per grid cell. There is no
// separate "edge agreement" step: each edge has exactly one Var, read from
// both endpoints, so the two cells automatically agree on whether it is
// used.

const OFF = 1, ON = 2;
const BOOL = [OFF, ON];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const boxes = graph.boxes();

const givens = [
  new Given('R1C2', 6), new Given('R1C8', 9),
  new Given('R2C9', 6),
  new Given('R3C5', 8),
  new Given('R4C1', 4), new Given('R4C4', 1),
  new Given('R5C3', 2), new Given('R5C7', 3),
  new Given('R7C5', 6),
  new Given('R8C1', 6),
  new Given('R9C4', 3), new Given('R9C8', 6), new Given('R9C9', 8),
];

// --- Loop membership: one boolean Var per grid cell (ON = on the loop). ---
const membership = graph.makeOverlay('VM');
const memberCell = cell => membership.at(cell);

// --- Edge Vars: one boolean Var per potential king-move edge, one family per
// direction. A family's origin cells are exactly the cells that have a
// neighbour in that direction, so there is no need for a border domain
// restriction -- an edge Var simply doesn't exist off the grid.
const DIR_FAMILIES = [
  { prefix: 'VE', dRow: 0, dCol: 1 },    // east
  { prefix: 'VS', dRow: 1, dCol: 0 },    // south
  { prefix: 'VJ', dRow: 1, dCol: 1 },    // south-east
  { prefix: 'VK', dRow: 1, dCol: -1 },   // south-west
];
const edgeFamilies = DIR_FAMILIES.map(({ prefix, dRow, dCol }) => {
  const origins = gridCells.filter(cell => graph.step(cell, dRow, dCol));
  const overlay = graph.makeOverlay(prefix, origins);
  return { overlay, dRow, dCol, origins };
});

// All (cell, edgeVar, neighbourCell) triples, one per edge, one direction
// only (each edge belongs to exactly one family/origin pair).
const allEdges = edgeFamilies.flatMap(({ overlay, dRow, dCol, origins }) =>
  origins.map(cell => ({
    edgeVar: overlay.at(cell),
    a: cell,
    b: graph.step(cell, dRow, dCol),
  })));

// The (up to 8) edge Vars incident to a cell: its own 4 outgoing directions
// (null when off-grid, filtered out) plus the 4 neighbours' own edge Vars
// that point back at it (east-of-west, south-of-north, se-of-nw, sw-of-ne).
const incidentEdges = cell => {
  const [east, south, se, sw] = edgeFamilies;
  const west = graph.step(cell, 0, -1);
  const north = graph.step(cell, -1, 0);
  const nw = graph.step(cell, -1, -1);
  const ne = graph.step(cell, -1, 1);
  return [
    east.overlay.at(cell), south.overlay.at(cell),
    se.overlay.at(cell), sw.overlay.at(cell),
    west && east.overlay.at(west),
    north && south.overlay.at(north),
    nw && se.overlay.at(nw),
    ne && sw.overlay.at(ne),
  ].filter(Boolean);
};

// --- Degree/membership link: a cell's incident edges sum to 0 (membership
// OFF) or 2 (membership ON); any other total is rejected regardless of
// membership. Memoized per incident-edge count (corners/edges have fewer
// than 8 candidates).
const memo = fn => { const m = new Map(); return k => (m.has(k) ? m : m.set(k, fn(k))).get(k); };
const degreeMachineFor = memo(k => NFA.encodeSpec({
  startState: { i: 0, count: 0 },
  transition: ({ i, count }, value) => {
    if (i < k) return { i: i + 1, count: count + (value === ON ? 1 : 0) };
    // Trailing membership read.
    return (value === ON ? count === 2 : count === 0) ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, geometry.numValues));

const degreeLinks = gridCells.map(cell => {
  const edges = incidentEdges(cell);
  return new NFA(degreeMachineFor(edges.length), 'loop-degree', ...edges, memberCell(cell));
});

// --- Adjacent digits on the loop differ: for each edge, if its Var is ON
// the two endpoint digits must differ. One machine, applied to every edge.
const adjacentDifferMachine = NFA.encodeSpec({
  startState: { phase: 'edge' },
  transition: (state, value) => {
    if (state.phase === 'edge') return { phase: 'a', on: value === ON };
    if (state.phase === 'a') return { phase: 'b', on: state.on, a: value };
    if (!state.on) return { done: true };
    return state.a !== value ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const adjacentDiffer = allEdges.map(({ edgeVar, a, b }) =>
  new NFA(adjacentDifferMachine, 'adjacent-differ', edgeVar, a, b));

// --- Loop length: no more than 23 on-loop cells. Bounded counting NFA over
// every membership Var, saturating once the cap is exceeded.
const CAP = 23;
const loopLengthMachine = NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) =>
    ({ count: Math.min(count + (value === ON ? 1 : 0), CAP + 1) }),
  accept: ({ count }) => count <= CAP,
}, geometry.numValues);
const loopLength = new NFA(loopLengthMachine, 'loop-length', ...membership.at(gridCells));

// --- Box 5 is entirely off the loop: every box-5 cell's membership, and
// every edge incident to a box-5 cell, is forced OFF.
const box5 = boxes[4];
const box5EdgeVars = new Set();
box5.forEach(cell => incidentEdges(cell).forEach(v => box5EdgeVars.add(v)));
const box5Off = [
  ...box5.map(cell => new Given(memberCell(cell), OFF)),
  ...[...box5EdgeVars].map(v => new Given(v, OFF)),
];

// --- Every other box has at least one on-loop cell.
const otherBoxVisited = boxes
  .filter((_, i) => i !== 4)
  .map(box => new ContainAtLeast(String(ON), ...membership.at(box)));

// --- Digit-count rules. Each machine scans every cell's (membership, digit)
// pair in a fixed order; the circle-target machines first read R5C5's own
// digit as the count target.
const CIRCLE = 'R5C5';
const scanArgs = gridCells.flatMap(cell => [memberCell(cell), cell]);

// Digit 1 appears on the loop exactly once.
const digitOneMachine = NFA.encodeSpec({
  startState: { phase: 'mem', count: 0 },
  transition: (state, value) => {
    if (state.phase === 'mem') return { phase: 'digit', count: state.count, pendingOn: value === ON };
    const hit = state.pendingOn && value === 1;
    return { phase: 'mem', count: Math.min(state.count + (hit ? 1 : 0), 2) };
  },
  accept: ({ phase, count }) => phase === 'mem' && count === 1,
}, geometry.numValues);
const digitOne = new NFA(digitOneMachine, 'digit-one-count', ...scanArgs);

// The circled digit (R5C5's value) appears on the loop exactly twice.
const circleCountMachine = NFA.encodeSpec({
  startState: { phase: 'target' },
  transition: (state, value) => {
    if (state.phase === 'target') return { phase: 'mem', target: value, count: 0 };
    if (state.phase === 'mem') {
      return { phase: 'digit', target: state.target, count: state.count, pendingOn: value === ON };
    }
    const hit = state.pendingOn && value === state.target;
    return { phase: 'mem', target: state.target, count: Math.min(state.count + (hit ? 1 : 0), 3) };
  },
  accept: ({ phase, count }) => phase === 'mem' && count === 2,
}, geometry.numValues);
const circleCount = new NFA(circleCountMachine, 'circle-digit-count', CIRCLE, ...scanArgs);

// Every other digit N (i.e. not 1, and not the circled digit) that appears
// on the loop at all appears on it exactly N times. Deferred to the machine
// above whenever this N happens to equal the circled digit.
const otherDigitMachineFor = memo(d => NFA.encodeSpec({
  startState: { phase: 'target' },
  transition: (state, value) => {
    if (state.phase === 'target') return { phase: 'mem', target: value, count: 0 };
    if (state.phase === 'mem') {
      return { phase: 'digit', target: state.target, count: state.count, pendingOn: value === ON };
    }
    const hit = state.pendingOn && value === d;
    return { phase: 'mem', target: state.target, count: Math.min(state.count + (hit ? 1 : 0), d + 1) };
  },
  accept: ({ phase, target, count }) =>
    phase === 'mem' && (target === d || count === 0 || count === d),
}, geometry.numValues));
const otherDigitCounts = [2, 3, 4, 5, 6, 7, 8, 9].map(d =>
  new NFA(otherDigitMachineFor(d), `digit-${d}-count`, CIRCLE, ...scanArgs));

// --- Domain restriction: every loop Var (membership + all four edge
// families) otherwise inherits the full 1-9 grid range from Shape('9x9').
// Pin each one down to the boolean {OFF, ON} domain, via one Replicate per
// overlay, so the solver never searches the 7 meaningless extra values per
// Var (a plain Given per cell is what the stamped-copies lint flags here).
const boolRestrict = overlay => {
  const cells = overlay.cells();
  return overlay.makeReplicate(new Given(cells[0], ...BOOL), cells);
};
const boolDomain = [
  boolRestrict(membership),
  ...edgeFamilies.map(({ overlay }) => boolRestrict(overlay)),
];

return [
  new Shape('9x9'),
  ...givens,
  membership.toVar('loop-membership'),
  ...edgeFamilies.map(({ overlay }, i) => overlay.toVar(`loop-edge-${i}`)),
  ...boolDomain,
  ...degreeLinks,
  ...adjacentDiffer,
  loopLength,
  ...box5Off,
  ...otherBoxVisited,
  digitOne,
  circleCount,
  ...otherDigitCounts,
];
