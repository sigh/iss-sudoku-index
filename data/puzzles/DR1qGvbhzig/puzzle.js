// Title: Beyond Sudoku
// Author: Undar Beyond
// Video: https://www.youtube.com/watch?v=DR1qGvbhzig
// Source: https://cracking-the-cryptic.web.app/sudoku/JfFBFHMHqG

// Normal sudoku, no givens. Nine "galaxies", one per drawn circle: each
// galaxy is an unknown, solver-discovered line of >= 3 grid cells that is
// (a) point-symmetric (180-degree) about its own circle, (b) one cell wide,
// connected and simple -- it may not touch itself and may not close into a
// loop -- (c) holds no repeated digit, and (d) whose printed number is the
// sum of the digits lying BETWEEN its smallest and its largest digit --
// positionally between, along the line, the way a Sandwich clue sums the
// cells between the 1 and the 9. Galaxies may not overlap; a cell may belong
// to no galaxy at all.
//
// The line is enumerated rather than described. Because a line's digits are
// distinct and drawn from 1-9 it is at most 9 cells long, and point symmetry
// plus the no-self-touch rule leave only 231 candidate lines across all nine
// circles (14, 2, 14, 65, 56, 35, 21, 3, 21). Listing them is what makes the
// positional clue expressible at all: "between the smallest and the largest"
// needs the order of the cells along the line, which membership overlays plus
// connectivity and degree rules never recover. Enumerating the lines supplies
// that order directly, and in doing so replaces the symmetry, connectivity,
// degree/endpoint and no-loop machinery entirely -- every enumerated line
// already has those properties by construction.
//
// Circle positions and sums are transcribed from the payload's overlay list
// (rounded dot markers paired with their nearest free-floating sum text), in
// a system where cell RrCc has its centre at (r - 0.5, c - 0.5).

const OFF = 10; // sentinel label: this cell is in no galaxy

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

const MAX_LINE = 9; // a line's digits are distinct and drawn from 1-9

function reflect(row0, col0, g) {
  const rowP = 2 * g.row - row0 - 1;
  const colP = 2 * g.col - col0 - 1;
  if (!Number.isInteger(rowP) || !Number.isInteger(colP)) return null;
  if (rowP < 0 || rowP > 8 || colP < 0 || colP > 8) return null;
  return [rowP, colP];
}

const graph = cellGraph('9x9');
// NFA.encodeSpec needs the widened value count (10: nine galaxy ids plus OFF),
// so the Shape object itself is what every machine below is built against.
const shape = new Shape('9x9', 10);
const label = graph.makeOverlay('VG');

const allCells = [];
for (let row0 = 0; row0 < 9; row0++) {
  for (let col0 = 0; col0 < 9; col0++) {
    allCells.push({ row0, col0, id: makeCellId(row0 + 1, col0 + 1) });
  }
}

