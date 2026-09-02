// Title: Kurotto Killer Sudoku
// Author: KNT
// Video: https://www.youtube.com/watch?v=apmdn5dOZxk
// Source: https://app.crackingthecryptic.com/sudoku/RpBBf44hrH

const shape = new Shape('9x9');
const NUM_DIGITS = 9;

// The eight white circle underlays, one per cell.
const CIRCLES = ['R1C2', 'R1C3', 'R1C7', 'R2C7', 'R3C3', 'R6C4', 'R7C3', 'R9C7'];

// The fifteen small numbers drawn in a cell's top-left corner: [cell, total].
const SUMS = [
  ['R1C4', 14], ['R1C9', 12],
  ['R2C1', 5], ['R2C2', 9], ['R2C4', 21], ['R2C6', 40], ['R2C9', 12],
  ['R3C6', 36], ['R3C8', 14],
  ['R4C2', 8],
  ['R5C3', 36],
  ['R6C7', 28],
  ['R8C9', 16],
  ['R9C4', 30], ['R9C5', 28],
];

// ---------------------------------------------------------------------------
// Shading model.
//
// Rules encoded below:
//   R1. Normal sudoku.
//   R2. Some cells are shaded (implied by R3: every circle digit is at least 1,
//       so shaded cells exist; no separate constraint).
//   R3. A digit in a circle = the total count of shaded cells over the distinct
//       orthogonally-connected shaded groups that share an edge with that cell.
//   R4. A circled cell is never shaded.
//   R5. Every orthogonally-connected group of like-shaded cells has no repeated
//       digit.
//   R6. A number in a cell's top-left corner = the sum of the digits in that
//       cell's orthogonally-connected group.
//
// R5 caps every group at NUM_DIGITS cells, so the partition is bounded and each
// group is identified by an overlay stack rather than by a label per group
// (there are more groups than a label overlay can hold):
//   VS  shade, 1 = unshaded, 2 = shaded
//   VD  distance from the cell to its group's root, 1 at the root
//   VP  direction of the cell's parent in the spanning tree, ROOT at the root
//   VR, VC  row and column of the group's root cell
//   VA, VB, VE  bitmask of the digits in the cell's subtree, three digits per
//       cell, stored as mask + 1
//   VF, VG, VH  the same masks for the whole group, i.e. the root's subtree
// Every group's root is its first cell in reading order (rootIsFirst), its tree
// is the breadth-first tree with a fixed direction tie-break (treeSpec), and
// both masks follow from the digits, so the overlays add no freedom of their
// own on top of a shading and a filled grid.
// ---------------------------------------------------------------------------

const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const numRows = geometry.numRows;
const numCols = geometry.numCols;
const gridCells = graph.cells();

const UNSHADED = 1, SHADED = 2;
// Parent direction codes. The order of STEPS is also the tie-break that picks
// one parent when a cell has several neighbours nearer the root, which is what
// makes the spanning tree unique.
const ROOT = 1, UP = 2, LEFT = 3, RIGHT = 4, DOWN = 5;
const STEPS = [[UP, -1, 0], [LEFT, 0, -1], [RIGHT, 0, 1], [DOWN, 1, 0]];
const OPPOSITE = { [UP]: DOWN, [DOWN]: UP, [LEFT]: RIGHT, [RIGHT]: LEFT };

const BITS = 3;                                  // digits held per mask cell
const NUM_LAYERS = Math.ceil(NUM_DIGITS / BITS);
const layerBits = (layer) => Math.min(BITS, NUM_DIGITS - layer * BITS);
const layerTop = (layer) => 1 << layerBits(layer);   // largest stored mask value

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const neighbours = (cell) => STEPS
  .map(([code, dRow, dCol]) => ({ code, cell: graph.step(cell, dRow, dCol) }))
  .filter(n => n.cell !== null);

const shade = graph.makeOverlay('VS');
const depth = graph.makeOverlay('VD');
const parent = graph.makeOverlay('VP');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const subMask = ['VA', 'VB', 'VE'].slice(0, NUM_LAYERS).map(p => graph.makeOverlay(p));
const grpMask = ['VF', 'VG', 'VH'].slice(0, NUM_LAYERS).map(p => graph.makeOverlay(p));

