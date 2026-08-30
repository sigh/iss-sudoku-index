// Title: Hostile Knight's Tour
// Author: Blackle Mori
// Video: https://www.youtube.com/watch?v=LvideSh-5WI
// Source: https://tinyurl.com/ybcep9yo

// 8x8 grid, three cells blocked (R1C1, R1C8, R8C1). The 61 open cells hold
// 1-61, one each: the cell holding N and the cell holding N+1 are always a
// knight's move apart (an open knight's tour of the open cells, starting at
// 1). Additionally, no two orthogonally-adjacent open cells share a digit
// character in how their numbers are written -- e.g. 12 and 21 clash on
// both digits, 12 and 23 clash on one, 12 and 34 do not clash. A
// single-digit number contributes only that one digit.
// Every clause is encoded; nothing is omitted.
//
// A value up to 61 does not fit ISS's 16-value cap, so each open cell's
// number is held as two full-grid Var overlays, each holding one of the
// value's own decimal digits directly: TENS (0-6) and UNITS (0-9), so
// value = 10*TENS + UNITS. The main grid carries no puzzle content -- this
// puzzle has no rows/columns/boxes rule at all -- so it is pinned to a dummy
// value everywhere, keeping it out of the search and the solution count.
// The 3 blocked cells' TENS/UNITS are pinned the same way.

const shape = new Shape('8x8', '0-9', 'Raw');
const graph = cellGraph(shape);
const HOLES = ['R1C1', 'R1C8', 'R8C1'];
const holeSet = new Set(HOLES);
const playable = graph.cells().filter(cell => !holeSet.has(cell));
const playableSet = new Set(playable);

// value = 10*TENS + UNITS: TENS is value's decimal tens digit (0-6), UNITS
// is its decimal units digit (0-9) -- exactly what digitsOf() below reads.
const positionOf = (tensVal, unitsVal) => 10 * tensVal + unitsVal;
const encode = value => ({
  tens: Math.floor(value / 10),
  units: value % 10,
});

// Full-grid overlays (not just the 61 open cells) so each keeps its 8x8
// canvas shape for addressing; the 3 blocked cells get a pinned dummy value
// below and never appear in any real rule.
const tens = graph.makeOverlay('VT');
const units = graph.makeOverlay('VU');

// --- Knight-move adjacency, restricted to open cells. ---
const KNIGHT_OFFSETS = [
  [1, 2], [1, -2], [-1, 2], [-1, -2],
  [2, 1], [2, -1], [-2, 1], [-2, -1],
];
const knightMoves = cell => {
  const { row, col } = parseCellId(cell);
  return KNIGHT_OFFSETS
    .map(([dr, dc]) => [row + dr, col + dc])
    .filter(([r, c]) => r >= 1 && r <= 8 && c >= 1 && c <= 8)
    .map(([r, c]) => makeCellId(r, c))
    .filter(id => playableSet.has(id));
};

// --- Given clues (penpa `number` layer, decoded to R#C# by point-index). ---
const GIVENS = {
  R1C5: 17, R1C7: 7, R2C2: 47, R2C4: 33, R2C7: 24,
  R4C2: 51, R4C4: 53, R4C6: 25, R5C1: 21, R5C8: 4,
  R6C4: 11, R6C8: 1, R7C1: 29, R7C2: 44, R8C5: 12, R8C6: 57,
};
const givenConstraints = Object.entries(GIVENS).flatMap(([cell, value]) => {
  const { tens: t, units: u } = encode(value);
  return [new Given(tens.at(cell), t), new Given(units.at(cell), u)];
});

// --- Every open cell's value stays in 1-61 (TENS/UNITS otherwise range up
// to 69). Passing `shape` (rather than a bare count) reads each Var's real
// stored digit, not a 1-based index into its domain.
const inRangeKey = Pair.fnToKey(
  (t, u) => { const v = positionOf(t, u); return v >= 1 && v <= 61; },
  shape);
const rangeConstraints = playable.map(cell =>
  new Pair(inRangeKey, 'range', tens.at(cell), units.at(cell)));

