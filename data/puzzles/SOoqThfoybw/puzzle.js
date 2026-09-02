// Title: Parity Islands
// Author: yttrio
// Video: https://www.youtube.com/watch?v=SOoqThfoybw
// Source: https://app.crackingthecryptic.com/sudoku/9fweqd0qeq

// Rules encoded here:
//   * Normal sudoku rules apply.
//   * Orthogonally connected cells of the same parity (odd vs. even) are parity
//     islands. A digit in a circle indicates the size of the island that cell
//     is in.
// The grid has no given digits; the 18 circles are empty, so each circle is
// clued by the digit the solver places in it.
//
// Nothing is omitted. Because ISS has no primitive for "the orthogonally
// connected component of a solver-discovered partition has size N", the islands
// containing circles are reconstructed with a spanning-forest overlay, built
// below.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const cells = graph.cells();
const NV = 9;

// Circled cells, in payload order.
const CIRCLES = [
  'R1C1', 'R1C2', 'R2C1', 'R1C4', 'R1C5', 'R1C7', 'R3C4', 'R3C3', 'R5C1',
  'R5C2', 'R5C4', 'R5C5', 'R5C7', 'R8C8', 'R7C3', 'R9C5', 'R8C7', 'R3C7',
];
const circleSet = new Set(CIRCLES);

// ---------------------------------------------------------------------------
// Overlays
//
// An island is a maximal orthogonally connected set of equal-parity cells. Only
// the islands holding a circle are clued, and such an island has at most 9 cells
// (its size is a digit). The overlays below reconstruct exactly those islands as
// a rooted spanning tree each, and leave every other island unreconstructed:
//
//   VP  parity of the cell's digit          1 = odd, 2 = even
//   VD  where this cell's tree parent is    1 = unrooted (island holds no
//                                           circle), 2 = root, 3 = up,
//                                           4 = down, 5 = left, 6 = right
//   VE  distance from the root, +1          1 at the root
//   VT  size of this cell's subtree
//   VS  size of the whole island
//   VR  row of the island's root
//   VC  column of the island's root
//
// A cell in an island with no circle is "unrooted": VD = 1 and its other
// overlays are pinned to fixed values so they carry no free state (VE, VT and
// VS to 1; VR, VC to R4C1, which is not a circle so it cannot be read as a
// root). An island holding a circle is rooted, because roots are only allowed
// on circled cells and every circled cell is forced non-unrooted; the two are
// tied together by the edge rule below, which makes VD = 1 agree across every
// equal-parity adjacency, so "unrooted" is a property of the whole island.
// ---------------------------------------------------------------------------
const VP = graph.makeOverlay('VP');
const VD = graph.makeOverlay('VD');
const VE = graph.makeOverlay('VE');
const VT = graph.makeOverlay('VT');
const VS = graph.makeOverlay('VS');
const VR = graph.makeOverlay('VR');
const VC = graph.makeOverlay('VC');

const UNROOTED = 1;
const ROOT = 2;
// Direction codes, in the priority order used to break ties between equally
// good parents (see the parent rule below). `back` is the code a neighbour in
// that direction carries when its own parent is this cell.
const DIRS = [
  { code: 3, dr: -1, dc: 0, back: 4 },  // parent above
  { code: 5, dr: 0, dc: -1, back: 6 },  // parent to the left
  { code: 4, dr: 1, dc: 0, back: 3 },   // parent below
  { code: 6, dr: 0, dc: 1, back: 5 },   // parent to the right
];
// Placeholder root coordinates for an unrooted island. R4C1 carries no circle,
// so no rooted island can claim it.
const NO_ROOT_ROW = 4;
const NO_ROOT_COL = 1;

const dirsAt = (cell) => DIRS
  .map(d => ({ ...d, nb: graph.step(cell, d.dr, d.dc) }))
  .filter(d => d.nb !== null);

