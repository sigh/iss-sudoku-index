// Title: Distant Neighbors
// Author: Knickolas
// Video: https://www.youtube.com/watch?v=-YAqw0F2D_s
// Source: https://sudokupad.app/yh755nnm1j

// Rules encoded below, in full:
//   Normal sudoku rules apply.
//   Cells separated by a white dot are consecutive (four dots are drawn; the
//   rules define no other dot type and make no "all dots are given" claim, so
//   unmarked pairs are unconstrained).
//   Draw a one-cell-wide loop that moves orthogonally through the centres of
//   some cells.
//   Adjacent digits along the loop are not consecutive.
//   Numbers left of the grid indicate the number of cells on the loop in their
//   row.
//   Numbers above the grid indicate the sum of cells on the loop in their
//   column.
//   O, E and P represent an odd, even and prime number respectively.
// Nothing is omitted.
//
// Loop reading: the rules give no clause forbidding the loop from running
// alongside itself, so "one-cell-wide" is taken as the drawn width of the
// circuit -- a single closed non-branching route that enters each cell it
// visits once -- and two loop cells may be orthogonally adjacent without the
// loop stepping between them.  "Adjacent digits along the loop" is scoped by
// the same sentence to cells consecutive along the circuit.

// --- Loop model -------------------------------------------------------------
// One Var per cell (VD) holding the direction the loop leaves that cell in, or
// OFF.  Out-degree is then 1 by construction; an in-degree machine per cell
// makes the on-loop cells exactly the cells with one entry and one exit, so the
// selected cells decompose into vertex-disjoint directed circuits.  Because the
// loop may touch itself, degree cannot be counted over grid neighbours and
// ConnectedValues would not see two circuits running side by side, so the
// "exactly one circuit" half is carried by the two position counters below.
const OFF = 1, UP = 2, RIGHT = 3, DOWN = 4, LEFT = 5;
const DIRS = [
  { code: UP, dR: -1, dC: 0 },
  { code: RIGHT, dR: 0, dC: 1 },
  { code: DOWN, dR: 1, dC: 0 },
  { code: LEFT, dR: 0, dC: -1 },
];
const OPPOSITE = { [UP]: DOWN, [RIGHT]: LEFT, [DOWN]: UP, [LEFT]: RIGHT };

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const dir = graph.makeOverlay('VD');
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');

// Each cell's in-grid neighbours, in a fixed reading order, tagged with the
// direction they lie in.
const neighboursOf = (cell) => DIRS
  .map(d => ({ code: d.code, cell: graph.step(cell, d.dR, d.dC) }))
  .filter(n => n.cell !== null);

const memo = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
};

// --- Drawn clues ------------------------------------------------------------
// White dots, transcribed from the four edge-centred white circles.
const whiteDots = [
  ['R1C7', 'R1C8'],
  ['R5C6', 'R5C7'],
  ['R6C3', 'R7C3'],
  ['R7C5', 'R8C5'],
];

// Left clues: how many cells of the row are on the loop, as the set of counts
// the printed clue allows (O odd, E even, P prime, over a count of 0..9).
const ODD = [1, 3, 5, 7, 9], EVEN = [0, 2, 4, 6, 8], PRIME = [2, 3, 5, 7];
const rowClues = [ODD, ODD, [9], ODD, EVEN, EVEN, [6], PRIME, [4]];

// Top clues: the sum of the loop cells' digits in the column.  Column 8's E is
// a parity clue rather than a total.
const colClues = [12, 27, 6, 19, 38, 10, 13, 'even', 42];

// --- Loop direction domains -------------------------------------------------
// A cell cannot leave towards a neighbour that does not exist.
const dirDomains = gridCells.map(cell => new Given(
  dir.at(cell), OFF, ...neighboursOf(cell).map(n => n.code)));

// --- In-degree: exactly one entry for an on-loop cell, none otherwise --------
// Reads [dirSelf, dirNeighbour...]; a neighbour lying in direction d points
// back at this cell exactly when it leaves in the opposite direction.
const inDegree = memo((entryValues) => NFA.encodeSpec({
  startState: { idx: 0, need: 0, count: 0 },
  transition: ({ idx, need, count }, value) => {
    if (idx === 0) return { idx: 1, need: value === OFF ? 0 : 1, count: 0 };
    if (idx > entryValues.length) return undefined;
    const next = count + (value === entryValues[idx - 1] ? 1 : 0);
    if (next > need) return undefined;
    return { idx: idx + 1, need, count: next };
  },
  accept: ({ idx, count, need }) => idx === entryValues.length + 1 && count === need,
  maxDepth: 5,
}, geometry));