const overlays = [
  shade.toVar('shade'), depth.toVar('root distance'), parent.toVar('parent'),
  rootRow.toVar('root row'), rootCol.toVar('root col'),
  ...subMask.map((o, i) => o.toVar(`subtree digits ${i + 1}`)),
  ...grpMask.map((o, i) => o.toVar(`group digits ${i + 1}`)),
];

// Var cells take the grid's value range, so each is restricted to the values its
// role actually uses; an unrestricted overlay cell would be free state.
const circleSet = new Set(CIRCLES);
// R4 keeps a circled cell unshaded, so a circled neighbour can never join a
// counted group and is left out of the circle scans.
const countedNeighbours = (cell) => neighbours(cell)
  .map(n => n.cell).filter(n => !circleSet.has(n));
const DIFFERENT = 1, SAME = 2;

const domains = [
  // One replicated template per overlay; the parent directions that would
  // leave the grid are the only per-cell exception.
  shade.makeReplicate(new Given(shade.at(gridCells[0]), UNSHADED, SHADED)),
  // R4.
  ...CIRCLES.map(c => new Given(shade.at(c), UNSHADED)),
  depth.makeReplicate(new Given(depth.at(gridCells[0]), ...range(1, NUM_DIGITS))),
  rootRow.makeReplicate(new Given(rootRow.at(gridCells[0]), ...range(1, numRows))),
  rootCol.makeReplicate(new Given(rootCol.at(gridCells[0]), ...range(1, numCols))),
  ...[subMask, grpMask].flatMap(masks => masks.map((o, L) => o.makeReplicate(
    new Given(o.at(gridCells[0]), ...range(1, layerTop(L)))))),
  ...gridCells.map(c => new Given(parent.at(c),
    ROOT, ...neighbours(c).map(n => n.code))),
];

const specCache = new Map();
const spec = (key, build) => {
  if (!specCache.has(key)) specCache.set(key, build());
  return specCache.get(key);
};

// The root carries its own coordinates, and no cell of a group precedes its
// root in reading order, so the root is the group's first cell -- one choice of
// root per group, not one per cell.
const rootIsFirst = gridCells.flatMap(cell => {
  const { row, col } = parseCellId(cell);
  const index = (row - 1) * numCols + col;
  return [
    new Pair(Pair.fnToKey((p, r) => p !== ROOT || r === row, shape),
      'root row', parent.at(cell), rootRow.at(cell)),
    new Pair(Pair.fnToKey((p, c) => p !== ROOT || c === col, shape),
      'root col', parent.at(cell), rootCol.at(cell)),
    new Pair(Pair.fnToKey(
      (r, c) => r <= numRows && c <= numCols && (r - 1) * numCols + c <= index,
      shape),
      'root first', rootRow.at(cell), rootCol.at(cell)),
  ];
});

// Between two orthogonally adjacent cells: neither may take the other as its
// parent unless they are shaded alike, and cells shaded alike are in the same
// group, so they agree on the root and on the group's digit masks.
const adjacencySpec = (codeAB, codeBA) => {
  const END = 8 + 2 * NUM_LAYERS;
  return NFA.encodeSpec({
    startState: { ph: 0, s: 0, same: 0, x: 0 },
    transition: (st, value) => {
      const ph = st.ph;
      if (ph >= END) return undefined;
      if (ph === 0) {
        if (value > SHADED) return undefined;
        return { ph: 1, s: value, same: 0, x: 0 };
      }
      if (ph === 1) {
        if (value > SHADED) return undefined;
        return { ph: 2, s: 0, same: value === st.s ? 1 : 0, x: 0 };
      }
      if (ph === 2 || ph === 3) {
        const forbidden = ph === 2 ? codeAB : codeBA;
        if (!st.same && value === forbidden) return undefined;
        return { ph: ph + 1, s: 0, same: st.same, x: 0 };
      }
      if (ph % 2 === 0) {
        return { ph: ph + 1, s: 0, same: st.same, x: st.same ? value : 0 };
      }
      if (st.same && value !== st.x) return undefined;
      return { ph: ph + 1, s: 0, same: st.same, x: 0 };
    },
    accept: (st) => st.ph === END,
  }, shape);
};

