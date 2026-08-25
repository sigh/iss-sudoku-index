// Title: Operation: Trick or Treat!
// Author: Ricky Cruz
// Video: https://www.youtube.com/watch?v=rRCy9xfRldI
// Source: https://app.crackingthecryptic.com/webapp/MLPrTD2pB6

// Normal sudoku, plus anti-knight (cells a knight's move apart differ), plus
// a solver-discovered single loop through R5C5: one cell wide, orthogonal
// steps only, no branching and no orthogonal self-touch (diagonal contact is
// unrestricted -- the rules only forbid orthogonal self-touch). The loop may
// never enter a grey cell but must be orthogonally adjacent to every one of
// them. R5C5 holds the smallest digit that appears anywhere on the loop. The
// seven circled cells (six of which sit on a grey cell; R1C1 does not) must
// each be "touched" -- occupied by the loop, or orthogonally adjacent to it --
// with the first touch of each, walked in the solver's chosen direction from
// R5C5, holding strictly increasing digits ("visited" is defined once in the
// rules, as the first orthogonal touch, and applied uniformly to all seven
// circles rather than singling out the one circle that is not grey).
//
// Loop model: one Var overlay 'VS' gives every cell a successor direction (0
// = off the loop, else the compass direction of the next cell along the
// solver's chosen travel direction). Off/on plus degree-capped-at-2 orthogonal
// neighbours closes the loop shape; a second check --
// each on-loop cell has exactly one neighbour whose own successor points back
// at it -- turns the same shape into one consistently-directed traversal (the
// two ways to do that are the loop's two travel directions, the solver's free
// choice).
//
// Ascending order needs to compare a circled cell's digit only once, against
// the largest circled digit already reached -- not at every path cell -- so
// two more overlays thread that running state along VS's direction, cell to
// cell: 'VM' the running max digit among circled cells reached so far (0 =
// none yet), and two bitmasks 'VA' (circles 0-3) / 'VB' (circles 4-6) marking
// which circles have already been reached at least once. Each circle's own
// trigger cells (the marker cell plus its orthogonal neighbours -- any of
// which counts as touching it) force its bit on and its digit into VM's
// floor whenever any of them is on the loop; the strict increase is checked
// only on the specific edge where a circle's bit is still off going in, so a
// second or third touch of an already-recorded circle asserts nothing
// further. R1C1 and R2C2's trigger cells overlap at R1C2 and R2C1 (both are
// neighbours of both circles); a path through either touches both circles in
// the same step, with no intervening cell to order them, so the encoding
// checks each of that pair against the running max but not against each
// other -- neither is required to precede the other.

const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);
const cells = graph.cells();

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

const CENTER = 'R5C5';

// Grey cells: the 16 solid #CFCFCF 1x1 underlays drawn on the board.
const GREY = [
  'R2C2', 'R2C4', 'R2C6', 'R2C7', 'R2C8',
  'R4C2', 'R4C7', 'R4C8',
  'R6C2', 'R6C3', 'R6C8',
  'R8C2', 'R8C3', 'R8C4', 'R8C6', 'R8C8',
];

// Circled cells: the 7 white 0.7x0.7 rounded underlays. Index doubles as each
// circle's bit number below.
const MARKERS = ['R1C1', 'R2C2', 'R2C8', 'R4C7', 'R6C3', 'R8C2', 'R8C8'];

const GIVEN_DIGITS = {
  R1C7: 7, R2C3: 9, R2C9: 1, R3C1: 5, R3C7: 2, R4C2: 7,
  R6C8: 5, R7C3: 1, R7C9: 5, R8C1: 7, R8C7: 3, R9C3: 4,
};

// --- Direction codes for the successor overlay 'VS' -------------------------
const OFF = 0, UP = 1, DOWN = 2, LEFT = 3, RIGHT = 4;
const STEP = { [UP]: [-1, 0], [DOWN]: [1, 0], [LEFT]: [0, -1], [RIGHT]: [0, 1] };
const OPP = { [UP]: DOWN, [DOWN]: UP, [LEFT]: RIGHT, [RIGHT]: LEFT };
const DIRS = [UP, DOWN, LEFT, RIGHT];

