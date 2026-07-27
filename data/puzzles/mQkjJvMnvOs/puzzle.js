// Title: Kurodoku
// Author: Malrog & yttrio
// Video: https://www.youtube.com/watch?v=mQkjJvMnvOs
// Source: https://sudokupad.app/ydykj28b2l

// Rules encoded here, in full:
//  * Chaos construction: 1-9 once per row, column and solver-built region of
//    nine orthogonally connected cells.
//  * Two orthogonally connected shaded groups per region, of equal size and
//    equal shape up to rotation and reflection; shaded groups are never
//    orthogonally adjacent.
//  * An arrow cell is unshaded, and its digit is the size of the shaded group
//    occupying the neighbouring cell in the arrow's direction.
//  * Where a region's groups hold more than one cell, one group's digits are
//    consecutive and the other group's orthogonally adjacent digits differ by
//    at least 5; which is which is for the solver.
//
// A region has nine cells and two disjoint groups of equal size, so a group
// never exceeds four cells. Every group is therefore a polyomino of size 1-4,
// which is what makes the shading expressible: a group is small enough to be
// named by the offset from each of its cells back to the group's first cell in
// reading order, and there are only nine shapes it can take. Four Var overlays
// per cell carry that offset (VA, VB), the shape class of the region's groups
// (VS), and the cell's part in the shading (VG).

const UP = [-1, 0], DOWN = [1, 0], LEFT = [0, -1], RIGHT = [0, 1];
const UP_LEFT = [-1, -1], UP_RIGHT = [-1, 1], DOWN_RIGHT = [1, 1];

// Drawn arrow ticks: cell -> the direction of each tick on it. A tick along a
// cell midline points into the orthogonal neighbour; a tick at 45 degrees
// points into the diagonal neighbour sharing that corner.
const ARROWS = [
  { cell: 'R1C3', dirs: [LEFT, DOWN] },
  { cell: 'R1C6', dirs: [RIGHT] },
  { cell: 'R1C8', dirs: [RIGHT] },
  { cell: 'R3C8', dirs: [RIGHT] },
  { cell: 'R4C2', dirs: [UP] },
  { cell: 'R4C7', dirs: [UP_LEFT, DOWN_RIGHT] },
  { cell: 'R5C4', dirs: [UP_RIGHT, DOWN_RIGHT] },
  { cell: 'R6C4', dirs: [UP_LEFT] },
  { cell: 'R6C8', dirs: [RIGHT] },
  { cell: 'R7C7', dirs: [DOWN_RIGHT] },
  { cell: 'R8C2', dirs: [UP, LEFT] },
  { cell: 'R9C2', dirs: [RIGHT] },
];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const numValues = geometry.numValues;
const gridCells = graph.cells();

// --- The polyominoes a group can be -------------------------------------
// Every fixed polyomino of size 1-4, translated so its first cell in reading
// order sits at [0, 0]. A group is stored by pointing each of its cells at
// that first cell, so these offset sets are the shapes a group may take.

const key = (cells) => JSON.stringify(cells);
// Compiling an NFA spec is expensive, and most cells share one: memoise by the
// spec's parameters so each distinct machine is built once.
const memo = (fn) => {
  const cache = new Map();
  return (...args) => {
    const k = key(args);
    if (!cache.has(k)) cache.set(k, fn(...args));
    return cache.get(k);
  };
};
const sortCells = (cells) =>
  cells.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
const normalise = (cells) => {
  const [r0, c0] = sortCells(cells)[0];
  return sortCells(cells.map(([r, c]) => [r - r0, c - c0]));
};

const fixedShapes = (() => {
  const seen = new Map();
  let layer = [normalise([[0, 0]])];
  seen.set(key(layer[0]), layer[0]);
  for (let size = 2; size <= 4; size++) {
    const next = new Map();
    for (const shape of layer) {
      for (const [r, c] of shape) {
        for (const [dr, dc] of [UP, DOWN, LEFT, RIGHT]) {
          const grown = [r + dr, c + dc];
          if (shape.some(([a, b]) => a === grown[0] && b === grown[1])) continue;
          const norm = normalise([...shape, grown]);
          next.set(key(norm), norm);
        }
      }
    }
    layer = [...next.values()];
    for (const [k, v] of next) seen.set(k, v);
  }
  return [...seen.values()].sort((a, b) => a.length - b.length || key(a).localeCompare(key(b)));
})();