// --- The tour itself: every open cell whose value is below 61 has an open
// knight-move neighbour whose value is exactly one more. Chained from R6C8
// (value 1, a given), this forces every value 1-61 to actually occur
// somewhere (by induction: 1 occurs at R6C8, and if v occurs then v+1 occurs
// at one of its neighbours, for v < 61). With exactly 61 open cells and 61
// required values, that makes the values a bijection onto 1-61 -- i.e. a
// knight's tour visiting every open cell, starting at R6C8. Reads the
// cell's own (tens, units), then each open knight-neighbour's
// (tens, units).
const successorMachine = NFA.encodeSpec({
  startState: { phase: 't' },
  transition: (state, value) => {
    switch (state.phase) {
      case 't':
        return { phase: 'u', t: value };
      case 'u': {
        const pos = positionOf(state.t, value);
        if (pos === 61) return { phase: 'found' };
        return { phase: 'nt', want: pos + 1 };
      }
      case 'nt':
        return { phase: 'nu', want: state.want, t: value };
      case 'nu':
        return positionOf(state.t, value) === state.want
          ? { phase: 'found' }
          : { phase: 'nt', want: state.want };
      case 'found':
        return { phase: 'found' };
    }
  },
  accept: state => state.phase === 'found',
}, shape);
const successors = playable.map(cell => new NFA(successorMachine, 'next',
  tens.at(cell), units.at(cell),
  ...knightMoves(cell).flatMap(nb => [tens.at(nb), units.at(nb)])));

// --- Consequence of the rule above, restated for the solver: every open
// cell whose value is above 1 has an open knight-move neighbour whose value
// is exactly one less. Follows from the same bijection read the other way;
// included only because it prunes the search far more than the forward rule
// alone, the same trade the reference encoding for a full-coverage route
// makes (data/scripts equivalent: cZjpWVk2dhU.3's `pathForwards`).
const predecessorMachine = NFA.encodeSpec({
  startState: { phase: 't' },
  transition: (state, value) => {
    switch (state.phase) {
      case 't':
        return { phase: 'u', t: value };
      case 'u': {
        const pos = positionOf(state.t, value);
        if (pos === 1) return { phase: 'found' };
        return { phase: 'pt', want: pos - 1 };
      }
      case 'pt':
        return { phase: 'pu', want: state.want, t: value };
      case 'pu':
        return positionOf(state.t, value) === state.want
          ? { phase: 'found' }
          : { phase: 'pt', want: state.want };
      case 'found':
        return { phase: 'found' };
    }
  },
  accept: state => state.phase === 'found',
}, shape);
const predecessors = playable.map(cell => new NFA(predecessorMachine, 'prev',
  tens.at(cell), units.at(cell),
  ...knightMoves(cell).flatMap(nb => [tens.at(nb), units.at(nb)])));

// --- The "hostile" rule: adjacent (sharing a side) open cells share no
// digit character. A single-digit number (tens digit 0) contributes only
// its units digit. Reads both cells' (tens, units) in turn.
const digitsOf = (td, ud) => td === 0 ? [ud] : [td, ud];
const noSharedDigitMachine = NFA.encodeSpec({
  startState: { phase: 'tA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'tA':
        return { phase: 'uA', tA: value };
      case 'uA':
        return { phase: 'tB', digitsA: digitsOf(state.tA, value) };
      case 'tB':
        return { phase: 'uB', digitsA: state.digitsA, tB: value };
      case 'uB': {
        const digitsB = digitsOf(state.tB, value);
        const shared = state.digitsA.some(d => digitsB.includes(d));
        return shared ? undefined : { phase: 'done' };
      }
      case 'done':
        return { phase: 'done' };
    }
  },
  accept: state => state.phase === 'done',
}, shape);
// Each unordered adjacent open-cell pair once.
const adjacentPairs = [];
for (const cell of playable) {
  for (const other of graph.neighbours(cell)) {
    if (!playableSet.has(other)) continue;
    if (cell < other) adjacentPairs.push([cell, other]);
  }
}
const noSharedDigit = adjacentPairs.map(([a, b]) =>
  new NFA(noSharedDigitMachine, 'nodigit',
    tens.at(a), units.at(a), tens.at(b), units.at(b)));

// The 3 blocked cells carry no number; pin their overlay cells to a fixed
// dummy code so they take no part in the search.
const holePins = HOLES.flatMap(cell =>
  [new Given(tens.at(cell), 0), new Given(units.at(cell), 0)]);

return [
  shape,
  // The main grid carries no puzzle content; pin it so it does not widen the
  // search or multiply the solution count.
  graph.makeReplicate(new Given(graph.cells()[0], 0)),
  tens.toVar('tens digit'),
  units.toVar('units digit'),
  ...holePins,
  ...givenConstraints,
  ...rangeConstraints,
  ...successors,
  ...predecessors,
  ...noSharedDigit,
];
