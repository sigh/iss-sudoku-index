// Title: Chaos Fillomino
// Author: Mark Sweep (Frostini)
// Video: https://www.youtube.com/watch?v=jeJWSIvGf8s
// Source: https://app.crackingthecryptic.com/sudoku/gF94jrq8bf

// Rules encoded here, in full:
//  * This is not a sudoku: no row/column/box all-different of any kind.
//  * Divide the grid into orthogonally-connected regions (polyominoes). Every
//    cell's digit is the cell count of the region it belongs to (so a region
//    of size k shows k in every one of its k cells).
//  * No two regions of the same size (i.e. the same digit) may be
//    orthogonally adjacent.
//  * An outside clue X gives the distance, counted from that side, to the
//    first cell (from that side) holding the row's/column's own highest
//    digit.
//
// Regions are not free-standing labels: since every cell of a size-k region
// shows k, two orthogonally adjacent cells showing the SAME digit could only
// be two different same-size regions touching (forbidden) or one region
// (allowed) -- so equal-digit adjacency forces common membership, and the
// "no touch" rule is exactly the statement that equal adjacent digits share
// a region. The partition is therefore a function of the digit grid: regions
// are its maximal orthogonally-connected equal-digit components, and the
// puzzle constraint reduces to "every such component's cell count equals its
// own digit" plus the geometric closure that already follows from it.
//
// That per-component size check is expressible because component size is
// bounded at 9 (a bigger region could not display its own size in one
// digit): a root (row, column) overlay plus a depth overlay canonicalise
// each component to its own first cell in reading order, and a
// deterministic-parent overlay plus a subtree-size overlay accumulate the
// true cell count up to that root, where it is checked against the digit.
// Every overlay is pinned to a value derived from the digit grid (never a
// free choice), so the digit grid has exactly one satisfying
// overlay assignment and the encoding adds no extra solutions of its own.

const graph = cellGraph('9x9');
const gridCells = graph.cells();
const numValues = 9; // digit domain: a region cannot exceed 9 cells.

// --- Directions -----------------------------------------------------------
// Parent-direction codes: SELF marks a component's own root (its first cell
// in reading order); the others say "my region-mate parent is this way".
// UP/DOWN/LEFT/RIGHT is also the fixed priority order used to break ties
// when a cell has more than one same-digit neighbour at the minimal depth,
// so the parent choice -- and everything built from it -- is a function of
// the digit grid, not a free selection.
const SELF = 1, UP = 2, DOWN = 3, LEFT = 4, RIGHT = 5;
const DIRS = [
  { code: UP, opp: DOWN, dr: -1, dc: 0 },
  { code: DOWN, opp: UP, dr: 1, dc: 0 },
  { code: LEFT, opp: RIGHT, dr: 0, dc: -1 },
  { code: RIGHT, opp: LEFT, dr: 0, dc: 1 },
];

// --- Overlays ---------------------------------------------------------------
// VR/VC: the (row, column) of this cell's region's root -- its own component's
//   first cell in reading order.
// VD: this cell's true graph distance (over same-digit adjacency) to its
//   root; VD = 1 exactly at the root.
// VP: this cell's deterministic parent direction (SELF at the root; else the
//   first, in UP/DOWN/LEFT/RIGHT priority, same-digit neighbour one shallower).
// VZ: the cell count of the subtree rooted at this cell, accumulated from its
//   VP-children upward; at a root (VP = SELF) this is the whole region's size.
const vr = graph.makeOverlay('VR');
const vc = graph.makeOverlay('VC');
const vd = graph.makeOverlay('VD');
const vp = graph.makeOverlay('VP');
const vz = graph.makeOverlay('VZ');

const memo = (fn) => {
  const cache = new Map();
  return (...args) => {
    const k = JSON.stringify(args);
    if (!cache.has(k)) cache.set(k, fn(...args));
    return cache.get(k);
  };
};

// --- Root ordering: a component's root must be its own first member in
// reading order, so it can never point past itself. r/c are this cell's own
// fixed (row, column); only pairs at or before it in reading order are legal.
const rootOrderKey = memo((r, c) => Pair.fnToKey(
  (rr, rc) => rr < r || (rr === r && rc <= c), numValues));