// ---------------------------------------------------------------------------
// Per-cell links between the digit and the overlays.
// ---------------------------------------------------------------------------

// VP is the parity of the digit.
const parityKey = Pair.fnToKey((digit, p) => (digit % 2 === 1) === (p === 1), NV);
const parityPairs = cells.map(
  c => new Pair(parityKey, 'parity', c, VP.at(c)));
const parityDomain = VP.makeReplicate(new Given(VP.at(cells[0]), 1, 2));

// VD: only a circled cell may be a root, and only a cell in an island with no
// circle may be unrooted; a direction may not point off the grid.
const dirDomain = cells.map(c => new Given(
  VD.at(c),
  circleSet.has(c) ? ROOT : UNROOTED,
  ...dirsAt(c).map(d => d.code)));

// VE: the root and the unrooted cells sit at 1, every cell with a parent below
// it in the tree sits deeper.
const distKey = Pair.fnToKey(
  (d, e) => (d === UNROOTED || d === ROOT) ? (e === 1) : (e >= 2), NV);
const distPairs = cells.map(c => new Pair(distKey, 'depth', VD.at(c), VE.at(c)));

// VT, VS: pinned on an unrooted cell.
const pinKey = Pair.fnToKey((d, v) => d !== UNROOTED || v === 1, NV);
const subtreePins = cells.map(c => new Pair(pinKey, 'unrooted', VD.at(c), VT.at(c)));
const islandPins = cells.map(c => new Pair(pinKey, 'unrooted', VD.at(c), VS.at(c)));

// VR, VC: a root names its own coordinates; an unrooted cell takes R4C1.
const rootCoordKey = (own, placeholder) => Pair.fnToKey((d, v) => {
  if (d === UNROOTED) return v === placeholder;
  if (d === ROOT) return v === own;
  return true;
}, NV);
const rootRowPairs = cells.map(c => new Pair(
  rootCoordKey(parseCellId(c).row, NO_ROOT_ROW), 'rootRow', VD.at(c), VR.at(c)));
const rootColPairs = cells.map(c => new Pair(
  rootCoordKey(parseCellId(c).col, NO_ROOT_COL), 'rootCol', VD.at(c), VC.at(c)));

// (VR, VC) always names either a circled cell or the R4C1 placeholder, since a
// root is always a circled cell.
const rootCellKey = Pair.fnToKey((r, c) => {
  if (r === NO_ROOT_ROW && c === NO_ROOT_COL) return true;
  return CIRCLES.some(id => {
    const { row, col } = parseCellId(id);
    return row === r && col === c;
  });
}, NV);
const rootCellPairs = cells.map(
  c => new Pair(rootCellKey, 'rootCell', VR.at(c), VC.at(c)));

// ---------------------------------------------------------------------------
// Edge rule: what two orthogonally adjacent cells of the same parity must agree
// on. Same parity means same island, so they agree on whether the island is
// rooted, on the root's coordinates, and on the island's size; and their
// distances from the root differ by at most one, which (with the parent rule
// below) makes VE the true distance rather than merely an upper bound.
// Adjacent cells of opposite parity are in different islands and agree on
// nothing.
// States: read both parities, then either free-run to the end or check each
// remaining pair in turn.
// ---------------------------------------------------------------------------
const EDGE_CHECKS = [
  { held: null, test: (v, held) => (v === UNROOTED) === (held === UNROOTED) },
  { held: null, test: (v, held) => v === held },   // VR
  { held: null, test: (v, held) => v === held },   // VC
  { held: null, test: (v, held) => v === held },   // VS
  { held: null, test: (v, held) => Math.abs(v - held) <= 1 },  // VE
];
const edgeSpec = NFA.encodeSpec({
  startState: { phase: 'p1' },
  transition: (s, v) => {
    if (s.phase === 'p1') return { phase: 'p2', p: v };
    if (s.phase === 'p2') {
      return v === s.p ? { phase: 'hold', i: 0 } : { phase: 'free' };
    }
    if (s.phase === 'free') return { phase: 'free' };
    if (s.phase === 'hold') return { phase: 'test', i: s.i, held: v };
    // phase 'test'
    if (!EDGE_CHECKS[s.i].test(v, s.held)) return undefined;
    const i = s.i + 1;
    return i === EDGE_CHECKS.length ? { phase: 'free' } : { phase: 'hold', i };
  },
  accept: (s) => s.phase === 'free',
  maxDepth: 12,
}, NV);

