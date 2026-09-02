// Title: Hawaii
// Author: PjotrV
// Video: https://www.youtube.com/watch?v=2zdlizx0iec
// Source: https://app.crackingthecryptic.com/sudoku/fJnrmHf8QT

// Rules encoded here, in full:
//  * 1-9 once in each row and column. The puzzle has no boxes.
//  * Every cell belongs to a galaxy: an orthogonally connected set of at most
//    nine cells with 180-degree rotational symmetry about a centre that is
//    either a cell centre or the midpoint of the border between two adjacent
//    cells -- "either between 2 cells or in a cell" allows nothing else, so a
//    grid corner is not a legal centre.
//  * A galaxy of exactly nine cells is big; any smaller galaxy is an island.
//  * Digits do not repeat within a galaxy.
//  * Each galaxy carries exactly one circle, at its centre. A circle in a cell
//    means that cell's digit is odd; a circle between two cells means those two
//    digits are consecutive. Seven circles are drawn and the rest are deduced,
//    so the drawn ones are known centres and there is no exhaustiveness claim.
//  * Two cells belonging to different island galaxies never touch, orthogonally
//    or diagonally.
//  * A clue outside a row or column totals that line's digits which lie in
//    island galaxies. Lines with no printed clue carry no total.
//
// Connectivity is not stated in so many words; it is the Spiral Galaxies genre
// convention, and "island galaxies can't touch each other" presupposes regions
// with a boundary. Symmetry makes a cell-centred galaxy odd-sized and an
// edge-centred one even-sized, so only a cell-centred galaxy can reach nine
// cells and every edge-centred galaxy is an island.
//
// Model. Each galaxy is named by its anchor: the cell holding its centre, or
// the upper/left cell of the pair holding an edge centre. Six whole-grid Var
// overlays carry the partition:
//   VA, VB  the offset from a cell back to its galaxy's anchor, biased by OFF
//   VS      the galaxy's centre type, plus island/big for a cell centre
//   VD      the cell's distance from the anchor within its galaxy, plus one
//   VE, VF  whether the cell shares its galaxy with its right/lower neighbour
// A galaxy is then the set of cells whose (VA, VB) name the same anchor, and
// each rule becomes a local machine over those overlays.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

const STEPS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const KING_STEPS = [[0, 1], [1, 0], [1, 1], [1, -1]];

// The three centre types, given as the anchor's partner cell: a cell centre is
// the anchor alone, an edge centre also takes the cell one step that way.
const CELL = 'CELL', RIGHT = 'RIGHT', DOWN = 'DOWN';
const CENTRE_STEP = { CELL: [0, 0], RIGHT: [0, 1], DOWN: [1, 0] };
const TYPES = [CELL, RIGHT, DOWN];

// VA/VB hold (anchor - cell) + OFF, so OFF means "this cell is the anchor".
// A member cell sits at most four steps from its anchor (see SHAPES below), so
// the biased offset stays inside 1..9.
const OFF = 5;
// VS values. An edge-centred galaxy has even size, hence at most eight cells,
// hence is always an island; only a cell-centred galaxy has a big form.
const CELL_ISLAND = 1, CELL_BIG = 2, EDGE_RIGHT = 3, EDGE_DOWN = 4;
const TYPE_VALUES = {
  CELL: [CELL_ISLAND, CELL_BIG], RIGHT: [EDGE_RIGHT], DOWN: [EDGE_DOWN],
};
const ISLAND_VALUES = [CELL_ISLAND, EDGE_RIGHT, EDGE_DOWN];
const VS_VALUES = [CELL_ISLAND, CELL_BIG, EDGE_RIGHT, EDGE_DOWN];
// VE/VF: does this cell share a galaxy with the neighbour across that border?
const APART = 1, TOGETHER = 2;
const MAX_GALAXY = 9;

// encodeSpec walks the transition out of every reachable state, the accepting
// one included, and a state field that keeps climbing never compiles. So each
// machine below rejects any symbol arriving past the end of its cell list.
const key = (x) => JSON.stringify(x);
// Compiling an NFA spec is expensive and most cells share one; memoise by the
// spec's parameters so each distinct machine is built once.
const memo = (fn) => {
  const cache = new Map();
  return (...args) => {
    const k = key(args);
    if (!cache.has(k)) cache.set(k, fn(...args));
    return cache.get(k);
  };
};