const adjacency = gridCells.flatMap(a => [[RIGHT, 0, 1], [DOWN, 1, 0]].flatMap(
  ([code, dRow, dCol]) => {
    const b = graph.step(a, dRow, dCol);
    if (b === null) return [];
    const cells = [
      shade.at(a), shade.at(b), parent.at(a), parent.at(b),
      rootRow.at(a), rootRow.at(b), rootCol.at(a), rootCol.at(b),
    ];
    for (const o of grpMask) cells.push(o.at(a), o.at(b));
    return [new NFA(
      spec(`adj${code}`, () => adjacencySpec(code, OPPOSITE[code])),
      'group', ...cells)];
  }));

// Root distance and parent choice. A cell's distance is one more than the least
// distance among its like-shaded neighbours (the root, at 1, has none smaller),
// and its parent is the first neighbour in STEPS order at that lesser distance.
const treeSpec = (dirCodes) => {
  const END = 3 + 2 * dirCodes.length;
  return NFA.encodeSpec({
    startState: { ph: 0, p: 0, v: 0, s: 0, ns: 0, seen: 0 },
    transition: (st, value) => {
      const ph = st.ph;
      if (ph >= END) return undefined;
      if (ph === 0) {
        if (value !== ROOT && !dirCodes.includes(value)) return undefined;
        return { ph: 1, p: value, v: 0, s: 0, ns: 0, seen: 0 };
      }
      if (ph === 1) {
        if (value > NUM_DIGITS) return undefined;
        if (st.p === ROOT ? value !== 1 : value < 2) return undefined;
        return { ph: 2, p: st.p, v: value, s: 0, ns: 0, seen: 0 };
      }
      if (ph === 2) {
        if (value > SHADED) return undefined;
        return { ph: 3, p: st.p, v: st.v, s: value, ns: 0, seen: 0 };
      }
      if ((ph - 3) % 2 === 0) {
        if (value > SHADED) return undefined;
        return { ph: ph + 1, p: st.p, v: st.v, s: st.s, ns: value, seen: st.seen };
      }
      if (value > NUM_DIGITS) return undefined;
      const code = dirCodes[(ph - 4) >> 1];
      const alike = st.ns === st.s;
      if (alike && value < st.v - 1) return undefined;
      const nearer = alike && value === st.v - 1;
      if (nearer && !st.seen) {
        if (st.p !== code) return undefined;
      } else if (st.p === code) {
        return undefined;
      }
      return {
        ph: ph + 1, p: st.p, v: st.v, s: st.s, ns: 0,
        seen: st.seen || (nearer ? 1 : 0),
      };
    },
    accept: (st) => st.ph === END,
  }, shape);
};

const tree = gridCells.map(cell => {
  const ns = neighbours(cell);
  const cells = [parent.at(cell), depth.at(cell), shade.at(cell)];
  for (const n of ns) cells.push(shade.at(n.cell), depth.at(n.cell));
  const dirCodes = ns.map(n => n.code);
  return new NFA(
    spec(`tree${dirCodes.join('')}`, () => treeSpec(dirCodes)),
    'tree', ...cells);
});