const rootOrderRules = gridCells.map(cell => {
  const { row: r, col: c } = parseCellId(cell);
  return new Pair(rootOrderKey(r, c), 'root-order', vr.at(cell), vc.at(cell));
});

// --- Root grounding: a cell at depth 1 must name itself as the root. (The
// converse -- a self-named root must be at depth 1 -- follows from this rule
// together with root-order and root-agreement below: any other self-named
// cell in the same component would force the shared root to be both at and
// after its own position, which only its true first cell can satisfy.)
const rootSelfRowKey = memo((r) => Pair.fnToKey(
  (depth, rr) => depth !== 1 || rr === r, numValues));
const rootSelfColKey = memo((c) => Pair.fnToKey(
  (depth, rc) => depth !== 1 || rc === c, numValues));
const rootSelfRules = gridCells.flatMap(cell => {
  const { row: r, col: c } = parseCellId(cell);
  return [
    new Pair(rootSelfRowKey(r), 'root-self-row', vd.at(cell), vr.at(cell)),
    new Pair(rootSelfColKey(c), 'root-self-col', vd.at(cell), vc.at(cell)),
  ];
});

// --- Per-edge rules, one edge per (cell, RIGHT/DOWN) pair so each grid edge
// is visited exactly once. All three are guarded on "same digit", since only
// equal-digit neighbours are region-mates.
// - root agreement: region-mates share one root (row, then column).
// - depth closeness: region-mates' true distances to the root differ by at
//   most 1 (adjacent cells can never be more than one step apart along any
//   connecting path).
// Reads [digit(a), digit(b), X(a), X(b)] and accepts unless the digits match
// and X(a)/X(b) fail `related`. Keyed by a string tag rather than `related`
// itself: `memo`'s JSON-based cache key drops function arguments (they
// serialize to `null`), so two different comparators would otherwise collide
// on one cached spec.
const sameDigitCondNFA = memo((tag, related) => NFA.encodeSpec({
  startState: { phase: 'd1' },
  transition: (state, value) => {
    if (state.phase === 'd1') return { phase: 'd2', da: value };
    if (state.phase === 'd2') return { phase: 'x1', same: state.da === value };
    if (state.phase === 'x1') return { phase: 'x2', same: state.same, xa: value };
    const rel = related(state.xa, value);
    return { done: true, ok: !state.same || rel };
  },
  accept: ({ done, ok }) => done === true && ok === true,
}, numValues));
const rootRowAgreeNFA = sameDigitCondNFA('eq', (a, b) => a === b);
const rootColAgreeNFA = sameDigitCondNFA('eq', (a, b) => a === b);
const depthCloseNFA = sameDigitCondNFA('close', (a, b) => Math.abs(a - b) <= 1);

const edgeRules = gridCells.flatMap(cell => DIRS
  .filter(({ dr, dc }) => dr >= 0 && (dr > 0 || dc > 0)) // RIGHT/DOWN only: one visit per edge
  .flatMap(({ dr, dc }) => {
    const other = graph.step(cell, dr, dc);
    if (!other) return [];
    const pair = [cell, other];
    return [
      new NFA(rootRowAgreeNFA, 'root-row-agree', ...pair, ...vr.at(pair)),
      new NFA(rootColAgreeNFA, 'root-col-agree', ...pair, ...vc.at(pair)),
      new NFA(depthCloseNFA, 'depth-close', ...pair, ...vd.at(pair)),
    ];
  }));