// --- The galaxy shapes --------------------------------------------------
// Every connected, 180-degree symmetric set of at most nine cells, grown from
// the centre's own cell(s) by adding a cell together with its mirror image, and
// listed as offsets from the anchor. Growth keeps the added cell attached, but
// its mirror may land detached, so connectivity is rechecked at the end.

const idOf = ([a, b]) => `${a},${b}`;
const cellsOf = (set) => [...set].map(s => s.split(',').map(Number));
const isConnected = (cells) => {
  const ids = new Set(cells.map(idOf));
  const seen = new Set([idOf(cells[0])]);
  const queue = [cells[0]];
  while (queue.length) {
    const [a, b] = queue.pop();
    for (const [da, db] of STEPS) {
      const n = [a + da, b + db];
      if (ids.has(idOf(n)) && !seen.has(idOf(n))) {
        seen.add(idOf(n));
        queue.push(n);
      }
    }
  }
  return seen.size === cells.length;
};

const enumerateShapes = (type) => {
  const [sr, sc] = CENTRE_STEP[type];
  const mirror = ([a, b]) => [sr - a, sc - b];
  const seedCells = type === CELL ? [[0, 0]] : [[0, 0], [sr, sc]];
  const seed = new Set(seedCells.map(idOf));
  const seen = new Map([[[...seed].sort().join(' '), seed]]);
  let frontier = [seed];
  while (frontier.length) {
    const next = [];
    for (const shape of frontier) {
      const candidates = new Map();
      for (const [a, b] of cellsOf(shape)) {
        for (const [da, db] of STEPS) {
          const n = [a + da, b + db];
          if (!shape.has(idOf(n))) candidates.set(idOf(n), n);
        }
      }
      for (const n of candidates.values()) {
        const grown = new Set(shape);
        grown.add(idOf(n));
        grown.add(idOf(mirror(n)));
        if (grown.size > MAX_GALAXY) continue;
        const k = [...grown].sort().join(' ');
        if (seen.has(k)) continue;
        seen.set(k, grown);
        next.push(grown);
      }
    }
    frontier = next;
  }
  return [...seen.values()].map(cellsOf).filter(isConnected);
};

const SHAPES = Object.fromEntries(TYPES.map(t => [t, enumerateShapes(t)]));

// OFFSETS[type]: every position a member cell can take relative to its anchor.
const OFFSETS = Object.fromEntries(TYPES.map(t => [t,
  [...new Map(SHAPES[t].flat().map(o => [idOf(o), o])).values()]]));
const ALL_OFFSETS = [...new Map(
  TYPES.flatMap(t => OFFSETS[t]).map(o => [idOf(o), o])).values()];
// The displacements between two cells of one galaxy. Same-row and same-column
// pairs are dropped: rows and columns are already all-different.
const SPANS = [...new Map(TYPES.flatMap(t => SHAPES[t].flatMap(
  shape => shape.flatMap(a => shape.map(b => [a[0] - b[0], a[1] - b[1]]))))
  .filter(([dr, dc]) => dr > 0 && dc !== 0)
  .map(d => [idOf(d), d])).values()];

const va = graph.makeOverlay('VA');
const vb = graph.makeOverlay('VB');
const vs = graph.makeOverlay('VS');
const vd = graph.makeOverlay('VD');
const ve = graph.makeOverlay('VE');
const vf = graph.makeOverlay('VF');

const vsDomain = vs.makeReplicate(new Given(vs.cells()[0], ...VS_VALUES));
const veDomain = ve.makeReplicate(new Given(ve.cells()[0], APART, TOGETHER));
const vfDomain = vf.makeReplicate(new Given(vf.cells()[0], APART, TOGETHER));

// --- Which galaxies a cell can belong to --------------------------------
// One machine per cell over [VA, VB, VS], listing the (anchor, centre type)
// pairs that fit on the grid: the anchor, the anchor's partner cell for an edge
// centre, and this cell's mirror image must all be real cells.
const placementsFor = (cell) => {
  const triples = [];
  for (const type of TYPES) {
    const [sr, sc] = CENTRE_STEP[type];
    for (const [a, b] of OFFSETS[type]) {
      const anchor = graph.step(cell, -a, -b);
      if (!anchor) continue;
      if (!graph.step(anchor, sr, sc)) continue;
      if (!graph.step(anchor, sr - a, sc - b)) continue;
      for (const v of TYPE_VALUES[type]) triples.push([OFF - a, OFF - b, v]);
    }
  }
  return triples;
};