const edgeConstraints = [];
for (const c of cells) {
  for (const d of DIRS.slice(2)) {  // down and right only: each edge once
    const n = graph.step(c, d.dr, d.dc);
    if (n === null) continue;
    edgeConstraints.push(new NFA(
      edgeSpec, 'island',
      VP.at(c), VP.at(n),
      VD.at(c), VD.at(n),
      VR.at(c), VR.at(n),
      VC.at(c), VC.at(n),
      VS.at(c), VS.at(n),
      VE.at(c), VE.at(n)));
  }
}

// ---------------------------------------------------------------------------
// Parent rule: a cell whose VD names a direction must find its parent there --
// an equal-parity neighbour one step nearer the root -- and no neighbour
// earlier in the DIRS priority order may be an equally good parent. The
// priority order is what makes the tree a function of the digits: without it
// the same island admits several spanning trees, all satisfying every rule.
// A neighbour's rooted/unrooted state is not read here: the edge rule already
// makes it agree with this cell's across an equal-parity adjacency.
// Cells read: VD, VE, VP of the cell, then VP, VE of each neighbour in
// priority order.
// State: the neighbour index the parent must sit at, plus this cell's parity
// and distance while earlier neighbours are still being ruled out.
// ---------------------------------------------------------------------------
const parentSpec = (codes) => NFA.encodeSpec({
  startState: { phase: 'dir' },
  transition: (s, v) => {
    if (s.phase === 'dir') {
      const target = codes.indexOf(v);
      // Unrooted cells and roots have no parent to find. Their VE is pinned to
      // 1 by `distKey`, so no neighbour can be one step nearer in any case.
      return target < 0 ? { phase: 'free' } : { phase: 'dist', target };
    }
    if (s.phase === 'free') return { phase: 'free' };
    if (s.phase === 'dist') return { phase: 'par', target: s.target, e: v };
    if (s.phase === 'par') {
      return { phase: 'nbP', target: s.target, e: s.e, p: v, i: 0 };
    }
    if (s.phase === 'nbP') {
      return { phase: 'nbE', target: s.target, e: s.e, p: s.p, i: s.i,
               sameParity: v === s.p };
    }
    // phase 'nbE': this neighbour is a usable parent iff it is the same parity
    // and one step nearer the root.
    const usable = s.sameParity && v === s.e - 1;
    if (s.i === s.target) {
      return usable ? { phase: 'free' } : undefined;
    }
    if (usable) return undefined;  // an earlier neighbour outranks the chosen one
    return { phase: 'nbP', target: s.target, e: s.e, p: s.p, i: s.i + 1 };
  },
  accept: (s) => s.phase === 'free',
  maxDepth: 3 + 2 * codes.length,
}, NV);

const parentSpecCache = new Map();
const parentConstraints = cells.map(c => {
  const ds = dirsAt(c);
  const key = ds.map(d => d.code).join(',');
  if (!parentSpecCache.has(key)) {
    parentSpecCache.set(key, parentSpec(ds.map(d => d.code)));
  }
  return new NFA(
    parentSpecCache.get(key), 'parent',
    VD.at(c), VE.at(c), VP.at(c),
    ...ds.flatMap(d => [VP.at(d.nb), VE.at(d.nb)]));
});