// --- Deterministic parent: at a root (depth 1) the parent is SELF,
// regardless of neighbours. Elsewhere it is the first same-digit neighbour
// (in UP/DOWN/LEFT/RIGHT order) whose depth is exactly one less -- the
// existence of at least one such neighbour is what root-order + root-self +
// depth-close jointly force in any valid solution; this machine just names
// which one, so the search never has a free choice here. Reads
// [depth(cell), digit(cell), then depth(n), digit(n) for each existing
// neighbour in priority order, then parent(cell)].
// State design note: once `chosen` is settled (root, or a match found), the
// remaining neighbour reads carry nothing but `chosen` through explicit
// `passN` phases -- one tag per remaining-symbol count, never a numeric
// counter field -- and a neighbour's depth collapses to the boolean
// `depthOk` the instant it is read, so no phase ever holds `target`, `digit`
// and the neighbour's raw depth all at once (that combination is what blew
// the compiled-state cap in an earlier draft).
const parentNFA = memo((dirs) => {
  const n = dirs.length;
  const passPhase = (remaining) => (remaining > 0 ? `pass${remaining}` : 'p');
  return NFA.encodeSpec({
    startState: { phase: 'd' },
    transition: (state, value) => {
      if (typeof state.phase === 'string' && state.phase.startsWith('pass')) {
        const remaining = Number(state.phase.slice(4));
        return { phase: passPhase(remaining - 1), chosen: state.chosen };
      }
      if (state.phase === 'd') {
        // value = depth(cell). A root needs no neighbour to name its
        // parent, so it goes straight to blindly passing the rest through
        // (digit(cell) plus every neighbour pair) before the final read.
        if (value === 1) return { phase: passPhase(1 + 2 * n), chosen: SELF };
        return { phase: n > 0 ? 'g' : 'p', chosen: null, target: value - 1 };
      }
      if (state.phase === 'g') {
        // value = digit(cell); begin the neighbour scan at index 0.
        return { phase: 'nd0', chosen: null, target: state.target, digit: value };
      }
      const ndMatch = /^nd(\d+)$/.exec(state.phase);
      if (ndMatch) {
        // value = depth(neighbour k); collapse it to a boolean immediately.
        return {
          phase: `ndig${ndMatch[1]}`, target: state.target, digit: state.digit,
          depthOk: value === state.target,
        };
      }
      const ndigMatch = /^ndig(\d+)$/.exec(state.phase);
      if (ndigMatch) {
        // value = digit(neighbour k); decide whether it is the parent.
        const k = Number(ndigMatch[1]);
        const matched = state.depthOk && value === state.digit;
        if (matched) return { phase: passPhase(2 * (n - k - 1)), chosen: dirs[k].code };
        const nextK = k + 1;
        return {
          phase: nextK < n ? `nd${nextK}` : 'p',
          chosen: null, target: state.target, digit: state.digit,
        };
      }
      // phase 'p': final read is this cell's own parent value.
      return { done: true, ok: value === state.chosen };
    },
    accept: ({ done, ok }) => done === true && ok === true,
  }, numValues);
});
const parentRules = gridCells.map(cell => {
  const dirs = DIRS.filter(({ dr, dc }) => graph.step(cell, dr, dc));
  const neighbourReads = dirs.flatMap(({ dr, dc }) => {
    const n = graph.step(cell, dr, dc);
    return [vd.at(n), n];
  });
  return new NFA(
    parentNFA(dirs), 'parent',
    vd.at(cell), cell, ...neighbourReads, vp.at(cell));
});

// --- Subtree size: this cell's count is 1 plus the size of every neighbour
// whose own parent direction points back here. Reads [parent(n), size(n) for
// each existing neighbour, then size(cell)]. Clamp the running sum at
// numValues since a valid total never needs to exceed it.
const subtreeNFA = memo((dirs) => NFA.encodeSpec({
  startState: { phase: 'start', sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'start' || state.phase === 'p') {
      return { phase: 'z', sum: state.sum, pval: value, i: state.i ?? 0 };
    }
    if (state.phase === 'z') {
      const dirCode = dirs[state.i].opp;
      const add = state.pval === dirCode ? value : 0;
      const nextI = state.i + 1;
      const nextPhase = nextI < dirs.length ? 'p' : 'done-wait';
      return { phase: nextPhase, i: nextI, sum: Math.min(state.sum + add, numValues) };
    }
    // phase 'done-wait': final read is this cell's own size.
    return { done: true, ok: value === state.sum + 1 };
  },
  accept: ({ done, ok }) => done === true && ok === true,
}, numValues));
const subtreeRules = gridCells.map(cell => {
  const dirs = DIRS.filter(({ dr, dc }) => graph.step(cell, dr, dc));
  const neighbourReads = dirs.flatMap(({ dr, dc }) => {
    const n = graph.step(cell, dr, dc);
    return [vp.at(n), vz.at(n)];
  });
  return new NFA(
    subtreeNFA(dirs), 'subtree-size',
    ...(dirs.length ? neighbourReads : []), vz.at(cell));
});
// A cell with no neighbours (impossible on a 9x9, kept for robustness) reads
// only its own size; guard against an empty NFA cell list.
if (subtreeRules.some(r => r.cells.length < 2)) {
  throw new Error('subtree NFA built with too few cells');
}