// Rotations and reflections of a shape, for grouping the fixed shapes into the
// free classes that "same shape, but may be rotated or reflected" compares.
const symmetries = (cells) => {
  const out = [];
  let turned = cells;
  for (let i = 0; i < 4; i++) {
    turned = turned.map(([r, c]) => [c, -r]);
    out.push(key(normalise(turned)));
    out.push(key(normalise(turned.map(([r, c]) => [r, -c]))));
  }
  return out;
};
const classKeys = [...new Set(fixedShapes.map(s => symmetries(s).sort()[0]))]
  .sort((a, b) => JSON.parse(a).length - JSON.parse(b).length || a.localeCompare(b));
// SHAPES[i] = { offsets, cls } -- cls is 1-based and there are exactly 9 of
// them (1 monomino, 1 domino, 2 trominoes, 5 tetrominoes), so a class fits in
// a single Var cell.
const SHAPES = fixedShapes.map(offsets => ({
  offsets,
  cls: classKeys.indexOf(symmetries(offsets).sort()[0]) + 1,
}));
const CLASS_SIZE = classKeys.map(k => JSON.parse(k).length);

// Every offset any group cell can have from its group's first cell, in reading
// order; OFFSETS[0] is [0, 0], the first cell itself.
const OFFSETS = sortCells([...new Map(
  SHAPES.flatMap(s => s.offsets).map(o => [key(o), o])).values()]);
const OFFSET_POS = new Map(OFFSETS.map((o, i) => [key(o), i]));
const DR_MIN = Math.min(...OFFSETS.map(o => o[0]));
const DC_MIN = Math.min(...OFFSETS.map(o => o[1]));

// --- Var encodings ------------------------------------------------------
// VA/VB: the offset from this cell back to its group's first cell, as
//   VA = dRow - DR_MIN + 1, VB = dCol - DC_MIN + 1; UNSHADED_A/B mean unshaded.
// VS: the free polyomino class (1-9) of the two groups of this cell's region,
//   carried by every cell of the region, shaded or not. Because one value
//   serves the whole region, "both groups have the same size and shape, up to
//   rotation and reflection" needs no further constraint.
// VG: what this cell is within the shading. A group of two or more cells is
//   either the region's renban group or its whisper group, and exactly one
//   cell of each group -- the one the others point at -- is its FIRST cell.
const encA = (dRow) => dRow - DR_MIN + 1;
const encB = (dCol) => dCol - DC_MIN + 1;
const UNSHADED_A = encA(Math.max(...OFFSETS.map(o => o[0]))) + 1;
const UNSHADED_B = encB(Math.max(...OFFSETS.map(o => o[1]))) + 1;
const FIRST_A = encA(0), FIRST_B = encB(0);
const UNSHADED_G = 1, LONE = 2;
const RENBAN = 3, RENBAN_FIRST = 4, WHISPER = 5, WHISPER_FIRST = 6;
const ROLES = [UNSHADED_G, LONE, RENBAN, RENBAN, WHISPER, WHISPER];
const isFirstCell = (g) => g === LONE || g === RENBAN_FIRST || g === WHISPER_FIRST;

const va = graph.makeOverlay('VA');
const vb = graph.makeOverlay('VB');
const vs = graph.makeOverlay('VS');
const vg = graph.makeOverlay('VG');

// --- Var domains --------------------------------------------------------
const roleDomain = vg.makeReplicate(
  new Given(vg.cells()[0], ...ROLES.map((_, i) => i + 1)));

