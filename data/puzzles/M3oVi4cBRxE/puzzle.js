// Title: Araf Killer Sudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=M3oVi4cBRxE
// Source: https://cracking-the-cryptic.web.app/sudoku/hDNMJqPmTh

// Rules encoded here, in full:
//  * Normal sudoku.
//  * The grid is divided into areas and every cell belongs to exactly one
//    area. An area is an orthogonally connected group of cells (the Araf
//    convention this hybrid builds on).
//  * Each area contains exactly two of the printed clue numbers.
//  * The sum of the digits in an area lies strictly between its two clues.
//  * Digits do not repeat within an area.
// Nothing is omitted.
//
// Model: the areas, and which two clues share one, are the solver's to find.
// Every area holds a clue, so its first clue in reading order serves as the
// root of a canonical spanning tree of the area. The area's digit set and its
// second clue are accumulated up that tree to the root, where the clue rule
// is checked against the root's own printed number. Root, depth and parent
// are all determined by the partition -- the root is the area's first clue in
// reading order, depth is distance from it, and a cell's parent is the first
// of its neighbours, in a fixed direction order, that lies one step nearer
// the root -- so one partition admits exactly one overlay assignment.

const GRID = '9x9';

// The printed clue numbers, transcribed from the text overlays; each is drawn
// in the top-left corner of its cell.
const CLUES = {
  R1C3: 12, R1C4: 19, R1C6: 14, R1C7: 1, R1C9: 1,
  R2C3: 11, R2C5: 19, R2C6: 1,
  R3C1: 9, R3C2: 10, R3C5: 11, R3C7: 46, R3C8: 15,
  R4C3: 10, R4C6: 18, R4C7: 39, R4C9: 14,
  R5C1: 8, R5C4: 19,
  R6C2: 17, R6C4: 1, R6C6: 21,
  R7C2: 15, R7C3: 16, R7C4: 46, R7C6: 46, R7C8: 18, R7C9: 22,
  R8C1: 17, R8C2: 19, R8C3: 1, R8C9: 13,
  R9C2: 18, R9C4: 17, R9C5: 16, R9C7: 14, R9C8: 5, R9C9: 1,
};

const shape = new Shape(GRID);
const graph = cellGraph(GRID);
const cells = graph.cells();
const numValues = graph.gridGeometry().numValues;
const isClue = (cell) => CLUES[cell] !== undefined;
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

const ROOT = 1;
// Parent directions, listed in the priority order that makes the tree
// canonical. The code stored in VP is the direction from the cell to its
// parent.
const DIRS = [
  { code: 2, dR: -1, dC: 0 },
  { code: 3, dR: 0, dC: -1 },
  { code: 4, dR: 0, dC: 1 },
  { code: 5, dR: 1, dC: 0 },
];
const dirCode = (dR, dC) => DIRS.find(d => d.dR === dR && d.dC === dC).code;

// A set of digits is carried as bits, digit d being bit d-1, split into three
// 3-bit bands (digits 1-3, 4-6, 7-9) so that each band, stored as mask + 1,
// fits a cell.
const BAND_BITS = 3;
const BAND_MASKS = 1 << BAND_BITS;
const bandOf = (digit) => Math.floor((digit - 1) / BAND_BITS);
const bitOf = (digit) => 1 << ((digit - 1) % BAND_BITS);
const bandSum = (band, mask) => range(0, BAND_BITS - 1)
  .filter(bit => mask & (1 << bit))
  .reduce((sum, bit) => sum + band * BAND_BITS + bit + 1, 0);

// The distinct printed values, ascending. The second clue of an area travels
// as its 1-based index in this list, 0 meaning none yet, split base numValues
// over two cells with each part stored + 1.
const CLUE_VALUES = [...new Set(Object.values(CLUES))].sort((a, b) => a - b);
const NONE = 0;
const clueIndex = (cell) => CLUE_VALUES.indexOf(CLUES[cell]) + 1;
const hiOf = (v) => Math.floor(v / numValues) + 1;
const loOf = (v) => (v % numValues) + 1;
const joinHiLo = (hi, lo) => (hi - 1) * numValues + (lo - 1);

// One overlay per per-cell quantity:
//   VP  parent pointer: ROOT, or a direction from DIRS
//   VR  row of the root of this cell's area
//   VQ  column of that root
//   VE  depth: 1 at the root, one more at each step away from it
//   VA, VB, VC  the digits in this cell's subtree, one band each
//   VO, VU  the second clue found in this cell's subtree, as hi/lo parts
const vp = graph.makeOverlay('VP');
const vr = graph.makeOverlay('VR');
const vq = graph.makeOverlay('VQ');
const ve = graph.makeOverlay('VE');
const bands = [graph.makeOverlay('VA'), graph.makeOverlay('VB'), graph.makeOverlay('VC')];
const vo = graph.makeOverlay('VO');
const vu = graph.makeOverlay('VU');