// Subtree masks, one machine per cell per layer: a cell's mask is its own digit
// plus the masks of its children (the neighbours whose parent pointer comes back
// at it), and the bits may not collide -- which is R5, since the root's subtree
// is the whole group.
const maskSpec = (layer, backCodes) => {
  const END = 2 + 2 * backCodes.length;
  const top = layerTop(layer);
  return NFA.encodeSpec({
    startState: { ph: 0, acc: 0, dec: 0, child: 0 },
    transition: (st, value) => {
      const ph = st.ph;
      if (ph >= END) return undefined;
      if (ph === 0) {
        if (value > NUM_DIGITS) return undefined;
        const bit = value - 1 - layer * BITS;
        return {
          ph: 1, acc: (bit >= 0 && bit < BITS) ? (1 << bit) : 0, dec: 0, child: 0,
        };
      }
      if (ph === 1) {
        if (value > top) return undefined;
        return { ph: 2, acc: st.acc, dec: value - 1, child: 0 };
      }
      if ((ph - 2) % 2 === 0) {
        return {
          ph: ph + 1, acc: st.acc, dec: st.dec,
          child: value === backCodes[(ph - 2) >> 1] ? 1 : 0,
        };
      }
      if (value > top) return undefined;
      const mask = value - 1;
      if (st.child && (st.acc & mask)) return undefined;
      return {
        ph: ph + 1, acc: st.child ? (st.acc | mask) : st.acc, dec: st.dec, child: 0,
      };
    },
    accept: (st) => st.ph === END && st.acc === st.dec,
  }, shape);
};

const subtrees = gridCells.flatMap(cell => {
  const ns = neighbours(cell);
  const backCodes = ns.map(n => OPPOSITE[n.code]);
  return subMask.map((o, L) => {
    const cells = [cell, o.at(cell)];
    for (const n of ns) cells.push(parent.at(n.cell), o.at(n.cell));
    return new NFA(
      spec(`mask${L}:${backCodes.join('')}`, () => maskSpec(L, backCodes)),
      'subtree digits', ...cells);
  });
});

// The group masks are seeded at the root, where the subtree is the whole group;
// elsewhere the adjacency machines have already carried them across the group.
const groupSeedSpec = () => {
  const END = 1 + 2 * NUM_LAYERS;
  return NFA.encodeSpec({
    startState: { ph: 0, root: 0, x: 0 },
    transition: (st, value) => {
      const ph = st.ph;
      if (ph >= END) return undefined;
      if (ph === 0) return { ph: 1, root: value === ROOT ? 1 : 0, x: 0 };
      if (ph % 2 === 1) return { ph: ph + 1, root: st.root, x: value };
      if (st.root && value !== st.x) return undefined;
      return { ph: ph + 1, root: st.root, x: 0 };
    },
    accept: (st) => st.ph === END,
  }, shape);
};

const groupSeed = gridCells.map(cell => {
  const cells = [parent.at(cell)];
  for (let L = 0; L < NUM_LAYERS; L++) cells.push(subMask[L].at(cell), grpMask[L].at(cell));
  return new NFA(spec('seed', groupSeedSpec), 'group digits', ...cells);
});

// R6: the group's digits sum to the corner number.
const sumSpec = (total) => NFA.encodeSpec({
  startState: { ph: 0, sum: 0 },
  transition: (st, value) => {
    const layer = st.ph;
    if (layer >= NUM_LAYERS) return undefined;
    const bits = layerBits(layer);
    if (value > (1 << bits)) return undefined;
    let sum = st.sum;
    for (let b = 0; b < bits; b++) {
      if ((value - 1) & (1 << b)) sum += layer * BITS + b + 1;
    }
    if (sum > total) return undefined;
    return { ph: layer + 1, sum };
  },
  accept: (st) => st.ph === NUM_LAYERS && st.sum === total,
}, shape);

const groupSums = SUMS.map(([cell, total]) => new NFA(
  spec(`sum${total}`, () => sumSpec(total)),
  `group sums to ${total}`, ...grpMask.map(o => o.at(cell))));

// R3. Two neighbours of a circle lie in the same shaded group exactly when they
// carry the same root, so a same-root flag per neighbour pair is what stops a
// group that touches the circle twice from being counted twice.
const sameRootSpec = () => NFA.encodeSpec({
  startState: { ph: 0, a: 0, eq: 0 },
  transition: (st, value) => {
    if (st.ph === 0) return { ph: 1, a: value, eq: 0 };
    if (st.ph === 1) return { ph: 2, a: 0, eq: value === st.a ? 1 : 0 };
    if (st.ph === 2) return { ph: 3, a: value, eq: st.eq };
    if (st.ph === 3) {
      return { ph: 4, a: 0, eq: (st.eq && value === st.a) ? 1 : 0 };
    }
    if (st.ph === 4) {
      if (value !== (st.eq ? SAME : DIFFERENT)) return undefined;
      return { ph: 5, a: 0, eq: 0 };
    }
    return undefined;
  },
  accept: (st) => st.ph === 5,
}, shape);

