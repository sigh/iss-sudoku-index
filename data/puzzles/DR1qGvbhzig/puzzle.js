// Title: Beyond Sudoku
// Author: Undar Beyond
// Video: https://www.youtube.com/watch?v=DR1qGvbhzig
// Source: https://cracking-the-cryptic.web.app/sudoku/JfFBFHMHqG

// Normal sudoku, no givens. Nine "galaxies", one per drawn circle: each
// galaxy is an unknown, solver-discovered line of >= 3 grid cells that is
// (a) point-symmetric (180-degree) about its own circle, (b) one cell wide,
// connected, and simple -- it may not touch itself and may not close into a
// loop -- (c) holds no repeated digit, and (d) has a printed sum equal to
// the total of its digits *excluding* its own smallest and largest digit.
// Galaxies may not overlap; a cell may belong to no galaxy at all.
//
// Circle positions and sums are transcribed from the payload's overlay list
// (rounded dot markers paired with their nearest free-floating sum text).
// Each galaxy has a computed "zone": the cells whose point reflection about
// its circle also lands on the grid, i.e. the only cells that could ever
// join that galaxy (a cell whose required mirror partner falls off the
// board can never be part of a point-symmetric shape centred there).
//
// Encoding: one shared 10-value label overlay (VG) holds, per cell, which
// galaxy (1-9) it belongs to, or OFF (10) for no galaxy -- membership in two
// galaxies at once is impossible by construction, so "galaxies cannot
// overlap" needs no separate rule. A second overlay (VE) marks, per cell,
// which galaxy it is an *endpoint* of (or OFF), used only to rule out a
// galaxy closing into a loop.
//
// Symmetry is a Pair per mirrored cell pair inside a galaxy's zone: cell a
// holds label k iff its mirror b does. Cells outside a galaxy's zone are
// never given that galaxy as an allowed label at all (Given per cell), since
// such a cell's required mirror partner does not exist on the grid.
//
// The path shape (one cell wide, self-avoiding, no loop) is the standard
// "route may not touch itself" case: ON/OFF membership plus a degree rule
// over grid-adjacency closes it outright. Concretely, one small NFA per cell
// reads that cell's own label, then each orthogonal neighbour's label, then
// (Schrodinger-style) the cell's own endpoint marker: if the cell is OFF,
// its endpoint marker must be OFF and neighbours are unconstrained; if it
// holds label k, exactly 1 or 2 of its neighbours must also hold k (degree
// 1 or 2 -- 0 or >=3 is rejected), and the endpoint marker must equal k
// when the count is 1 (this cell is an endpoint) or OFF when it is 2. A
// connected graph with every degree in {1,2} is either a single path (some
// vertex has degree 1) or a single cycle (no vertex does) -- so requiring at
// least one degree-1 (endpoint) cell per galaxy, together with
// ConnectedValues, forces a simple path and excludes the loop case; that is
// what the per-galaxy ContainAtLeast on VE below does.
//
// No-repeat and the sum both come from one more NFA per galaxy, scanning
// only that galaxy's zone as interleaved (label, digit) pairs while tracking
// a seen-digit bitmask: a repeat digit on this galaxy's own line is a dead
// transition (no-repeat), and the accept predicate reads the final bitmask
// to require >= 3 members and (sum of members - min - max) == the printed
// total, in one step. That accept predicate also enforces "at least 3
// cells" -- no separate size constraint is needed.
//
// "Cannot touch itself" is read as ordinary grid (orthogonal) adjacency,
// same as the degree rule above already enforces; the rules text has no
// "not even diagonally" clause (contrast Nordschleife-style loop rules that
// state that explicitly), so no separate diagonal no-touch machine is added.

const OFF = 10; // sentinel label/endpoint value: this cell is in no galaxy