const memo = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
};

// Neighbours in DIRS priority order, each with its index in that order, the
// VP code this cell holds when the neighbour is its parent, and the VP code
// the neighbour holds when this cell is its parent.
const neighboursOf = (cell) => DIRS.flatMap(({ code, dR, dC }, k) => {
  const other = graph.step(cell, dR, dC);
  if (!other) return [];
  return [{ cell: other, k, toParent: code, fromParent: dirCode(-dR, -dC) }];
});

// --- Overlay domains ----------------------------------------------------
// A parent must be an in-grid neighbour; only a clue cell can be a root.
const domains = [
  ...cells.map(cell => new Given(vp.at(cell),
    ...neighboursOf(cell).map(n => n.toParent), ...(isClue(cell) ? [ROOT] : []))),
  ...bands.map(band => band.makeReplicate(
    new Given(band.cells()[0], ...range(1, BAND_MASKS)))),
  vo.makeReplicate(new Given(vo.cells()[0], ...range(1, hiOf(CLUE_VALUES.length)))),
];

// --- Root identity ------------------------------------------------------
// [VP, VE, VR, VQ] of one cell. A cell is the ROOT exactly when it sits at
// depth 1 and the root coordinates it carries are its own. A clue cell that is
// not the root may not name a root after it in reading order, which makes the
// root of an area its first clue in reading order.
const rootSpec = memo((row, col, clue) => NFA.encodeSpec({
  startState: { phase: 'p' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'p':
        return { phase: 'e', root: value === ROOT };
      case 'e':
        if (state.root ? value !== 1 : value < 2) return undefined;
        return { phase: 'r', root: state.root };
      case 'r':
        if (state.root) return value === row ? { phase: 'q', root: true } : undefined;
        if (clue && value > row) return undefined;
        return { phase: 'q', root: false, sameRow: value === row };
      case 'q':
        if (state.root) return value === col ? { done: true } : undefined;
        if (state.sameRow && (value === col || (clue && value > col))) return undefined;
        return { done: true };
    }
    return undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

const rootRules = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  return new NFA(rootSpec(row, col, isClue(cell)), 'root-id',
    vp.at(cell), ve.at(cell), vr.at(cell), vq.at(cell));
});

// --- One cell against its neighbour in direction k ----------------------
// [VP] of the cell, then [VR, VQ, VE] of the cell and the neighbour,
// interleaved. Two adjacent cells of one area differ in depth by at most one.
// If the pointer names this neighbour it must be an area-mate one step nearer
// the root; if the pointer names a later direction, this neighbour must not
// be such a cell, so the parent is the first qualifying neighbour.
const edgeSpec = memo((k) => NFA.encodeSpec({
  startState: { phase: 'p' },
  transition: (state, value) => {
    if (state.done) return { done: true };
    switch (state.phase) {
      case 'p': {
        const chosen = DIRS.findIndex(d => d.code === value);  // -1 at a root
        const mode = chosen === k ? 'parent' : chosen > k ? 'passed' : 'free';
        return { phase: 'r', mode };
      }
      case 'r': case 'q': case 'e':
        return { phase: state.phase + '2', mode: state.mode, held: value };
      case 'r2': case 'q2':
        if (value !== state.held) return state.mode === 'parent' ? undefined : { done: true };
        return { phase: state.phase === 'r2' ? 'q' : 'e', mode: state.mode };
      case 'e2': {
        const step = value - state.held;  // the neighbour's depth relative to mine
        if (Math.abs(step) > 1) return undefined;
        if (state.mode === 'parent' && step !== -1) return undefined;
        if (state.mode === 'passed' && step === -1) return undefined;
        return { done: true };
      }
    }
    return undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

const edgeRules = cells.flatMap(cell => neighboursOf(cell).map(n =>
  new NFA(edgeSpec(n.k), 'edge', vp.at(cell),
    vr.at(cell), vr.at(n.cell), vq.at(cell), vq.at(n.cell), ve.at(cell), ve.at(n.cell))));

// --- Digits of the subtree ----------------------------------------------
// [digit] of the cell, then [VP, band] of each neighbour, then the cell's
// own band: the subtree's digits are the cell's own plus those of the
// neighbours whose parent pointer names it. Two subtrees sharing a digit, or
// a child holding the cell's own digit, is a repeat within the area.
const bandSpec = memo((band, codes) => NFA.encodeSpec({
  startState: { phase: 'd' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'd': {
        const mask = bandOf(value) === band ? bitOf(value) : 0;
        return codes.length ? { phase: 'n', i: 0, mask } : { phase: 'own', mask };
      }
      case 'n':
        return { phase: 'm', i: state.i, mask: state.mask, child: value === codes[state.i] };
      case 'm': {
        let mask = state.mask;
        if (state.child) {
          const sub = value - 1;
          if (sub >= BAND_MASKS || (mask & sub)) return undefined;
          mask |= sub;
        }
        const i = state.i + 1;
        return i < codes.length ? { phase: 'n', i, mask } : { phase: 'own', mask };
      }
      case 'own':
        return value === state.mask + 1 ? { done: true } : undefined;
    }
    return undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

const bandRules = cells.flatMap(cell => {
  const neighbours = neighboursOf(cell);
  return bands.map((overlay, band) => new NFA(
    bandSpec(band, neighbours.map(n => n.fromParent)), 'area-digits', cell,
    ...neighbours.flatMap(n => [vp.at(n.cell), overlay.at(n.cell)]),
    overlay.at(cell)));
});

// --- The second clue of the subtree -------------------------------------
// [VP] of the cell, then [VP, VO, VU] of each neighbour, then the cell's own
// [VO, VU]. A clue cell that is not a root contributes its own number; the
// children's findings are merged, and two findings mean a third clue in the
// area.
const otherSpec = memo((own, codes) => NFA.encodeSpec({
  startState: { phase: 'p' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'p': {
        const found = value === ROOT ? NONE : own;
        return codes.length ? { phase: 'n', i: 0, found } : { phase: 'hi', found };
      }
      case 'n':
        return { phase: 'a', i: state.i, found: state.found, child: value === codes[state.i] };
      case 'a':
        return state.child
          ? { phase: 'b', i: state.i, found: state.found, child: true, hi: value }
          : { phase: 'b', i: state.i, found: state.found, child: false };
      case 'b': {
        let found = state.found;
        if (state.child) {
          const idx = joinHiLo(state.hi, value);
          if (idx !== NONE) {
            if (found !== NONE) return undefined;
            found = idx;
          }
        }
        const i = state.i + 1;
        return i < codes.length ? { phase: 'n', i, found } : { phase: 'hi', found };
      }
      case 'hi':
        return value === hiOf(state.found) ? { phase: 'lo', found: state.found } : undefined;
      case 'lo':
        return value === loOf(state.found) ? { done: true } : undefined;
    }
    return undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

const otherRules = cells.map(cell => {
  const neighbours = neighboursOf(cell);
  return new NFA(otherSpec(isClue(cell) ? clueIndex(cell) : NONE,
    neighbours.map(n => n.fromParent)), 'second-clue', vp.at(cell),
    ...neighbours.flatMap(n => [vp.at(n.cell), vo.at(n.cell), vu.at(n.cell)]),
    vo.at(cell), vu.at(cell));
});

// --- The clue rule, checked at the root ---------------------------------
// [VP, VA, VB, VC, VO, VU] of a clue cell. At a root the three bands are the
// whole area's digit set, whose total must lie strictly between the root's
// own number and the second clue, which must exist. A clue cell that is not a
// root is checked by its own root.
const clueSpec = memo((clue) => NFA.encodeSpec({
  startState: { phase: 'p' },
  transition: (state, value) => {
    if (state.done) return { done: true };
    switch (state.phase) {
      case 'p':
        return value === ROOT ? { phase: 'band', band: 0, sum: 0 } : { done: true };
      case 'band': {
        const mask = value - 1;
        if (mask >= BAND_MASKS) return undefined;
        const sum = state.sum + bandSum(state.band, mask);
        const band = state.band + 1;
        return band < bands.length ? { phase: 'band', band, sum } : { phase: 'hi', sum };
      }
      case 'hi':
        return { phase: 'lo', sum: state.sum, hi: value };
      case 'lo': {
        const idx = joinHiLo(state.hi, value);
        if (idx === NONE || idx > CLUE_VALUES.length) return undefined;
        const other = CLUE_VALUES[idx - 1];
        const lower = Math.min(clue, other);
        const upper = Math.max(clue, other);
        return lower < state.sum && state.sum < upper ? { done: true } : undefined;
      }
    }
    return undefined;
  },
  accept: ({ done }) => done === true,
}, numValues));

const clueRules = cells.filter(isClue).map(cell => new NFA(
  clueSpec(CLUES[cell]), 'area-clues', vp.at(cell),
  ...bands.map(overlay => overlay.at(cell)), vo.at(cell), vu.at(cell)));

return [
  shape,
  vp.toVar('parent'),
  vr.toVar('rootRow'),
  vq.toVar('rootCol'),
  ve.toVar('depth'),
  bands[0].toVar('digits1to3'),
  bands[1].toVar('digits4to6'),
  bands[2].toVar('digits7to9'),
  vo.toVar('secondClueHi'),
  vu.toVar('secondClueLo'),
  ...domains,
  ...rootRules,
  ...edgeRules,
  ...bandRules,
  ...otherRules,
  ...clueRules,
];