// Directions leading to an in-grid neighbour, as [direction, neighbour cell].
const dirsFrom = (cell) => DIRS
  .map((d) => [d, graph.step(cell, ...STEP[d])])
  .filter(([, n]) => n !== null);

const succ = graph.makeOverlay('VS');   // successor direction, OFF..RIGHT
const rmax = graph.makeOverlay('VM');   // running max circled digit, 0-9
const maskLo = graph.makeOverlay('VA'); // circle-seen bits 0-3, 0-15
const maskHi = graph.makeOverlay('VB'); // circle-seen bits 4-6, 0-7
const LO_WIDTH = 4, HI_WIDTH = 3;

// --- Circle bit bookkeeping --------------------------------------------------
const layerOf = (i) => (i < 4 ? maskLo : maskHi);
const bitOf = (i) => (i < 4 ? 1 << i : 1 << (i - 4));

// A cell "touches" circle i the moment it or one of its orthogonal neighbours
// is on the loop. Derived from the drawn marker cells, not hand-listed.
const triggerCellsOf = (i) => [MARKERS[i], ...graph.neighbours(MARKERS[i])];
const triggersAt = new Map(cells.map((cell) => [cell, []]));
MARKERS.forEach((_, i) => {
  for (const cell of triggerCellsOf(i)) triggersAt.get(cell).push(i);
});
const interestingCells = cells.filter((c) => triggersAt.get(c).length > 0);
const reservedBits = (cell, loLayer) => triggersAt.get(cell)
  .filter((i) => (i < 4) === loLayer)
  .reduce((mask, i) => mask | bitOf(i), 0);

// All directed grid edges (X, direction, successor-candidate S).
const edges = cells.flatMap((cell) => dirsFrom(cell).map(([d, n]) => [cell, d, n]));
// The edge closing the loop back into the centre is not an ordinary threading
// step: the centre's running state is the fixed seed (0), not a value derived
// from its predecessor, so the generic "propagate unchanged" rule would force
// the predecessor's state back down to 0 -- undoing every circle it recorded
// and contradicting completeness, which requires that same predecessor's mask
// to be full. That edge is governed by completenessRules alone.
const edgesNotIntoCenter = edges.filter(([, , to]) => to !== CENTER);

// =========================== Loop topology ==================================

// Domain: OFF, or a direction with an in-grid neighbour; grey forced OFF, the
// centre forced onto the loop.
const succDomain = cells.map((cell) => new Given(succ.at(cell), OFF, ...dirsFrom(cell).map(([d]) => d)));
const greyOff = GREY.map((cell) => new Given(succ.at(cell), OFF));
const centerOn = new Given(succ.at(CENTER), ...dirsFrom(CENTER).map(([d]) => d));