// id: numeric label value (1-9). row/col: the circle's own [row,col],
// 0-indexed, continuous grid coordinates (an integer sits on a grid line, a
// half-integer sits on a cell centre) -- copied straight from the payload's
// overlay `center` field for that circle. sum: the paired printed total.
const GALAXIES = [
  { id: 1, name: 'A', row: 1, col: 4.5, sum: 20 }, // edge R1C5/R2C5
  { id: 2, name: 'B', row: 1.5, col: 8, sum: 11 }, // edge R2C8/R2C9
  { id: 3, name: 'C', row: 4.5, col: 8, sum: 15 }, // edge R5C8/R5C9
  { id: 4, name: 'D', row: 5, col: 5.5, sum: 6 },  // edge R5C6/R6C6
  { id: 5, name: 'E', row: 4.5, col: 4.5, sum: 31 }, // cell R5C5
  { id: 6, name: 'F', row: 3.5, col: 2, sum: 13 }, // edge R4C2/R4C3
  { id: 7, name: 'G', row: 7, col: 2.5, sum: 25 }, // edge R7C3/R8C3
  { id: 8, name: 'H', row: 8.5, col: 5.5, sum: 4 }, // cell R9C6
  { id: 9, name: 'I', row: 6.5, col: 7, sum: 15 }, // edge R7C7/R7C8
];

// Reflect grid cell (row0, col0) through galaxy g's circle. Returns
// [row0, col0] of the mirror cell, or null if the mirror falls off the
// 9x9 grid (so (row0, col0) can never be part of g: its required point-
// symmetric partner would not exist).
function reflect(row0, col0, g) {
  const rowP = 2 * g.row - row0 - 1;
  const colP = 2 * g.col - col0 - 1;
  if (!Number.isInteger(rowP) || !Number.isInteger(colP)) return null;
  if (rowP < 0 || rowP > 8 || colP < 0 || colP > 8) return null;
  return [rowP, colP];
}

const graph = cellGraph('9x9');
// NFA.encodeSpec needs the *widened* value count (10: nine galaxy ids plus
// the OFF sentinel). graph.gridGeometry().numValues still reports the
// pre-widening 9 at this point in the script, since the Shape constraint
// below is only applied once the returned array is processed -- so the
// Shape object itself (which NFA.encodeSpec also accepts in place of a bare
// count) is what every NFA/Pair key below is built against.
const shape = new Shape('9x9', 10);
const label = graph.makeOverlay('VG');
const endpoint = graph.makeOverlay('VE');

const allCells = [];
for (let row0 = 0; row0 < 9; row0++) {
  for (let col0 = 0; col0 < 9; col0++) {
    allCells.push({ row0, col0, id: makeCellId(row0 + 1, col0 + 1) });
  }
}