const placementNFA = memo((triples) => NFA.encodeSpec({
  startState: { phase: 'a' },
  transition: (state, value) => {
    if (state.done) return undefined;
    if (state.phase === 'a') return { phase: 'b', a: value };
    if (state.phase === 'b') {
      const types = [...new Set(triples
        .filter(t => t[0] === state.a && t[1] === value).map(t => t[2]))].sort();
      return types.length ? { phase: 's', types } : undefined;
    }
    return state.types.includes(value) ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

const placementRules = gridCells.map(cell => new NFA(
  placementNFA(placementsFor(cell)), 'placement',
  va.at(cell), vb.at(cell), vs.at(cell)));

// --- 180-degree symmetry ------------------------------------------------
// Two cells are each other's mirror image about exactly one point, so a pair of
// cells fixes the anchor and centre type that would relate them. The machine
// reads [VA, VB, VS] of each cell and demands they either both name that galaxy
// or both name a different one.
const symmetryNFA = memo((a1, b1, a2, b2, types) => NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.done) return undefined;
    if (state.phase === 0) return { phase: 1, ok: value === a1 };
    if (state.phase === 1) return { phase: 2, ok: state.ok && value === b1 };
    if (state.phase === 2) {
      return { phase: 3, first: state.ok && types.includes(value) };
    }
    if (state.phase === 3) {
      return { phase: 4, first: state.first, ok: value === a2 };
    }
    if (state.phase === 4) {
      return { phase: 5, first: state.first, ok: state.ok && value === b2 };
    }
    const second = state.ok && types.includes(value);
    return second === state.first ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

const symmetryRules = (() => {
  const seen = new Set();
  const rules = [];
  for (const cell of gridCells) {
    for (const type of TYPES) {
      const [sr, sc] = CENTRE_STEP[type];
      for (const [a, b] of OFFSETS[type]) {
        const anchor = graph.step(cell, -a, -b);
        if (!anchor) continue;
        if (!graph.step(anchor, sr, sc)) continue;
        const mate = graph.step(anchor, sr - a, sc - b);
        if (!mate || mate === cell) continue;
        // One rule per unordered pair; take the pair in grid order so the two
        // directions compile to the same machine.
        const first = gridCells.indexOf(cell) < gridCells.indexOf(mate)
          ? [cell, [a, b]] : [mate, [sr - a, sc - b]];
        const second = first[0] === cell
          ? [mate, [sr - a, sc - b]] : [cell, [a, b]];
        const k = `${first[0]}|${second[0]}|${type}`;
        if (seen.has(k)) continue;
        seen.add(k);
        rules.push(new NFA(
          symmetryNFA(OFF - first[1][0], OFF - first[1][1],
            OFF - second[1][0], OFF - second[1][1], TYPE_VALUES[type]),
          'galaxy-symmetry',
          va.at(first[0]), vb.at(first[0]), vs.at(first[0]),
          va.at(second[0]), vb.at(second[0]), vs.at(second[0])));
      }
    }
  }
  return rules;
})();

// --- Border flags -------------------------------------------------------
// VE/VF say whether the cell and the neighbour across that border are in one
// galaxy. Stepping (sr, sc) from a cell moves the anchor offset by (-sr, -sc),
// so sharing an anchor is a fixed arithmetic relation between the two cells'
// overlays. Read as [flag, VA, VA', VB, VB', VS, VS'].
const borderNFA = memo((sr, sc) => NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.done) return undefined;
    if (state.phase === 0) return { phase: 1, together: value === TOGETHER };
    if (state.phase === 1) {
      return { phase: 2, together: state.together, a: value };
    }
    if (state.phase === 2) {
      return { phase: 3, together: state.together, ok: value === state.a - sr };
    }
    if (state.phase === 3) {
      return { phase: 4, together: state.together, ok: state.ok, b: value };
    }
    if (state.phase === 4) {
      return {
        phase: 5, together: state.together,
        ok: state.ok && value === state.b - sc,
      };
    }
    if (state.phase === 5) {
      return { phase: 6, together: state.together, ok: state.ok, s: value };
    }
    const shared = state.ok && value === state.s;
    return shared === state.together ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

// The flag overlays are whole-grid, so the last column and last row have no
// border to describe; pin them so they add no free choice.
const borderRules = gridCells.flatMap(cell => [[ve, 0, 1], [vf, 1, 0]].flatMap(
  ([flag, sr, sc]) => {
    const other = graph.step(cell, sr, sc);
    if (!other) return [new Given(flag.at(cell), APART)];
    return [new NFA(borderNFA(sr, sc), 'shared-galaxy',
      flag.at(cell), va.at(cell), va.at(other), vb.at(cell), vb.at(other),
      vs.at(cell), vs.at(other))];
  }));

const borderFlagAt = (cell, sr, sc) => {
  if (sr === 0 && sc === 1) return ve.at(cell);
  if (sr === 1 && sc === 0) return vf.at(cell);
  const other = graph.step(cell, sr, sc);
  return sc === -1 ? ve.at(other) : vf.at(other);
};

// --- Connectivity -------------------------------------------------------
// VD is the cell's distance from its anchor, plus one. Two rules make it both
// a proof of connectivity and a value the partition determines outright: every
// non-anchor cell has a galaxy-mate one step nearer the anchor, which walks a
// chain down to the anchor; and galaxy-mates across a border differ by at most
// one, which stops VD running ahead of the true distance.

// [VA, VB, VD]: VD is 1 exactly on the anchor.
const anchorDepthNFA = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.done) return undefined;
    if (state.phase === 0) return { phase: 1, a: value === OFF };
    if (state.phase === 1) return { phase: 2, anchor: state.a && value === OFF };
    return state.anchor === (value === 1) ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues);

const anchorDepthRules = gridCells.map(cell => new NFA(
  anchorDepthNFA, 'anchor-depth', va.at(cell), vb.at(cell), vd.at(cell)));

// [VD, then (border flag, neighbour VD) for each in-grid neighbour].
const descentNFA = memo((count) => NFA.encodeSpec({
  startState: { phase: 'd' },
  transition: (state, value) => {
    if (state.done) return undefined;
    if (state.phase === 'd') {
      return { phase: 'f', d: value, i: 0, found: value === 1 };
    }
    if (state.phase === 'f') {
      if (state.i === count) return undefined;
      return {
        phase: 'n', d: state.d, i: state.i, found: state.found,
        together: value === TOGETHER,
      };
    }
    const hit = state.together && value === state.d - 1;
    return {
      phase: 'f', d: state.d, i: state.i + 1, found: state.found || hit,
    };
  },
  accept: (state) =>
    state.phase === 'f' && state.i === count && state.found === true,
}, numValues));

const descentRules = gridCells.map(cell => {
  const neighbours = STEPS.filter(([sr, sc]) => graph.step(cell, sr, sc));
  return new NFA(descentNFA(neighbours.length), 'galaxy-connected',
    vd.at(cell),
    ...neighbours.flatMap(([sr, sc]) => [
      borderFlagAt(cell, sr, sc), vd.at(graph.step(cell, sr, sc))]));
});

// [border flag, VD, VD']: galaxy-mates are at most one step apart in depth.
const depthSpreadNFA = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.done) return undefined;
    if (state.phase === 0) return { phase: 1, together: value === TOGETHER };
    if (state.phase === 1) {
      return { phase: 2, together: state.together, d: value };
    }
    return !state.together || Math.abs(state.d - value) <= 1
      ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues);