// Degree: an on-loop cell has exactly two on-loop orthogonal neighbours, an
// off cell has none -- with connectivity below, this alone closes "a single
// loop that cannot touch itself orthogonally".
// Reads [own VS, VS of each orthogonal neighbour].
const degreeSpec = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, v) => {
    if (phase === 'start') return v !== OFF ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (v !== OFF ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, shape);
const degreeRules = cells.map((cell) => new NFA(degreeSpec, 'degree',
  succ.at(cell), ...succ.at(graph.neighbours(cell))));

// Exactly one predecessor: among a cell's neighbours, exactly one (if the
// cell is on the loop; none if off) has its own successor pointing back here.
// `codes[i]` is the VS value neighbour i would need, for it to name this cell
// as its successor. Reads [own VS, VS of each neighbour, in the same order].
const predSpec = (codes) => NFA.encodeSpec({
  startState: 'own',
  transition: (s, v) => {
    if (s === 'own') return { i: 0, count: 0, need: v !== OFF ? 1 : 0 };
    const count = s.count + (v === codes[s.i] ? 1 : 0);
    return count > s.need ? undefined : { i: s.i + 1, count, need: s.need };
  },
  accept: (s) => s !== 'own' && s.count === s.need,
  maxDepth: codes.length + 1,
}, shape);
const predRules = cells.map((cell) => {
  const present = dirsFrom(cell);
  const codes = present.map(([d]) => OPP[d]);
  return new NFA(predSpec(codes), 'one-predecessor',
    succ.at(cell), ...present.map(([, n]) => succ.at(n)));
});

// Exactly-one-predecessor alone still allows two cells to name each other as
// mutual successors (a degenerate back-and-forth on a single edge, splitting
// what should be one rotation into disjoint 2-cycles). Forbid it directly, per
// undirected edge: not both "this cell's successor is that one" and "that
// cell's successor is this one". Reads (VS(a), VS(b)).
const noMutualKey = (dirAtoB) => Pair.fnToKey(
  (vsA, vsB) => !(vsA === dirAtoB && vsB === OPP[dirAtoB]), shape);
// One Replicate per direction: the same offset relation, shifted over every
// cell that has a neighbour that way (down-edges, then right-edges -- between
// them, every undirected edge is covered once).
const noMutualRules = [DOWN, RIGHT].map((d) => {
  const key = noMutualKey(d);
  const [dr, dc] = STEP[d];
  const origins = cells.filter((cell) => graph.step(cell, dr, dc) !== null);
  const template = new Pair(key, 'no-mutual-successor',
    succ.at(cells[0]), succ.at(graph.step(cells[0], dr, dc)));
  return succ.makeReplicate([template], succ.at(origins));
});

const loopTopology = [
  ...succDomain, ...greyOff, centerOn,
  ...degreeRules,
  new ConnectedValues('VS', [UP, DOWN, LEFT, RIGHT]),
  ...predRules,
  ...noMutualRules,
];

// ===================== Grey touch / circle reachability =====================

// At least one of the scanned cells is on the loop.
const anyOnSpec = NFA.encodeSpec({
  startState: { any: false },
  transition: (s, v) => ({ any: s.any || v !== OFF }),
  accept: (s) => s.any,
}, shape);
const greyTouchRules = GREY.map((g) => new NFA(anyOnSpec, 'grey-touch',
  ...succ.at(graph.neighbours(g))));
// The six grey circles' reachability is this same check; only R1C1 (not
// grey) needs a separate one, over its own cell plus its neighbours.
const r1c1Reachable = new NFA(anyOnSpec, 'circle-r1c1-reachable',
  ...succ.at(triggerCellsOf(MARKERS.indexOf('R1C1'))));

// ============================ Centre-is-min ==================================

// Every on-loop cell's digit is at least the centre's. Reads [own VS, own
// digit, centre's digit].
const minDigitSpec = NFA.encodeSpec({
  startState: 'start',
  transition: (s, v) => {
    if (s === 'start') return v === OFF ? 'skip' : { phase: 'digit' };
    if (s === 'skip') return 'skip';
    if (s.phase === 'digit') return { phase: 'center', digit: v };
    return v <= s.digit ? 'ok' : undefined;
  },
  accept: (s) => s === 'ok' || s === 'skip',
}, shape);
const minDigitRules = cells.map((cell) => new NFA(minDigitSpec, 'center-is-min',
  succ.at(cell), cell, CENTER));

// ============================ Ascending circles ==============================

// VM/VA/VB domains; the centre seeds the run at "nothing seen yet".
const rmaxDomain = rmax.makeReplicate(new Given(rmax.at(cells[0]), ...range(0, 9)));
const maskLoDomain = maskLo.makeReplicate(new Given(maskLo.at(cells[0]), ...range(0, 15)));
const maskHiDomain = maskHi.makeReplicate(new Given(maskHi.at(cells[0]), ...range(0, 7)));
const centerSeed = [
  new Given(rmax.at(CENTER), 0),
  new Given(maskLo.at(CENTER), 0),
  new Given(maskHi.at(CENTER), 0),
];

// Running max never decreases along a used edge. Reads [VS(from), VM(from),
// VM(to)]; a VS that isn't this edge's direction accepts anything (the edge
// isn't the one actually used, some other direction's copy of this rule is).
const rmMonoSpec = (d) => NFA.encodeSpec({
  startState: 'start',
  transition: (s, v) => {
    if (s === 'start') return v === d ? { phase: 'rmFrom' } : 'skip';
    if (s === 'skip') return 'skip';
    if (s.phase === 'rmFrom') return { phase: 'rmTo', rmFrom: v };
    return v >= s.rmFrom ? 'ok' : undefined;
  },
  accept: (s) => s === 'ok' || s === 'skip',
}, shape);
const rmMonoSpecs = new Map(DIRS.map((d) => [d, rmMonoSpec(d)]));
const rmMonoRules = edgesNotIntoCenter.map(([from, d, to]) => new NFA(rmMonoSpecs.get(d), 'rmax-mono',
  succ.at(from), rmax.at(from), rmax.at(to)));

// A seen-circle mask only ever gains bits reserved for the target cell `to`;
// every other bit must carry over unchanged. Reads [VS(from), mask(from),
// mask(to)]; `reserved`/`width` are baked in per target cell and layer.
const maskMonoSpec = (d, reserved, width) => NFA.encodeSpec({
  startState: 'start',
  transition: (s, v) => {
    if (s === 'start') return v === d ? { phase: 'maskFrom' } : 'skip';
    if (s === 'skip') return 'skip';
    if (s.phase === 'maskFrom') return { phase: 'maskTo', maskFrom: v };
    const other = (~reserved) & ((1 << width) - 1);
    const sameElsewhere = (v & other) === (s.maskFrom & other);
    const onlyGrows = (s.maskFrom & reserved & ~v) === 0;
    return (sameElsewhere && onlyGrows) ? 'ok' : undefined;
  },
  accept: (s) => s === 'ok' || s === 'skip',
}, shape);
const maskSpecCache = new Map();
const cachedMaskMonoSpec = (d, reserved, width) => {
  const key = `${d}:${reserved}:${width}`;
  if (!maskSpecCache.has(key)) maskSpecCache.set(key, maskMonoSpec(d, reserved, width));
  return maskSpecCache.get(key);
};
const maskLoRules = edgesNotIntoCenter.map(([from, d, to]) => new NFA(
  cachedMaskMonoSpec(d, reservedBits(to, true), LO_WIDTH), 'mask-lo-mono',
  succ.at(from), maskLo.at(from), maskLo.at(to)));
const maskHiRules = edgesNotIntoCenter.map(([from, d, to]) => new NFA(
  cachedMaskMonoSpec(d, reservedBits(to, false), HI_WIDTH), 'mask-hi-mono',
  succ.at(from), maskHi.at(from), maskHi.at(to)));

// Whenever a circle's own trigger cell is on the loop, that circle's bit must
// already be set (this is what makes a trigger cell a genuine "touch", not
// merely a place the mask is allowed to update) and the running max must
// already be at least that circle's digit. A 2-cell relation, so a Pair
// rather than an NFA: reads (VS(cell), mask(cell)).
const forcedBitKeyCache = new Map();
const cachedForcedBitKey = (bit) => {
  if (!forcedBitKeyCache.has(bit)) {
    forcedBitKeyCache.set(bit, Pair.fnToKey(
      (vs, mask) => vs === OFF || (mask & bit) !== 0, shape));
  }
  return forcedBitKeyCache.get(bit);
};
const forcedFloorSpec = NFA.encodeSpec({
  startState: 'start',
  transition: (s, v) => {
    if (s === 'start') return v === OFF ? 'skip' : { phase: 'digit' };
    if (s === 'skip') return 'skip';
    if (s.phase === 'digit') return { phase: 'rmax', digit: v };
    return v >= s.digit ? 'ok' : undefined;
  },
  accept: (s) => s === 'ok' || s === 'skip',
}, shape);
const forcedBitRules = interestingCells.flatMap((cell) => triggersAt.get(cell).map((i) =>
  new Pair(cachedForcedBitKey(bitOf(i)), 'circle-forced-bit', succ.at(cell), layerOf(i).at(cell))));
const forcedFloorRules = interestingCells.flatMap((cell) => triggersAt.get(cell).map((i) =>
  new NFA(forcedFloorSpec, 'circle-forced-floor', succ.at(cell), MARKERS[i], rmax.at(cell))));

// The strict increase itself: on the edge into a circle's trigger cell, if
// that circle's bit is still off in the predecessor, its digit must exceed
// the predecessor's running max. Already-set bits assert nothing further, so
// a second touch (or, at R1C2/R2C1, the other of the overlapping pair) is
// unconstrained here. Reads [VS(from), mask(from), VM(from), circle's digit].
const strictSpec = (d, bit) => NFA.encodeSpec({
  startState: 'start',
  transition: (s, v) => {
    if (s === 'start') return v === d ? { phase: 'mask' } : 'skip';
    if (s === 'skip') return 'skip';
    if (s.phase === 'mask') return (v & bit) !== 0 ? 'skip' : { phase: 'rmax' };
    if (s.phase === 'rmax') return { phase: 'digit', rmax: v };
    return v > s.rmax ? 'ok' : undefined;
  },
  accept: (s) => s === 'ok' || s === 'skip',
}, shape);
const strictSpecCache = new Map();
const cachedStrictSpec = (d, bit) => {
  const key = `${d}:${bit}`;
  if (!strictSpecCache.has(key)) strictSpecCache.set(key, strictSpec(d, bit));
  return strictSpecCache.get(key);
};
const strictRules = edges.flatMap(([from, d, to]) => triggersAt.get(to).map((i) =>
  new NFA(cachedStrictSpec(d, bitOf(i)), 'circle-strict',
    succ.at(from), layerOf(i).at(from), rmax.at(from), MARKERS[i])));

// Completeness: by the last cell before the loop closes back on the centre,
// every circle must have been reached (the mask is full). Reads [VS(neighbour
// of centre), mask-lo(neighbour), mask-hi(neighbour)], guarded to the
// neighbour that is actually the centre's immediate predecessor.
const completenessSpec = (guardDir) => NFA.encodeSpec({
  startState: 'start',
  transition: (s, v) => {
    if (s === 'start') return v === guardDir ? { phase: 'lo' } : 'skip';
    if (s === 'skip') return 'skip';
    if (s.phase === 'lo') return v === 15 ? { phase: 'hi' } : undefined;
    return v === 7 ? 'ok' : undefined;
  },
  accept: (s) => s === 'ok' || s === 'skip',
}, shape);
const completenessRules = dirsFrom(CENTER).map(([d, neighbour]) => new NFA(
  completenessSpec(OPP[d]), 'all-circles-seen',
  succ.at(neighbour), maskLo.at(neighbour), maskHi.at(neighbour)));

return [
  shape,
  ...Object.entries(GIVEN_DIGITS).map(([cell, v]) => new Given(cell, v)),
  new AntiKnight(),
  graph.makeReplicate(new Given(cells[0], ...range(1, 9))),

  succ.toVar('loop-dir'),
  rmax.toVar('circle-rmax'),
  maskLo.toVar('circle-mask-lo'),
  maskHi.toVar('circle-mask-hi'),

  ...loopTopology,
  ...greyTouchRules,
  r1c1Reachable,
  ...minDigitRules,

  rmaxDomain, maskLoDomain, maskHiDomain, ...centerSeed,
  ...rmMonoRules, ...maskLoRules, ...maskHiRules,
  ...forcedBitRules, ...forcedFloorRules,
  ...strictRules,
  ...completenessRules,
];
