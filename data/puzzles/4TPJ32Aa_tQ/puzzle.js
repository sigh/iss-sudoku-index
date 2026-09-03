// Title: SYO Sum Lines
// Author: Xendari
// Video: https://www.youtube.com/watch?v=4TPJ32Aa_tQ
// Source: https://app.crackingthecryptic.com/sudoku/H2Lb4hnFgm

// Rules encoded here, in full:
//  * Normal sudoku rules.
//  * Some cells are shaded, and all shaded cells are orthogonally connected.
//  * A circled cell's digit is the number of shaded cells in that circle's own
//    3x3 box. Circles are not exhaustive ("not all circles are given"), so an
//    uncircled cell carries no counting rule.
//  * Inside each 3x3 box, look at the box's own shaded cells and the
//    orthogonally connected groups they form there; every such group in every
//    box has the same digit sum N, which the solver must find.
//
// A group lives inside one box, so it is at most 9 cells and its sum is at most
// 45. That bound is what makes the rule expressible: each shaded cell names its
// group by pointing at the group's first cell in the box's reading order, and a
// state machine per candidate first cell checks the cells pointing at it are
// connected and add up to N.

const UNSHADED = 1;
const SHADED = 2;

const graph = cellGraph('9x9');
const shape = new Shape('9x9');
const numValues = cellGeometry(shape).numValues;
const boxes = graph.boxes();

// --- Var overlays -------------------------------------------------------
// VS: SHADED / UNSHADED.
// VR: for a shaded cell, the reading-order position (1-9) within its own box of
//     the first cell of the group it belongs to; pinned to 1 when unshaded.
// VN1/VN2: the shared group total N, split base 9 across two cells because a
//     single Var cell holds only 1-9 and N reaches 45: N = 9*(VN1-1) + VN2.
const vs = graph.makeOverlay('VS');
const vr = graph.makeOverlay('VR');
const total = new Var('N', 'group total', 2);
const [N_HI, N_LO] = total.cells();

const shadeDomain = vs.makeReplicate(
  new Given(vs.cells()[0], UNSHADED, SHADED));

// A group's first cell in reading order is at or before every one of its cells,
// so a cell in box position p can only point at positions 1..p.
const rootDomain = boxes.flatMap(
  box => box.map((cell, i) => new Given(vr.at(cell), ...box.map((_, j) => j + 1).slice(0, i + 1))));

// An unshaded cell is in no group, so its VR is parked on 1.
const unshadedRootKey = Pair.fnToKey(
  (shade, root) => shade === SHADED || root === 1, numValues);
const unshadedRoot = graph.cells().map(
  cell => new Pair(unshadedRootKey, 'unshaded-root', vs.at(cell), vr.at(cell)));

// --- Box-local geometry -------------------------------------------------
// Box positions are 0-based indices into a box's reading-order cell list.
const boxRow = (i) => (i / 3) | 0;
const boxCol = (i) => i % 3;
const boxAdjacent = (i, j) =>
  Math.abs(boxRow(i) - boxRow(j)) + Math.abs(boxCol(i) - boxCol(j)) === 1;
const boxConnected = (positions) => {
  const seen = [positions[0]];
  for (let n = 0; n < seen.length; n++) {
    for (const p of positions) {
      if (!seen.includes(p) && boxAdjacent(seen[n], p)) seen.push(p);
    }
  }
  return seen.length === positions.length;
};

// Compiling an NFA spec is expensive and every box has the same 3x3 geometry,
// so each machine is built once per candidate first position and reused.
const memo = (fn) => {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg));
    return cache.get(arg);
  };
};