const depthSpreadRules = gridCells.flatMap(cell =>
  [[ve, 0, 1], [vf, 1, 0]].flatMap(([flag, sr, sc]) => {
    const other = graph.step(cell, sr, sc);
    if (!other) return [];
    return [new NFA(depthSpreadNFA, 'depth-spread',
      flag.at(cell), vd.at(cell), vd.at(other))];
  }));

// --- Galaxy size --------------------------------------------------------
// One machine per cell over every cell that could point at it: if this cell is
// an anchor, the cells naming it are its galaxy, so their number is its size.
// Read as [VA, VB of the cell, then VA, VB of each candidate member, then VS].
// Nine cells is the cap, and reaching it is exactly what VS calls big.
const sizeNFA = memo((expected) => NFA.encodeSpec({
  startState: { phase: 'a' },
  transition: (state, value) => {
    if (state.done) return undefined;
    if (state.phase === 'a') return { phase: 'b', a: value === OFF };
    if (state.phase === 'b') {
      return state.a && value === OFF
        ? { phase: 'w', i: 0, n: 1 } : { phase: 'x', i: 0 };
    }
    // Not an anchor: consume the candidates and the type without constraint.
    if (state.phase === 'x') {
      return state.i < 2 * expected.length
        ? { phase: 'x', i: state.i + 1 } : { done: true };
    }
    if (state.phase === 'w') {
      if (state.i === expected.length) {
        return (state.n === MAX_GALAXY) === (value === CELL_BIG)
          ? { done: true } : undefined;
      }
      return {
        phase: 'v', i: state.i, n: state.n, m: value === expected[state.i][0],
      };
    }
    const n = state.n + (state.m && value === expected[state.i][1] ? 1 : 0);
    return n > MAX_GALAXY ? undefined : { phase: 'w', i: state.i + 1, n };
  },
  accept: ({ done }) => done === true,
}, numValues));

