// Title: Throuple Island
// Author: Belamis
// Video: https://www.youtube.com/watch?v=q0wGk65I6GQ
// Source: https://sudokupad.app/n045ji0xsw

// Rules encoded here, in full:
//  * Normal sudoku, with the single given R2C4 = 3.
//  * Every cell is either an island cell or an ocean cell. Islands are the
//    orthogonally connected components of the island cells; "no two islands
//    touch orthogonally" is that reading restated, so it needs no constraint of
//    its own.
//  * The ocean cells form one orthogonally connected region, and no 2x2 block
//    of the grid is entirely ocean.
//  * A black dot's two cells are both island cells, and one digit is double the
//    other.
//  * A white dot's two cells are one ocean and one island cell, and the digits
//    are consecutive.
//  * Each island holds exactly 3 different digits, and its highest digit equals
//    the number of cells in that island.
//
// The island partition is the solver's to find: the number of islands is not
// given and no clue is drawn inside one. What makes the per-island rules
// expressible is that the highest digit is the size, so no island exceeds 9
// cells. Each island is given a rooted spanning tree, and every per-island
// quantity is accumulated up that tree to its root, where the Throuple rule is
// checked. Both the root and the tree are canonical -- the root is the island's
// first cell in reading order, depth is distance from it, and a cell's parent is
// the first of its neighbours, in a fixed direction order, that is one step
// nearer the root -- so one island admits exactly one set of overlay values and
// no spanning-tree symmetry is left for the search to enumerate.

const OCEAN = 1;   // VP: this cell is ocean
const ROOT = 2;    // VP: island cell, and the root of its island's tree

// Parent directions, listed in the priority order that makes the tree
// canonical. The code stored in VP is the direction from the cell to its
// parent.
const DIRS = [
  { code: 3, dR: -1, dC: 0 },
  { code: 4, dR: 0, dC: -1 },
  { code: 5, dR: 0, dC: 1 },
  { code: 6, dR: 1, dC: 0 },
];
const MAX_VP = 6;
const dirCode = (dR, dC) => DIRS.find(d => d.dR === dR && d.dC === dC).code;

// VF is a 3-bit mask over the island's three declared digits, stored as
// mask + 1 so that the empty mask is a legal grid value.
const MASK_BASE = 1;
const FULL_MASK = 7;

const shape = new Shape('9x9');
const graph = cellGraph('9x9');
const cells = graph.cells();
const numValues = graph.gridGeometry().numValues;

// One overlay per per-cell quantity. Ocean cells take value 1 in every overlay
// but VP, so an ocean cell has exactly one representation.
//   VP  parent pointer: OCEAN, ROOT, or a direction from DIRS
//   VR  row of the root of this cell's island
//   VQ  column of that root
//   VE  depth: 1 at the root, one more at each step away from it
//   VN  number of cells in this cell's subtree, itself included
//   VA/VB/VD  the island's three different digits, ascending
//   VF  which of VA/VB/VD occur in this cell's subtree, as MASK_BASE + mask
const vp = graph.makeOverlay('VP');
const vr = graph.makeOverlay('VR');
const vq = graph.makeOverlay('VQ');
const ve = graph.makeOverlay('VE');
const vn = graph.makeOverlay('VN');
const va = graph.makeOverlay('VA');
const vb = graph.makeOverlay('VB');
const vd = graph.makeOverlay('VD');
const vf = graph.makeOverlay('VF');

const memo = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
};

// Neighbours in DIRS priority order, each with the VP code its parent pointer
// would carry when it points back at this cell.
const neighboursOf = (cell) => DIRS.flatMap(({ code, dR, dC }) => {
  const other = graph.step(cell, dR, dC);
  if (!other) return [];
  return [{ cell: other, toParent: code, fromParent: dirCode(-dR, -dC) }];
});

// --- Overlay domains ----------------------------------------------------
const domains = [
  vp.makeReplicate(new Given(vp.cells()[0], ...DIRS.map(d => d.code), OCEAN, ROOT)),
  vf.makeReplicate(new Given(
    vf.cells()[0],
    ...Array.from({ length: FULL_MASK + 1 }, (_, m) => MASK_BASE + m))),
];