// Main grid stays 1-9 digits under the widened (1-10) Shape.
const gridDomain = graph.makeReplicate(
  new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

function allowedGalaxies(row0, col0) {
  const allowed = [OFF];
  for (const g of GALAXIES) {
    if (reflect(row0, col0, g) !== null) allowed.push(g.id);
  }
  return allowed;
}
// Cell ids by their 0-indexed position, so the reflection maths below never
// re-derives one and the enumeration can carry ids rather than coordinates.
const idAt = allCells.reduce((acc, { row0, col0, id }) => {
  (acc[row0] ??= [])[col0] = id;
  return acc;
}, []);

const domainGivens = allCells.map(({ row0, col0, id }) =>
  new Given(label.at(id), ...allowedGalaxies(row0, col0)));

// ---- Candidate lines -------------------------------------------------------
// Grown outward from the circle a symmetric pair at a time, so every path is
// point-symmetric by construction: appending cell n at the tail appends its
// mirror at the head. A path is rejected if any two non-consecutive cells are
// orthogonally adjacent, which is the rules' "cannot touch itself" (and also
// forbids closing into a loop).
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function selfTouching(path) {
  for (let i = 0; i < path.length; i++) {
    for (let j = i + 2; j < path.length; j++) {
      if (Math.abs(path[i][0] - path[j][0]) + Math.abs(path[i][1] - path[j][1]) === 1) {
        return true;
      }
    }
  }
  return false;
}

function linesFor(g) {
  const inZone = (r, c) => r >= 0 && r < 9 && c >= 0 && c < 9 && reflect(r, c, g) !== null;
  const found = new Map();
  const record = (path) => {
    if (path.length < 3) return;
    const fwd = path.map(([r, c]) => `${r},${c}`).join(' ');
    const rev = path.slice().reverse().map(([r, c]) => `${r},${c}`).join(' ');
    const key = fwd < rev ? fwd : rev;
    if (!found.has(key)) found.set(key, path.slice());
  };
  const grow = (path) => {
    record(path);
    if (path.length + 2 > MAX_LINE) return;
    const [tr, tc] = path[path.length - 1];
    for (const [dr, dc] of DIRS) {
      const nr = tr + dr;
      const nc = tc + dc;
      if (!inZone(nr, nc)) continue;
      const m = reflect(nr, nc, g);
      if (m === null) continue;
      if (m[0] === nr && m[1] === nc) continue;
      const used = path.some(([r, c]) => (r === nr && c === nc) || (r === m[0] && c === m[1]));
      if (used) continue;
      const next = [m, ...path, [nr, nc]];
      if (selfTouching(next)) continue;
      grow(next);
    }
  };
  const fixed = allCells
    .filter(({ row0, col0 }) => {
      const m = reflect(row0, col0, g);
      return m !== null && m[0] === row0 && m[1] === col0;
    });
  if (fixed.length) {
    grow([[fixed[0].row0, fixed[0].col0]]);
  } else {
    for (const { row0, col0 } of allCells) {
      const m = reflect(row0, col0, g);
      if (m === null) continue;
      if (Math.abs(m[0] - row0) + Math.abs(m[1] - col0) !== 1) continue;
      if (row0 * 9 + col0 > m[0] * 9 + m[1]) continue;
      grow([[row0, col0], m]);
    }
  }
  return [...found.values()];
}

// ---- No repeated digit along a line ----------------------------------------
const distinctSpec = NFA.encodeSpec({
  startState: { seen: 0 },
  transition: ({ seen }, value) => {
    const bit = 1 << (value - 1);
    if (seen & bit) return undefined;
    return { seen: seen | bit };
  },
  accept: () => true,
}, shape);

// ---- The printed clue: digits positionally between the min and the max -----
// Each line's cells are read TWICE. The first pass just collects the line's
// smallest and largest digit; the second walks the same cells in the same
// order and adds up the digits lying strictly between the two cells holding
// them. Two passes rather than one because a single forward scan cannot know
// which digits are "between" until both extremes are known -- a later extreme
// retrospectively pulls earlier digits inside -- and carrying enough state to
// repair that (both extremes, the running inside sum and the tail after it)
// blows past the 4096-state compile limit.
function betweenSumSpec(clue, n) {
  return NFA.encodeSpec({
    startState: { phase: 'scan', i: 0, minV: 0, maxV: 0 },
    transition: (state, d) => {
      if (state.phase === 'scan') {
        const minV = state.minV === 0 ? d : Math.min(state.minV, d);
        const maxV = state.maxV === 0 ? d : Math.max(state.maxV, d);
        const i = state.i + 1;
        if (i < n) return { phase: 'scan', i, minV, maxV };
        if (minV === maxV) return undefined;
        return { phase: 'before', minV, maxV };
      }
      const { minV, maxV } = state;
      const isExtreme = d === minV || d === maxV;
      if (state.phase === 'before') {
        return isExtreme
          ? { phase: 'inside', minV, maxV, S: 0 }
          : { phase: 'before', minV, maxV };
      }
      if (state.phase === 'inside') {
        if (isExtreme) {
          return state.S === clue ? { phase: 'after', minV, maxV } : undefined;
        }
        const S = state.S + d;
        if (S > clue) return undefined;
        return { phase: 'inside', minV, maxV, S };
      }
      return isExtreme ? undefined : { phase: 'after', minV, maxV };
    },
    accept: (state) => state.phase === 'after',
  }, shape);
}
const betweenSpecs = new Map();
function betweenSpec(clue, n) {
  const key = `${clue}:${n}`;
  if (!betweenSpecs.has(key)) betweenSpecs.set(key, betweenSumSpec(clue, n));
  return betweenSpecs.get(key);
}

// ---- One Or per galaxy over its candidate lines ----------------------------
// A zone cell that lies on no candidate line can never carry this galaxy's
// label, whichever line is chosen, so that exclusion is stated once outside
// the Or instead of being repeated in every branch. Only the union of the
// candidate lines varies from option to option, which is what keeps the
// serialized size in hand (4.5 MB down to a few hundred KB).
const galaxyExclusions = [];
const galaxyChoices = GALAXIES.map((g) => {
  const zone = allCells.filter(({ row0, col0 }) => reflect(row0, col0, g) !== null);
  const lines = linesFor(g);
  const reachable = new Set();
  for (const line of lines) {
    for (const [r, c] of line) reachable.add(idAt[r][c]);
  }
  for (const { row0, col0, id } of zone) {
    if (reachable.has(id)) continue;
    galaxyExclusions.push(
      new Given(label.at(id), ...allowedGalaxies(row0, col0).filter(v => v !== g.id)));
  }
  const varying = zone.filter(({ id }) => reachable.has(id));
  const options = lines.map((line) => {
    const ids = line.map(([r, c]) => idAt[r][c]);
    const onLine = new Set(ids);
    const givens = varying.map(({ row0, col0, id }) => (onLine.has(id)
      ? new Given(label.at(id), g.id)
      : new Given(label.at(id), ...allowedGalaxies(row0, col0).filter(v => v !== g.id))));
    return new And([
      ...givens,
      new NFA(distinctSpec, `galaxy-${g.name}-distinct`, ...ids),
      new NFA(betweenSpec(g.sum, ids.length), `galaxy-${g.name}-between-sum`,
        ...ids, ...ids),
    ]);
  });
  return new Or(options);
});

return [
  shape,
  gridDomain,
  label.toVar('galaxy'),
  ...domainGivens,
  ...galaxyExclusions,
  ...galaxyChoices,
];