const sizeRules = gridCells.map(cell => {
  const candidates = ALL_OFFSETS
    .filter(([a, b]) => (a !== 0 || b !== 0) && graph.step(cell, a, b));
  // A member sitting (a, b) from the anchor names it with (OFF - a, OFF - b).
  const expected = candidates.map(([a, b]) => [OFF - a, OFF - b]);
  return new NFA(sizeNFA(expected), 'galaxy-size',
    va.at(cell), vb.at(cell),
    ...candidates.flatMap(([a, b]) => {
      const member = graph.step(cell, a, b);
      return [va.at(member), vb.at(member)];
    }),
    vs.at(cell));
});

// --- Digits do not repeat in a galaxy -----------------------------------
// One machine per ordered pair of cells that could share a galaxy, read as
// [VA, VA', VB, VB', digit, digit'].
const distinctNFA = memo((dr, dc) => NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.done) return undefined;
    if (state.phase === 0) return { phase: 1, a: value };
    if (state.phase === 1) return { phase: 2, ok: value === state.a - dr };
    if (state.phase === 2) return { phase: 3, ok: state.ok, b: value };
    if (state.phase === 3) {
      return { phase: 4, together: state.ok && value === state.b - dc };
    }
    if (state.phase === 4) {
      return { phase: 5, together: state.together, d: value };
    }
    return !state.together || value !== state.d ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

const distinctRules = SPANS.flatMap(([dr, dc]) => gridCells.flatMap(cell => {
  const other = graph.step(cell, dr, dc);
  if (!other) return [];
  return [new NFA(distinctNFA(dr, dc), 'galaxy-distinct',
    va.at(cell), va.at(other), vb.at(cell), vb.at(other), cell, other)];
}));

// --- The circle at the centre -------------------------------------------
// One machine per cell, read as [VA, VB, VS, own digit, then the right and the
// lower digit where those cells exist]. On an anchor: a cell centre makes the
// anchor's digit odd, and an edge centre makes the anchor and its partner
// consecutive. Cells that are not anchors carry no circle.
const centreNFA = memo((slots) => NFA.encodeSpec({
  startState: { phase: 'a' },
  transition: (state, value) => {
    if (state.done) return undefined;
    if (state.phase === 'a') return { phase: 'b', a: value === OFF };
    if (state.phase === 'b') {
      return { phase: 't', anchor: state.a && value === OFF };
    }
    if (state.phase === 't') {
      return { phase: 'd', t: state.anchor ? value : 0 };
    }
    if (state.phase === 'd') {
      if (state.t === 0) return { phase: 's', i: 0, need: 0, d: 0 };
      if (state.t === CELL_ISLAND || state.t === CELL_BIG) {
        return value % 2 === 1 ? { phase: 's', i: 0, need: 0, d: 0 } : undefined;
      }
      const need = state.t === EDGE_RIGHT ? 0 : 1;
      if (!slots.includes(need)) return undefined;
      return { phase: 's', i: 0, need: need + 1, d: value };
    }
    if (state.i === slots.length) return undefined;
    if (state.need === slots[state.i] + 1) {
      return Math.abs(state.d - value) === 1
        ? { phase: 's', i: state.i + 1, need: 0, d: 0 } : undefined;
    }
    return { phase: 's', i: state.i + 1, need: state.need, d: state.d };
  },
  accept: (state) => state.phase === 's' && state.i === slots.length,
}, numValues));

const centreRules = gridCells.map(cell => {
  // slot 0 is the cell to the right, slot 1 the cell below.
  const partners = [[0, 1], [1, 0]]
    .map(([sr, sc], i) => [i, graph.step(cell, sr, sc)])
    .filter(([, other]) => other);
  return new NFA(centreNFA(partners.map(([i]) => i)), 'centre-circle',
    va.at(cell), vb.at(cell), vs.at(cell), cell,
    ...partners.map(([, other]) => other));
});