// ---------------------------------------------------------------------------
// Subtree rule: a cell's subtree holds itself plus the subtrees of the
// neighbours whose parent it is. Applied at every cell, this makes VT at the
// root the size of the whole island -- and, since VT strictly grows towards the
// root, it also rules out a parent cycle. Cells read: VT of the cell, then VD
// and VT of each neighbour.
// State: the cell's own subtree size and the running total of the children
// found so far, abandoned as soon as the total leaves no room for the cell
// itself.
// ---------------------------------------------------------------------------
const subtreeSpec = (backCodes) => NFA.encodeSpec({
  startState: { phase: 'own' },
  transition: (s, v) => {
    if (s.phase === 'own') return { phase: 'nbD', t: v, sum: 0, i: 0 };
    if (s.phase === 'nbD') {
      return { phase: 'nbT', t: s.t, sum: s.sum, i: s.i,
               child: v === backCodes[s.i] };
    }
    // phase 'nbT'
    const sum = s.sum + (s.child ? v : 0);
    if (sum > s.t - 1) return undefined;
    return { phase: 'nbD', t: s.t, sum, i: s.i + 1 };
  },
  accept: (s) => s.phase === 'nbD' && s.sum === s.t - 1,
  maxDepth: 9,
}, NV);

const subtreeSpecCache = new Map();
const subtreeConstraints = cells.map(c => {
  const ds = dirsAt(c);
  const key = ds.map(d => d.back).join(',');
  if (!subtreeSpecCache.has(key)) {
    subtreeSpecCache.set(key, subtreeSpec(ds.map(d => d.back)));
  }
  return new NFA(
    subtreeSpecCache.get(key), 'subtree',
    VT.at(c),
    ...ds.flatMap(d => [VD.at(d.nb), VT.at(d.nb)]));
});

// ---------------------------------------------------------------------------
// The circle clues.
// ---------------------------------------------------------------------------

// At a root, the island's size is the root's subtree size. Only circled cells
// can be roots, so this is only needed there.
const rootSizeSpec = NFA.encodeSpec({
  startState: { phase: 'dir' },
  transition: (s, v) => {
    if (s.phase === 'dir') return { phase: 'size', root: v === ROOT };
    if (s.phase === 'size') return { phase: 'sub', root: s.root, s: v };
    if (s.root && v !== s.s) return undefined;
    return { phase: 'done' };
  },
  accept: (s) => s.phase === 'done',
  maxDepth: 3,
}, NV);
const rootSizes = CIRCLES.map(c => new NFA(
  rootSizeSpec, 'rootSize', VD.at(c), VS.at(c), VT.at(c)));

// The circled digit is the size of the island the circled cell is in.
const clues = CIRCLES.map(c => new SameValues(2, c, VS.at(c)));

// An island holding two circles has two candidate roots and would otherwise be
// reconstructed twice over. Pin the earlier circle in payload order as its root
// -- an artifact of this overlay, not a rule of the puzzle -- by forbidding
// each circle from naming a later circle as its root.
const canonicalRoots = CIRCLES.map((c, k) => {
  const later = CIRCLES.slice(k + 1).map(parseCellId);
  const key = Pair.fnToKey(
    (r, col) => !later.some(p => p.row === r && p.col === col), NV);
  return new Pair(key, 'canonicalRoot', VR.at(c), VC.at(c));
});

return [
  shape,
  VP.toVar('parity'), VD.toVar('parent'), VE.toVar('depth'),
  VT.toVar('subtree'), VS.toVar('islandSize'), VR.toVar('rootRow'),
  VC.toVar('rootCol'),
  parityDomain, ...parityPairs,
  ...dirDomain, ...distPairs,
  ...subtreePins, ...islandPins,
  ...rootRowPairs, ...rootColPairs, ...rootCellPairs,
  ...edgeConstraints,
  ...parentConstraints,
  ...subtreeConstraints,
  ...rootSizes,
  ...clues,
  ...canonicalRoots,
];