// --- Adjacent cells share a group ---------------------------------------
// Two orthogonally adjacent shaded cells of the same box are in the same group,
// so they name the same first cell. Read as [VS, VR of one cell, VS, VR of the
// other]. Without this a real group could be split into several named groups,
// each of which would then only have to reach N on its own.
const sameGroupNFA = NFA.encodeSpec({
  startState: { phase: 'sa' },
  transition: (state, value) => {
    if (state.phase === 'sa') return { phase: 'ra', shadedA: value === SHADED };
    if (state.phase === 'ra') return { phase: 'sb', shadedA: state.shadedA, rootA: value };
    if (state.phase === 'sb') {
      return { phase: 'rb', both: state.shadedA && value === SHADED, rootA: state.rootA };
    }
    return !state.both || value === state.rootA ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, numValues);

const sameGroup = boxes.flatMap(box => box.flatMap((cell, i) => box.flatMap((other, j) => {
  if (j <= i || !boxAdjacent(i, j)) return [];
  return [new NFA(sameGroupNFA, 'same-group',
    vs.at(cell), vr.at(cell), vs.at(other), vr.at(other))];
})));

// --- The cells naming a first cell are a connected group -----------------
// One machine per candidate first position f, over [VS, VR] of the box cells
// from f onwards (earlier positions cannot name f, by rootDomain). The cells
// naming f must be an orthogonally connected set, and f itself must be one of
// them -- otherwise nothing may name f at all. `mask` collects the positions
// naming f so far; `off` is the branch where f does not name itself.
const groupShapeNFA = memo((first) => NFA.encodeSpec({
  startState: { phase: 'vs', i: first, mask: [], off: false },
  transition: (state, value) => {
    if (state.phase === 'vs') {
      return { phase: 'vr', i: state.i, mask: state.mask, off: state.off,
        shaded: value === SHADED };
    }
    const names = state.shaded && value === first + 1;
    const next = { phase: 'vs', i: state.i + 1, mask: state.mask, off: state.off };
    if (state.i === first) {
      return names
        ? { ...next, mask: [first] }
        : { ...next, off: true };
    }
    if (!names) return next;
    if (state.off) return undefined;
    return { ...next, mask: [...state.mask, state.i] };
  },
  accept: (state) => state.off || boxConnected(state.mask),
  // Two symbols per scanned cell; without the bound the position index climbs
  // past the end of the cell list and the state count is unbounded.
  maxDepth: 2 * (9 - first),
}, numValues));

// Positions near the end of a box have no disconnected candidate set left to
// rule out -- their machine accepts everything -- so only the positions that can
// actually be split get one.
const canSplit = (first) => {
  const rest = [];
  for (let i = first + 1; i < 9; i++) rest.push(i);
  for (let mask = 0; mask < (1 << rest.length); mask++) {
    if (!boxConnected([first, ...rest.filter((_, k) => (mask >> k) & 1)])) return true;
  }
  return false;
};

const groupShape = boxes.flatMap(box => box.map((_, i) => i).filter(canSplit).map(
  i => new NFA(groupShapeNFA(i), 'group-shape',
    ...box.slice(i).flatMap(cell => [vs.at(cell), vr.at(cell)]))));

// --- Every group sums to N ----------------------------------------------
// One machine per candidate first position f, reading N and then
// [VS, VR, digit] of the box cells from f onwards. It counts N down by the
// digit of each cell naming f, so the running remainder is the only quantity in
// state; a remainder that goes negative is rejected at once. `rem: null` is the
// branch where f names something other than itself, which this machine leaves
// alone (group-shape has already made that branch empty).
const groupSumNFA = memo((first) => NFA.encodeSpec({
  startState: { phase: 'hi' },
  transition: (state, value) => {
    if (state.phase === 'hi') return { phase: 'lo', hi: value };
    if (state.phase === 'lo') {
      return { phase: 'vs', head: true, rem: 9 * (state.hi - 1) + value };
    }
    if (state.phase === 'vs') {
      return { phase: 'vr', head: state.head, rem: state.rem, shaded: value === SHADED };
    }
    if (state.phase === 'vr') {
      const names = state.shaded && value === first + 1;
      // The first cell scanned is f itself; if it does not name itself there is
      // no group here for this machine to total.
      if (state.head && !names) return { phase: 'digit', rem: null };
      return { phase: 'digit', rem: state.rem, names };
    }
    if (state.rem === null || !state.names) return { phase: 'vs', rem: state.rem };
    const rem = state.rem - value;
    return rem < 0 ? undefined : { phase: 'vs', rem };
  },
  accept: (state) => state.rem === null || state.rem === 0,
  // Two symbols for N, then three per scanned cell.
  maxDepth: 2 + 3 * (9 - first),
}, numValues));

const groupSum = boxes.flatMap(box => box.map((_, i) => new NFA(
  groupSumNFA(i), 'group-sum', N_HI, N_LO,
  ...box.slice(i).flatMap(cell => [vs.at(cell), vr.at(cell), cell]))));

// --- Circles ------------------------------------------------------------
// The seven drawn circles, each an empty white circle on a single cell.
const CIRCLES = ['R2C5', 'R2C8', 'R5C2', 'R5C9', 'R7C2', 'R7C4', 'R7C7'];

// SHADED is 2 and UNSHADED is 1, so the shaded count of a box is
// sum(VS over the box) - 9, and the rule is circle - sum(VS) = -9.
const circleCounts = CIRCLES.map(cell => new Sum(
  -9, [cell, 1], ...boxes.find(box => box.includes(cell)).map(c => [vs.at(c), -1])));

return [
  shape,
  new Given('R3C5', 6),
  new Given('R5C9', 1),
  new Given('R6C2', 9),
  new Given('R7C7', 5),
  new Given('R8C9', 6),
  vs.toVar('shading'),
  vr.toVar('group first cell'),
  total,
  shadeDomain,
  ...rootDomain,
  ...unshadedRoot,
  new ConnectedValues('VS', SHADED),
  ...sameGroup,
  ...groupShape,
  ...groupSum,
  ...circleCounts,
];