// --- Region-size check: only at a root (depth 1) must the digit equal the
// accumulated subtree size, since that is the whole region's cell count.
const rootSizeNFA = NFA.encodeSpec({
  startState: { phase: 'd' },
  transition: (state, value) => {
    if (state.phase === 'd') return { phase: 'g', isRoot: value === 1 };
    if (state.phase === 'g') return { phase: 'z', isRoot: state.isRoot, digit: value };
    return { done: true, ok: !state.isRoot || state.digit === value };
  },
  accept: ({ done, ok }) => done === true && ok === true,
}, numValues);
const rootSizeRules = gridCells.map(cell =>
  new NFA(rootSizeNFA, 'root-size', vd.at(cell), cell, vz.at(cell)));

// --- Outside clues -----------------------------------------------------------
// Each clue gives a lane (a full row or column), a reading direction and a
// distance X: the Xth cell counted that way is the lane's own highest digit,
// and it is the FIRST such occurrence from that side. So that cell's digit
// strictly exceeds every cell nearer that side, and is >= every cell beyond
// it (a later tie for the max is allowed; an earlier one is not).
// Transcribed from the drawn outside-clue digits (one per clued lane/side):
//   left R1=4, right R1=6, right R2=2, right R3=8, left R4=8,
//   bottom C1=2, top C2=4, bottom C3=9, bottom C4=2, top C4=3,
//   bottom C8=3, top C8=5, bottom C9=1
const OUTSIDE_CLUES = [
  { lane: 'row', index: 1, side: 'left', x: 4 },
  { lane: 'row', index: 1, side: 'right', x: 6 },
  { lane: 'row', index: 2, side: 'right', x: 2 },
  { lane: 'row', index: 3, side: 'right', x: 8 },
  { lane: 'row', index: 4, side: 'left', x: 8 },
  { lane: 'col', index: 1, side: 'bottom', x: 2 },
  { lane: 'col', index: 2, side: 'top', x: 4 },
  { lane: 'col', index: 3, side: 'bottom', x: 9 },
  { lane: 'col', index: 4, side: 'bottom', x: 2 },
  { lane: 'col', index: 4, side: 'top', x: 3 },
  { lane: 'col', index: 8, side: 'bottom', x: 3 },
  { lane: 'col', index: 8, side: 'top', x: 5 },
  { lane: 'col', index: 9, side: 'bottom', x: 1 },
];
const gtKey = Pair.fnToKey((a, b) => a > b, numValues);
const geKey = Pair.fnToKey((a, b) => a >= b, numValues);
const outsideRules = OUTSIDE_CLUES.flatMap(({ lane, index, side, x }) => {
  const base = lane === 'row' ? graph.row(index) : graph.column(index);
  const ordered = (side === 'right' || side === 'bottom')
    ? base.slice().reverse()
    : base;
  const target = ordered[x - 1];
  const before = ordered.slice(0, x - 1);
  const after = ordered.slice(x);
  const label = `outside-${lane}${index}-${side}${x}`;
  return [
    ...before.map(cell => new Pair(gtKey, label, target, cell)),
    ...after.map(cell => new Pair(geKey, label, target, cell)),
  ];
});

// --- Givens -------------------------------------------------------------
const GIVENS = [
  ['R1C5', 2], ['R2C1', 1], ['R3C9', 1], ['R8C9', 1],
];
const givens = GIVENS.map(([cell, v]) => new Given(cell, v));

return [
  new Shape('9x9', '1-9', 'Raw'),
  vr.toVar('rootRow'), vc.toVar('rootCol'), vd.toVar('depth'),
  vp.toVar('parentDir'), vz.toVar('subtreeSize'),
  ...givens,
  ...rootOrderRules,
  ...rootSelfRules,
  ...edgeRules,
  ...parentRules,
  ...subtreeRules,
  ...rootSizeRules,
  ...outsideRules,
];