const inDegreeRules = gridCells.map(cell => {
  const ns = neighboursOf(cell);
  return new NFA(
    inDegree(ns.map(n => OPPOSITE[n.code])), 'in-degree',
    dir.at(cell), ...ns.map(n => dir.at(n.cell)));
});

// --- Per-edge rules ---------------------------------------------------------
// Reads [dirA, dirB, digitA, digitB] for an adjacent pair.  The two cells are
// joined along the loop when either leaves towards the other; both leaving
// towards each other would be a two-cell circuit, which is not a loop through
// cell centres.  Joined cells may not hold consecutive digits.
const edgeRule = memo((aToB, bToA) => NFA.encodeSpec({
  startState: { idx: 0 },
  transition: (state, value) => {
    if (state.idx === 0) return { idx: 1, aJoins: value === aToB };
    if (state.idx === 1) {
      const bJoins = value === bToA;
      if (state.aJoins && bJoins) return undefined;
      return { idx: 2, joined: state.aJoins || bJoins };
    }
    if (state.idx === 2) return { idx: 3, joined: state.joined, digitA: value };
    if (state.idx === 3) {
      if (state.joined && Math.abs(state.digitA - value) === 1) return undefined;
      return { idx: 4 };
    }
    return undefined;
  },
  accept: ({ idx }) => idx === 4,
  maxDepth: 4,
}, geometry));

const edgeRules = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  return [
    ...(right ? [new NFA(edgeRule(RIGHT, LEFT), 'loop-edge-h',
      dir.at(cell), dir.at(right), cell, right)] : []),
    ...(down ? [new NFA(edgeRule(DOWN, UP), 'loop-edge-v',
      dir.at(cell), dir.at(down), cell, down)] : []),
  ];
});

// --- Row counts -------------------------------------------------------------
const rowCount = memo((allowed) => NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) => ({ count: count + (value === OFF ? 0 : 1) }),
  accept: ({ count }) => allowed.includes(count),
  maxDepth: 9,
}, geometry));

const rowRules = rowClues.map((allowed, i) => new NFA(
  rowCount(allowed), 'loop-row-count', ...dir.at(graph.row(i + 1))));

// --- Column sums ------------------------------------------------------------
// Reads [dir, digit] per cell down the column, adding the digit only where the
// cell is on the loop.  Column 8 is clued even, so that machine keeps the
// parity instead of the total.
const colSum = memo((target) => NFA.encodeSpec({
  startState: { on: null, sum: 0 },
  transition: ({ on, sum }, value) => {
    if (on === null) return { on: value !== OFF, sum };
    const next = sum + (on ? value : 0);
    return next > target ? undefined : { on: null, sum: next };
  },
  accept: ({ on, sum }) => on === null && sum === target,
  maxDepth: 18,
}, geometry));

const colParity = NFA.encodeSpec({
  startState: { on: null, par: 0 },
  transition: ({ on, par }, value) => (on === null
    ? { on: value !== OFF, par }
    : { on: null, par: (par + (on ? value : 0)) % 2 }),
  accept: ({ on, par }) => on === null && par === 0,
  maxDepth: 18,
}, geometry);

const colRules = colClues.map((clue, i) => new NFA(
  clue === 'even' ? colParity : colSum(clue), 'loop-col-sum',
  ...graph.column(i + 1).flatMap(cell => [dir.at(cell), cell])));