// The circle's digit counts every shaded cell of every distinct group along its
// edges. Circled neighbours are left out of the scan: R4 keeps them unshaded, so
// they can never contribute.
const kurottoSpec = (k) => {
  const bitPairs = [];
  for (let j = 1; j < k; j++) for (let i = 0; i < j; i++) bitPairs.push([i, j]);
  const AFTER_SHADE = k;
  const AFTER_BITS = AFTER_SHADE + bitPairs.length;
  const END = AFTER_BITS + k * NUM_LAYERS + 1;
  return NFA.encodeSpec({
    startState: { ph: 0, sv: 0, ex: 0, inc: -1, total: 0 },
    transition: (st, value) => {
      const ph = st.ph;
      if (ph >= END) return undefined;
      if (ph < AFTER_SHADE) {
        if (value > SHADED) return undefined;
        return {
          ph: ph + 1, sv: st.sv | (value === SHADED ? 1 << ph : 0),
          ex: 0, inc: -1, total: 0,
        };
      }
      if (ph < AFTER_BITS) {
        if (value > SHADED) return undefined;
        const [i, j] = bitPairs[ph - AFTER_SHADE];
        const merged = value === SAME && ((st.sv >> i) & 1);
        return {
          ph: ph + 1, sv: st.sv, ex: st.ex | (merged ? 1 << j : 0),
          inc: -1, total: 0,
        };
      }
      if (ph < END - 1) {
        const step = ph - AFTER_BITS;
        const layer = step % NUM_LAYERS;
        // Entering the masks: fix which neighbours are counted, then shed one
        // bit per neighbour so the state does not carry finished neighbours.
        let inc = st.inc;
        if (step === 0) inc = st.sv & ~st.ex;
        else if (layer === 0) inc >>= 1;
        if (value > (1 << layerBits(layer))) return undefined;
        let total = st.total;
        if (inc & 1) {
          for (let b = 0; b < layerBits(layer); b++) {
            if ((value - 1) & (1 << b)) total++;
          }
        }
        if (total > NUM_DIGITS) return undefined;
        return { ph: ph + 1, sv: 0, ex: 0, inc, total };
      }
      if (value !== st.total) return undefined;
      return { ph: ph + 1, sv: 0, ex: 0, inc: -1, total: 0 };
    },
    accept: (st) => st.ph === END,
  }, shape);
};

const numFlags = CIRCLES.reduce(
  (n, cell) => n + (k => k * (k - 1) / 2)(countedNeighbours(cell).length), 0);
const sameRoot = new Var('K', 'same group', numFlags);
let bitIndex = 0;
const circleFlags = [];
const circleCounts = CIRCLES.map(cell => {
  const targets = countedNeighbours(cell);
  const k = targets.length;
  const flags = [];
  for (let j = 1; j < k; j++) {
    for (let i = 0; i < j; i++) {
      const flag = sameRoot.cell(++bitIndex);
      flags.push(flag);
      circleFlags.push(
        new Given(flag, DIFFERENT, SAME),
        new NFA(spec('sameRoot', sameRootSpec), 'same group',
          rootRow.at(targets[i]), rootRow.at(targets[j]),
          rootCol.at(targets[i]), rootCol.at(targets[j]), flag));
    }
  }
  const cells = [...shade.at(targets), ...flags];
  for (const t of targets) for (const o of grpMask) cells.push(o.at(t));
  cells.push(cell);
  return new NFA(spec(`kurotto${k}`, () => kurottoSpec(k)), 'circle', ...cells);
});

return [
  shape,
  ...overlays,
  sameRoot,
  ...domains,
  ...rootIsFirst,
  ...adjacency,
  ...tree,
  ...subtrees,
  ...groupSeed,
  ...groupSums,
  ...circleFlags,
  ...circleCounts,
];