// --- Islands never touch ------------------------------------------------
// One machine per king-adjacent pair, read as [VS, VS', VA, VA', VB, VB']: two
// island cells that touch must be the same island.
const touchNFA = memo((dr, dc) => NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.done) return undefined;
    if (state.phase === 0) {
      return { phase: 1, island: ISLAND_VALUES.includes(value) };
    }
    if (state.phase === 1) {
      return { phase: 2, both: state.island && ISLAND_VALUES.includes(value) };
    }
    if (state.phase === 2) return { phase: 3, both: state.both, a: value };
    if (state.phase === 3) {
      return { phase: 4, both: state.both, ok: value === state.a - dr };
    }
    if (state.phase === 4) {
      return { phase: 5, both: state.both, ok: state.ok, b: value };
    }
    const together = state.ok && value === state.b - dc;
    return !state.both || together ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

const touchRules = KING_STEPS.flatMap(([dr, dc]) => gridCells.flatMap(cell => {
  const other = graph.step(cell, dr, dc);
  if (!other) return [];
  return [new NFA(touchNFA(dr, dc), 'islands-apart',
    vs.at(cell), vs.at(other), va.at(cell), va.at(other),
    vb.at(cell), vb.at(other))];
}));

// --- Outside clues ------------------------------------------------------
// Drawn clues, transcribed from the numbers printed outside the frame: rows
// carry theirs on the left, columns theirs on top.
const ROW_CLUES = { 1: 20, 4: 17, 5: 1, 9: 24 };
const COL_CLUES = { 1: 19, 2: 8, 5: 15, 7: 11 };

// Read as [VS, digit] per cell along the line, adding up the island cells.
const clueNFA = memo((total) => NFA.encodeSpec({
  startState: { phase: 's', sum: 0 },
  transition: (state, value) => {
    if (state.done) return undefined;
    if (state.phase === 's') {
      return {
        phase: 'd', sum: state.sum, on: ISLAND_VALUES.includes(value),
      };
    }
    const sum = state.sum + (state.on ? value : 0);
    return sum > total ? undefined : { phase: 's', sum };
  },
  accept: (state) => state.phase === 's' && state.sum === total,
}, numValues));

const clueRules = [
  ...Object.entries(ROW_CLUES).map(([n, total]) => [graph.row(+n), total]),
  ...Object.entries(COL_CLUES).map(([n, total]) => [graph.column(+n), total]),
].map(([cells, total]) => new NFA(clueNFA(total), 'island-sum',
  ...cells.flatMap(cell => [vs.at(cell), cell])));

// --- Drawn circles ------------------------------------------------------
// Transcribed from the seven drawn circles: three sit inside a cell, four on a
// vertical border between two cells of a row. Each marks a galaxy centre, so
// the cell (or the left cell of the pair) is an anchor of that centre type.
const CIRCLE_CELLS = ['R2C4', 'R3C8', 'R6C3'];
const CIRCLE_BORDERS_RIGHT = ['R1C5', 'R1C8', 'R3C6', 'R6C8'];

const circleRules = [
  ...CIRCLE_CELLS.flatMap(cell => [
    new Given(va.at(cell), OFF), new Given(vb.at(cell), OFF),
    new Given(vs.at(cell), CELL_ISLAND, CELL_BIG),
  ]),
  ...CIRCLE_BORDERS_RIGHT.flatMap(cell => [
    new Given(va.at(cell), OFF), new Given(vb.at(cell), OFF),
    new Given(vs.at(cell), EDGE_RIGHT),
  ]),
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  new Given('R2C3', 1),
  new Given('R3C9', 7),
  new Given('R5C1', 2),
  new Given('R7C3', 9),
  va.toVar('anchorRow'),
  vb.toVar('anchorCol'),
  vs.toVar('centreType'),
  vd.toVar('anchorDepth'),
  ve.toVar('sharedRight'),
  vf.toVar('sharedDown'),
  vsDomain,
  veDomain,
  vfDomain,
  ...placementRules,
  ...symmetryRules,
  ...borderRules,
  ...anchorDepthRules,
  ...descentRules,
  ...depthSpreadRules,
  ...sizeRules,
  ...distinctRules,
  ...centreRules,
  ...touchRules,
  ...clueRules,
  ...circleRules,
];