// --- One circuit, not several ----------------------------------------------
// Two position counters, modulo 7 and modulo 8, run along the loop: each cell's
// successor carries the next value, except across the single edge that enters
// the seam cell.  Any circuit avoiding the seam would have to increment back to
// its own start in both layers, so its length would be a multiple of lcm(7, 8)
// = 56.  The column clues cap the loop at 50 cells -- a column's loop cells are
// distinct digits, so 12 admits at most 4 of them, 27 at most 6, 6 at most 3,
// 19 at most 5, 38 at most 8 (45 is not 38), 10 at most 4, 13 at most 4, an even
// total at most 8 (45 is odd) and 42 at most 8 (45 is not 42), totalling 50 --
// so no such circuit exists and the seam's circuit is the only one.
// The seam is R3C1: the row 3 clue of 9 puts every cell of row 3 on the loop.
const SEAM = 'R3C1';
const MOD_A = 7, MOD_B = 8;
const counterValues = (mod) => [1, ...Array.from({ length: mod }, (_, i) => i + 2)];

// Reads [dirSelf, counterSelf, counterNeighbour...].  Value 1 is the off-loop
// sentinel; 2..mod+1 are the counter's residues.  `entries` gives each
// neighbour's direction and whether it is the seam (whose incoming edge is the
// one exempt from the increment).
const counterRule = memo((mod, entries) => NFA.encodeSpec({
  startState: { idx: 0 },
  transition: (state, value) => {
    if (state.idx === 0) return { idx: 1, out: value };
    if (state.idx === 1) {
      if (state.out === OFF) return value === 1 ? { idx: 2, out: OFF, next: 0 } : undefined;
      if (value === 1) return undefined;
      return { idx: 2, out: state.out, next: 2 + ((value - 2 + 1) % mod) };
    }
    const i = state.idx - 2;
    if (i >= entries.length) return undefined;
    const entry = entries[i];
    if (state.out === entry.code && !entry.seam && value !== state.next) return undefined;
    return { idx: state.idx + 1, out: state.out, next: state.next };
  },
  accept: ({ idx }) => idx === entries.length + 2,
  maxDepth: 6,
}, geometry));

const counterRules = gridCells.flatMap(cell => {
  const ns = neighboursOf(cell);
  const entries = ns.map(n => ({ code: n.code, seam: n.cell === SEAM }));
  return [
    new NFA(counterRule(MOD_A, entries), 'loop-pos-a',
      dir.at(cell), posA.at(cell), ...ns.map(n => posA.at(n.cell))),
    new NFA(counterRule(MOD_B, entries), 'loop-pos-b',
      dir.at(cell), posB.at(cell), ...ns.map(n => posB.at(n.cell))),
  ];
});

// The mod-8 layer's 9 values are exactly the grid's range, so only the mod-7
// layer needs its top value taken away.
const counterDomains = posA.makeReplicate(
  new Given(posA.cells()[0], ...counterValues(MOD_A)));

// The counters and the travel direction are artifacts of this encoding, and
// both carry a symmetry that would otherwise multiply solutions: adding a
// constant to every on-loop counter, and traversing the loop the other way
// round.  Pin the seam's counters, and pick the traversal in which the seam
// leaves by the earlier of its two loop directions in the order up, right,
// down.  R3C1 has no left neighbour, so: if the cell above enters R3C1 then
// "up" is one of its two loop directions and the seam must leave upwards, and
// otherwise the seam may leave downwards only when the cell to its right does
// not enter it.
const seamOrientation = NFA.encodeSpec({
  startState: { idx: 0 },
  transition: (state, value) => {
    if (state.idx === 0) return value === OFF ? undefined : { idx: 1, out: value };
    if (state.idx === 1) return value === DOWN ? undefined : { idx: 2, out: state.out };
    if (state.idx === 2) {
      return (value === LEFT && state.out === DOWN) ? undefined : { idx: 3 };
    }
    return undefined;
  },
  accept: ({ idx }) => idx === 3,
  maxDepth: 3,
}, geometry);

const seamRules = [
  new NFA(seamOrientation, 'loop-seam',
    dir.at(SEAM), dir.at('R2C1'), dir.at('R3C2')),
  new Given(posA.at(SEAM), 2),
  new Given(posB.at(SEAM), 2),
];

return [
  new Shape('9x9'),
  dir.toVar('loop-direction'),
  posA.toVar('loop-position-mod-7'),
  posB.toVar('loop-position-mod-8'),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...dirDomains,
  counterDomains,
  ...inDegreeRules,
  ...edgeRules,
  ...rowRules,
  ...colRules,
  ...counterRules,
  ...seamRules,
];