// Main grid stays 1-9 digits under the widened (1-10) Shape below.
const gridDomain = graph.makeReplicate(
  new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// --- Per-cell allowed label/endpoint values: OFF, plus every galaxy whose
// zone contains this cell. ---
function allowedGalaxies(row0, col0) {
  const allowed = [OFF];
  for (const g of GALAXIES) {
    if (reflect(row0, col0, g) !== null) allowed.push(g.id);
  }
  return allowed;
}
const domainGivens = allCells.flatMap(({ row0, col0, id }) => {
  const allowed = allowedGalaxies(row0, col0);
  return [
    new Given(label.at(id), ...allowed),
    new Given(endpoint.at(id), ...allowed),
  ];
});

// --- Symmetry: for every galaxy, pair each zone cell with its mirror. ---
const symKeys = new Map(GALAXIES.map(
  g => [g.id, Pair.fnToKey((a, b) => (a === g.id) === (b === g.id), 10)]));
const symmetryPairs = [];
{
  const seen = new Set();
  for (const g of GALAXIES) {
    for (const { row0, col0, id } of allCells) {
      const m = reflect(row0, col0, g);
      if (!m) continue;
      const [rowP, colP] = m;
      if (rowP === row0 && colP === col0) continue; // fixed point (E, H)
      const other = makeCellId(rowP + 1, colP + 1);
      const [a, b] = id < other ? [id, other] : [other, id];
      const key = `${g.id}:${a}:${b}`;
      if (seen.has(key)) continue;
      seen.add(key);
      symmetryPairs.push(new Pair(symKeys.get(g.id), 'galaxy-symmetry', a, b));
    }
  }
}

// --- Connectivity: each galaxy's cells form exactly one connected region. ---
const connectivity = GALAXIES.map(g => new ConnectedValues('VG', g.id));

// --- Degree + endpoint marking (path shape, no self-touch, no branching). ---
// Reads [self, ...neighbours, ownEndpointMarker]. See header comment.
function buildDegreeMachine(m) {
  return NFA.encodeSpec({
    startState: { phase: 'self' },
    transition: (state, value) => {
      switch (state.phase) {
        case 'self':
          return value === OFF
            ? { phase: 'off', remaining: m }
            : { phase: 'count', v: value, count: 0, remaining: m };
        case 'off': {
          const remaining = state.remaining - 1;
          return remaining > 0 ? { phase: 'off', remaining } : { phase: 'offEnd' };
        }
        case 'count': {
          const count = state.count + (value === state.v ? 1 : 0);
          if (count > 2) return undefined; // degree > 2: branching, reject
          const remaining = state.remaining - 1;
          return remaining > 0
            ? { phase: 'count', v: state.v, count, remaining }
            : { phase: 'countEnd', v: state.v, count };
        }
        case 'offEnd':
          return value === OFF ? { phase: 'done' } : undefined;
        case 'countEnd':
          if (state.count === 0) return undefined; // isolated cell: reject
          if (state.count === 1) {
            return value === state.v ? { phase: 'done' } : undefined;
          }
          // count === 2: not an endpoint.
          return value === OFF ? { phase: 'done' } : undefined;
      }
    },
    accept: (state) => state.phase === 'done',
  }, shape);
}
const degreeMachines = { 2: buildDegreeMachine(2), 3: buildDegreeMachine(3), 4: buildDegreeMachine(4) };
const degreeConstraints = allCells.map(({ id }) => {
  const neighbours = graph.neighbours(id);
  return new NFA(degreeMachines[neighbours.length], 'galaxy-degree',
    label.at(id), ...label.at(neighbours), endpoint.at(id));
});

// --- No loop: a connected, max-degree-2 component with no degree-1 cell is
// a cycle, so require >= 1 endpoint-marked cell per galaxy. ---
const noLoop = GALAXIES.map(g => new ContainAtLeast(String(g.id), ...endpoint.cells()));

// --- No repeats + minimum size + between-sum, scanned per galaxy over its
// own zone as interleaved (label, digit) pairs. ---
function buildGalaxySumMachine(targetId, targetSum) {
  return NFA.encodeSpec({
    startState: { phase: 'label', bitmask: 0 },
    transition: (state, value) => {
      if (state.phase === 'label') {
        return { phase: 'digit', bitmask: state.bitmask, isTarget: value === targetId };
      }
      let bitmask = state.bitmask;
      if (state.isTarget) {
        const bit = 1 << (value - 1);
        if (bitmask & bit) return undefined; // repeated digit on this line
        bitmask |= bit;
      }
      return { phase: 'label', bitmask };
    },
    accept: (state) => {
      if (state.phase !== 'label') return false;
      const bits = [];
      for (let d = 1; d <= 9; d++) if (state.bitmask & (1 << (d - 1))) bits.push(d);
      if (bits.length < 3) return false;
      const min = bits[0], max = bits[bits.length - 1];
      const total = bits.reduce((s, d) => s + d, 0);
      return (total - min - max) === targetSum;
    },
  }, shape);
}
const galaxySumConstraints = GALAXIES.map(g => {
  const zone = allCells
    .filter(({ row0, col0 }) => reflect(row0, col0, g) !== null)
    .map(({ id }) => id);
  const machine = buildGalaxySumMachine(g.id, g.sum);
  const sequence = zone.flatMap(id => [label.at(id), id]);
  return new NFA(machine, 'galaxy-sum', ...sequence);
});

return [
  shape,
  gridDomain,
  label.toVar('galaxy'),
  endpoint.toVar('galaxyEndpoint'),
  ...domainGivens,
  ...symmetryPairs,
  ...connectivity,
  ...degreeConstraints,
  ...noLoop,
  ...galaxySumConstraints,
];