// --- Root identity ------------------------------------------------------
// [VP, VR, VQ] of one cell. A cell is the ROOT exactly when the root
// coordinates it carries are its own, and no cell may name a root that comes
// after it in reading order -- together these make the root of an island the
// island's first cell in reading order.
const rootSpec = memo((row, col) => NFA.encodeSpec({
  startState: { phase: 'p' },
  transition: (state, value) => {
    if (state.phase === 'p') {
      if (value === OCEAN) return { phase: 'r', ocean: true };
      return { phase: 'r', ocean: false, root: value === ROOT };
    }
    if (state.phase === 'r') {
      if (state.ocean) return value === 1 ? { phase: 'q', ocean: true } : undefined;
      if (value > row) return undefined;
      return { phase: 'q', ocean: false, root: state.root, rowEq: value === row };
    }
    if (state.ocean) return value === 1 ? { done: true } : undefined;
    if (state.rowEq && value > col) return undefined;
    const isRoot = state.rowEq && value === col;
    return isRoot === state.root ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

const rootRules = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(rootSpec(row, col), 'root-id',
    vp.at(cell), vr.at(cell), vq.at(cell));
});

// --- Per-cell agreement between the overlays ----------------------------
// [VP, VE, VN, VA, VB, VD, VF] of one cell. An ocean cell pins every overlay
// but VP to 1. An island cell has three ascending digits; a root sits at depth
// 1, a non-root deeper. The Throuple rule is checked here, at the root: VD is
// the largest of the three digits and VN is the whole island's cell count, and
// VF must record all three digits as occurring.
const cellSpec = NFA.encodeSpec({
  startState: { phase: 'p' },
  transition: (state, value) => {
    if (state.phase === 'p') {
      if (value === OCEAN) return { phase: 'e', ocean: true };
      return { phase: 'e', ocean: false, root: value === ROOT };
    }
    if (state.phase === 'e') {
      if (state.ocean) return value === 1 ? { phase: 'n', ocean: true } : undefined;
      if (state.root) return value === 1 ? { phase: 'n', root: true } : undefined;
      return value >= 2 ? { phase: 'n', root: false } : undefined;
    }
    if (state.phase === 'n') {
      if (state.ocean) return value === 1 ? { phase: 'a', ocean: true } : undefined;
      return state.root
        ? { phase: 'a', root: true, size: value }
        : { phase: 'a', root: false, size: 0 };
    }
    if (state.phase === 'a') {
      if (state.ocean) return value === 1 ? { phase: 'b', ocean: true } : undefined;
      return { phase: 'b', root: state.root, size: state.size, prev: value };
    }
    if (state.phase === 'b') {
      if (state.ocean) return value === 1 ? { phase: 'd', ocean: true } : undefined;
      if (value <= state.prev) return undefined;
      return { phase: 'd', root: state.root, size: state.size, prev: value };
    }
    if (state.phase === 'd') {
      if (state.ocean) return value === 1 ? { phase: 'f', ocean: true } : undefined;
      if (value <= state.prev) return undefined;
      if (state.root && value !== state.size) return undefined;
      return { phase: 'f', root: state.root };
    }
    if (state.ocean) return value === MASK_BASE ? { done: true } : undefined;
    if (state.root) return value === MASK_BASE + FULL_MASK ? { done: true } : undefined;
    return { done: true };
  },
  accept: ({ done }) => done === true,
}, numValues);

const cellRules = cells.map(cell => new NFA(cellSpec, 'cell-roles',
  vp.at(cell), ve.at(cell), vn.at(cell),
  va.at(cell), vb.at(cell), vd.at(cell), vf.at(cell)));

// --- Relations across one shared edge -----------------------------------
// [VP, VE, VR, VQ, VA, VB, VD] of the two cells, interleaved, for a neighbour
// `dR, dC` away. Two adjacent island cells are in the same island, so they name
// the same root and the same three digits, and their depths differ by at most
// one. A parent pointer across this edge must point at an island cell exactly
// one step nearer the root.
const edgeSpec = memo((dR, dC) => {
  const there = dirCode(dR, dC);
  const back = dirCode(-dR, -dC);
  const pairPhase = (phase, next) => (state, value) => {
    if (state.phase === phase) {
      return { ...state, phase: `${phase}2`, held: value };
    }
    if (state.both && state.held !== value) return undefined;
    const { held, ...rest } = state;
    return { ...rest, phase: next };
  };
  const steps = ['r', 'q', 'a', 'b', 'd'];
  return NFA.encodeSpec({
    startState: { phase: 'p' },
    transition: (state, value) => {
      if (state.phase === 'p') return { phase: 'p2', mine: value };
      if (state.phase === 'p2') {
        const iAmParent = state.mine === there;
        const theyAreParent = value === back;
        // A parent must be an island cell.
        if (iAmParent && value === OCEAN) return undefined;
        if (theyAreParent && state.mine === OCEAN) return undefined;
        return {
          phase: 'e',
          both: state.mine !== OCEAN && value !== OCEAN,
          iAmParent, theyAreParent,
        };
      }
      if (state.phase === 'e') return { ...state, phase: 'e2', held: value };
      if (state.phase === 'e2') {
        const { held, iAmParent, theyAreParent, both } = state;
        if (both && Math.abs(held - value) > 1) return undefined;
        if (iAmParent && held !== value + 1) return undefined;
        if (theyAreParent && value !== held + 1) return undefined;
        return { phase: 'r', both };
      }
      for (let i = 0; i < steps.length; i++) {
        const next = i + 1 < steps.length ? steps[i + 1] : 'done';
        if (state.phase === steps[i] || state.phase === `${steps[i]}2`) {
          return pairPhase(steps[i], next)(state, value);
        }
      }
      return undefined;
    },
    accept: ({ phase }) => phase === 'done',
  }, numValues);
});

const edgeRules = cells.flatMap(cell => [[0, 1], [1, 0]].flatMap(([dR, dC]) => {
  const other = graph.step(cell, dR, dC);
  if (!other) return [];
  const pair = [cell, other];
  return [new NFA(edgeSpec(dR, dC), 'edge',
    ...vp.at(pair), ...ve.at(pair), ...vr.at(pair), ...vq.at(pair),
    ...va.at(pair), ...vb.at(pair), ...vd.at(pair))];
}));

// --- Which neighbour is the parent --------------------------------------
// [VP, VE] of the cell, then [VP, VE] of each neighbour in DIRS order. Of the
// neighbours that are island cells one step nearer the root, the parent pointer
// must name the first; an island cell that is not a root must find one, and an
// ocean cell or a root must not (their depth is 1, so no neighbour can be at
// depth 0).
const parentSpec = memo((codes) => NFA.encodeSpec({
  startState: { phase: 'p' },
  transition: (state, value) => {
    if (state.phase === 'p') {
      const wanted = codes.indexOf(value);
      // A direction with no cell that way can never be matched below.
      if (value !== OCEAN && value !== ROOT && wanted < 0) return undefined;
      return { phase: 'e', wanted, i: 0, found: false };
    }
    if (state.phase === 'e') {
      return { phase: 'n', wanted: state.wanted, depth: value, i: 0, found: false };
    }
    if (state.phase === 'n') {
      return { ...state, phase: 'm', island: value !== OCEAN };
    }
    const nearer = state.island && value === state.depth - 1;
    if (nearer && !state.found && state.i !== state.wanted) return undefined;
    const next = state.i + 1;
    if (next > codes.length) return undefined;
    return {
      phase: 'n', wanted: state.wanted, depth: state.depth,
      i: next, found: state.found || nearer,
    };
  },
  accept: (state) => state.phase === 'n'
    && state.i === codes.length
    && state.found === (state.wanted >= 0),
  maxDepth: 2 + 2 * codes.length,
}, numValues));

const parentRules = cells.map(cell => {
  const neighbours = neighboursOf(cell);
  return new NFA(parentSpec(neighbours.map(n => n.toParent)), 'parent-pick',
    vp.at(cell), ve.at(cell),
    ...neighbours.flatMap(n => [vp.at(n.cell), ve.at(n.cell)]));
});

// --- Subtree sizes ------------------------------------------------------
// [VP, VN] of each neighbour, then VN of the cell: a cell's subtree is itself
// plus the subtrees of the neighbours whose parent pointer names it. An ocean
// cell has no children, so its VN of 1 is consistent. Sizes above 9 are outside
// the overlay's range, which is exactly the rule's own bound: the island's
// highest digit is its size.
const sizeSpec = memo((codes) => NFA.encodeSpec({
  startState: { phase: 'n', i: 0, sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'n') {
      return { ...state, phase: 'm', child: value === codes[state.i] };
    }
    if (state.phase === 'm') {
      const sum = state.child ? Math.min(state.sum + value, numValues + 1) : state.sum;
      const next = state.i + 1;
      return next < codes.length
        ? { phase: 'n', i: next, sum }
        : { phase: 'total', sum };
    }
    return value === state.sum + 1 ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

const sizeRules = cells.map(cell => {
  const neighbours = neighboursOf(cell);
  return new NFA(sizeSpec(neighbours.map(n => n.fromParent)), 'subtree-size',
    ...neighbours.flatMap(n => [vp.at(n.cell), vn.at(n.cell)]),
    vn.at(cell));
});

// --- Which of the island's digits have been met -------------------------
// [VP, digit, VA, VB, VD, VF] of the cell, then [VP, VF] of each neighbour. An
// island cell's own digit must be one of the island's three, and VF collects
// the digits met in the cell's subtree. The root demands the full mask, which
// is what makes the three declared digits three digits the island really holds.
const coverSpec = memo((codes) => NFA.encodeSpec({
  startState: { phase: 'p' },
  transition: (state, value) => {
    if (state.phase === 'p') return { phase: 'g', ocean: value === OCEAN };
    if (state.phase === 'g') {
      return state.ocean
        ? { phase: 'a', ocean: true }
        : { phase: 'a', ocean: false, digit: value, mask: 0 };
    }
    if (state.phase === 'a' || state.phase === 'b' || state.phase === 'd') {
      const bit = { a: 1, b: 2, d: 4 }[state.phase];
      const next = { a: 'b', b: 'd', d: 'f' }[state.phase];
      if (state.ocean) return { phase: next, ocean: true };
      const mask = state.mask | (value === state.digit ? bit : 0);
      return next === 'f'
        ? (mask === 0 ? undefined : { phase: 'f', mask })
        : { phase: next, ocean: false, digit: state.digit, mask };
    }
    if (state.phase === 'f') {
      const mask = state.ocean ? 0 : state.mask;
      if (value !== MASK_BASE + mask && state.ocean) return undefined;
      const declared = value - MASK_BASE;
      if ((mask & ~declared) !== 0) return undefined;
      return codes.length
        ? { phase: 'n', i: 0, mask, declared }
        : { phase: 'end', mask, declared };
    }
    if (state.phase === 'n') {
      return { ...state, phase: 'm', child: value === codes[state.i] };
    }
    if (state.phase === 'm') {
      const mask = state.child ? (state.mask | (value - MASK_BASE)) : state.mask;
      const next = state.i + 1;
      return next < codes.length
        ? { phase: 'n', i: next, mask, declared: state.declared }
        : { phase: 'end', mask, declared: state.declared };
    }
    return undefined;
  },
  accept: (state) => state.phase === 'end' && state.mask === state.declared,
}, numValues));

const coverRules = cells.map(cell => {
  const neighbours = neighboursOf(cell);
  return new NFA(coverSpec(neighbours.map(n => n.fromParent)), 'digit-cover',
    vp.at(cell), cell, va.at(cell), vb.at(cell), vd.at(cell), vf.at(cell),
    ...neighbours.flatMap(n => [vp.at(n.cell), vf.at(n.cell)]));
});

// --- The ocean ----------------------------------------------------------
const oceanSpec = NFA.encodeSpec({
  startState: { ocean: 0 },
  transition: ({ ocean }, value) => (
    value !== OCEAN ? { ocean } : (ocean === 3 ? undefined : { ocean: ocean + 1 })),
  accept: () => true,
}, numValues);

// One template over the top-left 2x2 block, stamped onto every cell that has a
// 2x2 block below and to the right of it.
const blockOrigins = cells.filter(cell => graph.block(cell, 2, 2));
const oceanRules = [
  new ConnectedValues('VP', OCEAN),
  vp.makeReplicate(
    new NFA(oceanSpec, 'no-2x2-ocean', ...vp.at(graph.block(blockOrigins[0], 2, 2))),
    vp.at(blockOrigins)),
];

// --- Kropki dots --------------------------------------------------------
// Drawn edge dots, each read off the source's overlay marks; a black dot is
// filled black, a white dot filled white with a black outline.
const BLACK_DOTS = [
  ['R1C1', 'R1C2'],
  ['R1C7', 'R1C8'],
  ['R5C2', 'R5C3'],
  ['R7C3', 'R7C4'],
];
const WHITE_DOTS = [
  ['R3C5', 'R4C5'],
  ['R3C8', 'R4C8'],
  ['R7C7', 'R7C8'],
  ['R8C8', 'R8C9'],
  ['R8C2', 'R9C2'],
];

const bothIsland = Pair.fnToKey((a, b) => a !== OCEAN && b !== OCEAN, shape);
const oneOcean = Pair.fnToKey((a, b) => (a === OCEAN) !== (b === OCEAN), shape);

const dotRules = [
  ...BLACK_DOTS.flatMap(pair => [
    new BlackDot(...pair),
    new Pair(bothIsland, 'black-dot-island', ...vp.at(pair)),
  ]),
  ...WHITE_DOTS.flatMap(pair => [
    new WhiteDot(...pair),
    new Pair(oneOcean, 'white-dot-shore', ...vp.at(pair)),
  ]),
];

return [
  shape,
  new Given('R2C4', 3),
  vp.toVar('parent'),
  vr.toVar('rootRow'),
  vq.toVar('rootCol'),
  ve.toVar('depth'),
  vn.toVar('subtreeSize'),
  va.toVar('digitLow'),
  vb.toVar('digitMid'),
  vd.toVar('digitHigh'),
  vf.toVar('digitsMet'),
  ...domains,
  ...rootRules,
  ...cellRules,
  ...edgeRules,
  ...parentRules,
  ...sizeRules,
  ...coverRules,
  ...oceanRules,
  ...dotRules,
];