// --- Per-cell overlay agreement -----------------------------------------
// The four overlays must agree about the cell: the offset must be one that
// keeps the group's first cell on the grid, VG must say "unshaded" exactly
// when the offset does and must mark a first cell exactly when the offset is
// zero, and a region whose class is a single cell has no renban/whisper roles
// to hand out. Read as [VA, VB, VS, VG] of one cell.
const cellAgreeNFA = memo((offsets) => NFA.encodeSpec({
  startState: { phase: 'a' },
  transition: (state, value) => {
    if (state.phase === 'a') return { phase: 'b', a: value };
    if (state.phase === 'b') {
      if (state.a === UNSHADED_A) {
        return value === UNSHADED_B ? { phase: 's', shaded: false } : undefined;
      }
      const ok = offsets.some(([dr, dc]) => encA(dr) === state.a && encB(dc) === value);
      if (!ok) return undefined;
      return { phase: 's', shaded: true, first: state.a === FIRST_A && value === FIRST_B };
    }
    if (state.phase === 's') {
      return { phase: 'g', shaded: state.shaded, first: state.first,
        lone: CLASS_SIZE[value - 1] === 1 };
    }
    if (!state.shaded) return value === UNSHADED_G ? { done: true } : undefined;
    if (value === UNSHADED_G) return undefined;
    if (state.lone !== (value === LONE)) return undefined;
    return isFirstCell(value) === state.first ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));
const cellAgree = gridCells.map(cell => new NFA(
  cellAgreeNFA(OFFSETS.filter(([dr, dc]) => graph.step(cell, -dr, -dc))),
  'shade-agree', va.at(cell), vb.at(cell), vs.at(cell), vg.at(cell)));

// --- Group membership ---------------------------------------------------
// Read as [VA of the cell, VA of the neighbour, X of the cell, X of the
// neighbour]: two orthogonally adjacent shaded cells are in the same group, so
// they agree about the group's region, and about its renban/whisper role.
const sameWhenBothShadedNFA = memo((project) => NFA.encodeSpec({
  startState: { phase: 'a1' },
  transition: (state, value) => {
    if (state.phase === 'a1') return { phase: 'a2', shaded: value !== UNSHADED_A };
    if (state.phase === 'a2') {
      return { phase: 'x1', both: state.shaded && value !== UNSHADED_A };
    }
    if (state.phase === 'x1') {
      return { phase: 'x2', both: state.both, x: project === 'role' ? ROLES[value - 1] : value };
    }
    const other = project === 'role' ? ROLES[value - 1] : value;
    return !state.both || state.x === other ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

// ...and they point at the same first cell, which is what "shaded groups may
// not be orthogonally adjacent" amounts to once groups are read as the
// connected components of the shading. Read as
// [VA cell, VA neighbour, VB cell, VB neighbour] for a neighbour at [dr, dc].
const sameGroupNFA = memo((dRow, dCol) => NFA.encodeSpec({
  startState: { phase: 'a1' },
  transition: (state, value) => {
    if (state.phase === 'a1') return { phase: 'a2', a: value };
    if (state.phase === 'a2') {
      if (state.a === UNSHADED_A || value === UNSHADED_A) return { phase: 'b1', off: true };
      return value - state.a === dRow ? { phase: 'b1', off: false } : undefined;
    }
    if (state.phase === 'b1') {
      return state.off ? { phase: 'b2', off: true } : { phase: 'b2', off: false, b: value };
    }
    if (state.off) return { done: true };
    return value - state.b === dCol ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

// A region's class is carried by every one of its cells, and regions are
// orthogonally connected, so agreement between same-region neighbours spreads
// it over the whole region. Read as [CC cell, CC neighbour, VS cell,
// VS neighbour].
const sameClassNFA = NFA.encodeSpec({
  startState: { phase: 'c1' },
  transition: (state, value) => {
    if (state.phase === 'c1') return { phase: 'c2', c: value };
    if (state.phase === 'c2') return { phase: 's1', same: state.c === value };
    if (state.phase === 's1') return { phase: 's2', same: state.same, s: value };
    return !state.same || state.s === value ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues);

// Whisper role: orthogonally adjacent digits inside that group differ by >= 5.
// Read as [VG cell, VG neighbour, digit cell, digit neighbour].
const whisperNFA = NFA.encodeSpec({
  startState: { phase: 'g1' },
  transition: (state, value) => {
    if (state.phase === 'g1') return { phase: 'g2', on: ROLES[value - 1] === WHISPER };
    if (state.phase === 'g2') {
      return { phase: 'd1', on: state.on && ROLES[value - 1] === WHISPER };
    }
    if (state.phase === 'd1') return { phase: 'd2', on: state.on, d: value };
    return !state.on || Math.abs(state.d - value) >= 5 ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues);

const cc = graph.makeOverlay('CC');
const pairRules = gridCells.flatMap(cell => [RIGHT, DOWN].flatMap(([dr, dc]) => {
  const other = graph.step(cell, dr, dc);
  if (!other) return [];
  const pair = [cell, other];
  return [
    new NFA(sameGroupNFA(dr, dc), 'same-group',
      ...va.at(pair), ...vb.at(pair)),
    new NFA(sameWhenBothShadedNFA('value'), 'same-region', ...va.at(pair), ...cc.at(pair)),
    new NFA(sameWhenBothShadedNFA('role'), 'same-role', ...va.at(pair), ...vg.at(pair)),
    new NFA(sameClassNFA, 'region-class', ...cc.at(pair), ...vs.at(pair)),
    new NFA(whisperNFA, 'whisper', ...vg.at(pair), ...pair),
  ];
}));

// --- Group shape --------------------------------------------------------
// One machine per cell, over that cell and every cell that could point at it.
// If the cell is a group's first cell, the set of cells pointing at it must be
// exactly one fixed polyomino of the class the cell claims -- which fixes the
// group's membership, its size, its connectedness and its shape at once. If it
// is not a first cell, nothing may point at it.
// Read as [VS, VA, VB of the cell, then VA, VB of each candidate member].
const shapeNFA = memo((window) => {
  const candidates = SHAPES.map((shape, index) => ({ shape, index }))
    .filter(({ shape }) => shape.offsets.every(
      o => OFFSET_POS.get(key(o)) === 0 || window.includes(OFFSET_POS.get(key(o)))));
  return NFA.encodeSpec({
    startState: { phase: 'cls' },
    transition: (state, value) => {
      if (state.phase === 'cls') return { phase: 'a', cls: value };
      if (state.phase === 'a') return { phase: 'b', cls: state.cls, a: value };
      if (state.phase === 'b') {
        if (state.a !== FIRST_A || value !== FIRST_B) {
          return { phase: 'w', i: 0, cand: null };
        }
        const cand = candidates
          .filter(c => c.shape.cls === state.cls).map(c => c.index);
        return cand.length ? { phase: 'w', i: 0, cand } : undefined;
      }
      if (state.phase === 'w') {
        // The cell list ends here; any further symbol is not this group's.
        if (state.i >= window.length) return undefined;
        return { phase: 'wb', i: state.i, cand: state.cand, a: value };
      }
      // A member declares the offset of the window slot it sits in.
      const [dr, dc] = OFFSETS[window[state.i]];
      const points = state.a === encA(dr) && value === encB(dc);
      if (state.cand === null) {
        return points ? undefined : { phase: 'w', i: state.i + 1, cand: null };
      }
      const cand = state.cand.filter(
        index => SHAPES[index].offsets.some(
          o => OFFSET_POS.get(key(o)) === window[state.i]) === points);
      if (!cand.length) return undefined;
      return { phase: 'w', i: state.i + 1, cand };
    },
    accept: (state) => state.phase === 'w' && state.i === window.length,
  }, numValues);
});

const shapeRules = gridCells.map(cell => {
  const window = OFFSETS.map((o, i) => i)
    .filter(i => i > 0 && graph.step(cell, ...OFFSETS[i]));
  const members = window.flatMap(i => {
    const member = graph.step(cell, ...OFFSETS[i]);
    return [va.at(member), vb.at(member)];
  });
  return new NFA(shapeNFA(window), 'group-shape',
    vs.at(cell), va.at(cell), vb.at(cell), ...members);
});

// --- Two groups per region ----------------------------------------------
// One machine per region label, scanning [CC, VG] of every cell: the region
// must hold exactly two first cells, and where its groups are larger than one
// cell they must be one renban and one whisper group. `seen` is the first
// group's role until the second group has been checked against it.
const regionNFA = memo((label) => NFA.encodeSpec({
  startState: { phase: 'cc', n: 0, seen: null },
  transition: (state, value) => {
    if (state.phase === 'cc') {
      return { phase: 'g', n: state.n, seen: state.seen, mine: value === label };
    }
    if (!state.mine || !isFirstCell(value)) {
      return { phase: 'cc', n: state.n, seen: state.seen };
    }
    const role = ROLES[value - 1];
    if (state.n === 0) return { phase: 'cc', n: 1, seen: role };
    if (state.n > 1) return undefined;
    // Single-cell groups take no role, so both of them are LONE; larger groups
    // are one renban and one whisper.
    const ok = state.seen === LONE ? role === LONE : role !== state.seen;
    return ok ? { phase: 'cc', n: 2, seen: null } : undefined;
  },
  accept: (state) => state.phase === 'cc' && state.n === 2,
}, numValues));

const regionRules = Array.from({ length: numValues }, (_, i) => new NFA(
  regionNFA(i + 1), 'two-groups',
  ...gridCells.flatMap(cell => [cc.at(cell), vg.at(cell)])));

// --- Renban role --------------------------------------------------------
// The digits of a renban group are consecutive. Group cells sit in one region,
// so they are already distinct; consecutive is then exactly "every pair inside
// the group differs by less than the group's size". One machine per ordered
// pair of cells that could share a group, read as
// [VA cell, VA other, VB cell, VB other, VG cell, VS cell, digit, digit].
const renbanNFA = memo((dRow, dCol) => NFA.encodeSpec({
  startState: { phase: 'a1' },
  transition: (state, value) => {
    if (state.phase === 'a1') return { phase: 'a2', a: value };
    if (state.phase === 'a2') {
      const on = state.a !== UNSHADED_A && value !== UNSHADED_A && value - state.a === dRow;
      return { phase: 'b1', on };
    }
    if (state.phase === 'b1') return { phase: 'b2', on: state.on, b: value };
    if (state.phase === 'b2') {
      return { phase: 'g', on: state.on && value - state.b === dCol };
    }
    if (state.phase === 'g') {
      return { phase: 's', on: state.on && ROLES[value - 1] === RENBAN };
    }
    if (state.phase === 's') {
      return { phase: 'd1', span: state.on ? CLASS_SIZE[value - 1] - 1 : null };
    }
    if (state.phase === 'd1') return { phase: 'd2', span: state.span, d: value };
    if (state.span === null) return { done: true };
    return Math.abs(state.d - value) <= state.span ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

// The displacements between two cells of one group, one per unordered pair.
const spans = [...new Map(SHAPES.flatMap(({ offsets }) =>
  offsets.flatMap(a => offsets.map(b => [a[0] - b[0], a[1] - b[1]])))
  .filter(([dr, dc]) => dr > 0 || (dr === 0 && dc > 0))
  .map(d => [key(d), d])).values()];

const renbanRules = spans.flatMap(([dr, dc]) => gridCells.flatMap(cell => {
  const other = graph.step(cell, dr, dc);
  if (!other) return [];
  return [new NFA(renbanNFA(dr, dc), 'renban',
    va.at(cell), va.at(other), vb.at(cell), vb.at(other),
    vg.at(cell), vs.at(cell), cell, other)];
}));

// --- Arrows -------------------------------------------------------------
// Read as [digit of the arrow cell, VA of the indicated cell, VS of the
// indicated cell]: the indicated cell is shaded and its group's class has as
// many cells as the arrow cell's digit.
const arrowNFA = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'a', size: value };
    if (state.phase === 'a') {
      return value === UNSHADED_A ? undefined : { phase: 's', size: state.size };
    }
    return CLASS_SIZE[value - 1] === state.size ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues);

const arrowRules = ARROWS.flatMap(({ cell, dirs }) => [
  new Given(va.at(cell), UNSHADED_A),
  ...dirs.map(dir => {
    const target = graph.step(cell, ...dir);
    return new NFA(arrowNFA, 'arrow', cell, va.at(target), vs.at(target));
  }),
]);

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  new Given('R3C4', 8),
  va.toVar('anchorRow'),
  vb.toVar('anchorCol'),
  vs.toVar('shapeClass'),
  vg.toVar('groupRole'),
  roleDomain,
  ...cellAgree,
  ...pairRules,
  ...shapeRules,
  ...regionRules,
  ...renbanRules,
  ...arrowRules,
];
