// Title: Cube Chaos
// Author: mellowrobinson
// Video: https://www.youtube.com/watch?v=fW6SNpr_2Gk
// Source: https://sudokupad.app/odyy7oejuu

// Rules encoded here:
// - The board is a 4x4x4 cube drawn as four 4x4 layers on a 12x9 canvas. Every
//   cube cell holds a digit 1-8; digits do not repeat along any x, y or z line
//   (4 cells each). The 44 canvas cells outside the four layers are not part of
//   the puzzle and are parked on the spare value 9.
// - Chaos: the 64 cells split into eight regions, each orthogonally connected
//   through the cube (face adjacency, across layers included) and each holding
//   the digits 1-8 once.
// - Internal X-sums: the digit in a circle equals the number of cells of its own
//   region it sees along the three axes (both ways), counting itself, with a
//   different region or the cube edge blocking the ray. Where a number is printed
//   in the circle, it is the sum of the digits in those same seen cells.
// The rules' closing note about the conflict checker describes the app's own
// checker, not a rule, so nothing is encoded for it. No rule is omitted.

const SIZE = 4;             // cube edge
const DIGITS = 8;           // playable digits 1-8
const OFF_CUBE = 9;         // spare value parked on canvas cells outside the cube
const AXIS = [1, 2, 3, 4];

// The four drawn 4x4 layers, as the [row, col] of each layer's top-left canvas
// cell, in stacking order z = 1..4. Each layer is drawn as a slab whose dashed
// back face is offset half a cell up-left, so the depth axis of the picture runs
// up-left/down-right; the two layers that sit on that diagonal from one another
// (rows 1-4 cols 1-4 -> rows 3-6 cols 6-9, and rows 7-10 cols 1-4 -> rows 9-12
// cols 6-9) are the consecutive pairs, and the pairs themselves read top to
// bottom. "Without rotation" in the rules fixes the local x, y of every layer to
// the same corner, and the 16 drawn z-lines each group one local (x, y) across
// all four layers.
const LAYER_ORIGIN = [[1, 1], [3, 6], [7, 1], [9, 6]];

// Drawn clues as [row, col, printed number] over the 12x9 canvas: the 20 circle
// overlays, with the number drawn in the circle's own top-left corner, or null
// where the circle carries no number.
const CIRCLE_CLUES = [
  [1, 4, 19], [2, 1, 9], [2, 2, 36], [3, 6, 35], [3, 7, 15], [3, 8, null],
  [4, 2, 25], [4, 4, 33], [4, 6, 9], [4, 8, 20], [5, 6, 9], [5, 7, 33],
  [7, 4, 12], [9, 1, 16], [9, 2, null], [9, 4, 7], [9, 7, null], [10, 3, null],
  [10, 7, 3], [12, 9, 22],
];

const shape = new Shape('12x9', OFF_CUBE, 'Raw');
const graph = cellGraph(shape);

const cubeCell = (x, y, z) =>
  makeCellId(LAYER_ORIGIN[z - 1][0] + y - 1, LAYER_ORIGIN[z - 1][1] + x - 1);

const cubeCoord = new Map();
for (const z of AXIS) for (const y of AXIS) for (const x of AXIS) {
  cubeCoord.set(cubeCell(x, y, z), [x, y, z]);
}
// Canvas reading order, which is the order the canonical label scan below uses.
const cubeCells = graph.cells().filter(id => cubeCoord.has(id));
const offCubeCells = graph.cells().filter(id => !cubeCoord.has(id));

const inCube = n => n >= 1 && n <= SIZE;
// Cube adjacency, not canvas adjacency: two cells one step apart along x, y or z
// are neighbours even when they sit in different quadrants of the canvas, and
// canvas neighbours in different layers are not neighbours at all.
const STEPS = [
  [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
];
// lint-ok: custom-neighbour-helper
const cubeNeighbours = ([x, y, z]) => STEPS
  .map(([dx, dy, dz]) => [x + dx, y + dy, z + dz])
  .filter(c => c.every(inCube))
  .map(c => cubeCell(...c));
// Cells strictly beyond (x, y, z) along one step direction, ordered near-to-far.
const cubeRay = ([x, y, z], [dx, dy, dz]) => {
  const cells = [];
  for (let c = [x + dx, y + dy, z + dz]; c.every(inCube); c = [c[0] + dx, c[1] + dy, c[2] + dz]) {
    cells.push(cubeCell(...c));
  }
  return cells;
};

// Region label and BFS-depth overlays, one cell each per cube cell.
const labels = graph.makeOverlay('VL', cubeCells);
const depths = graph.makeOverlay('VD', cubeCells);

// A cell list interleaved with its own region labels, so one scan can both
// follow the region boundary and read the digits.
const labelled = cells =>
  labels.at(cells).flatMap((labelCell, i) => [labelCell, cells[i]]);

const digitValues = Array.from({ length: DIGITS }, (_, i) => i + 1);
const gridOrigin = graph.cells()[0];
const domains = [
  graph.makeReplicate(new Given(gridOrigin, ...digitValues), cubeCells),
  graph.makeReplicate(new Given(gridOrigin, OFF_CUBE), offCubeCells),
  labels.makeReplicate(new Given(labels.cells()[0], ...digitValues)),
  depths.makeReplicate(new Given(depths.cells()[0], ...digitValues)),
];

// 48 axis lines: for each of the three axes, the 16 lines of 4 cells running
// along it.
const axisLines = [];
for (const a of AXIS) for (const b of AXIS) {
  axisLines.push(AXIS.map(i => cubeCell(i, a, b)));
  axisLines.push(AXIS.map(i => cubeCell(a, i, b)));
  axisLines.push(AXIS.map(i => cubeCell(a, b, i)));
}
const axisRules = axisLines.map(cells => new AllDifferent(...cells));

// One machine per region label, scanning the whole cube as
// [label, digit, label, digit, ...]: `take` says whether the digit about to be
// read belongs to this label, and `mask` is the set of digits already seen for
// it. A repeat inside the label is rejected outright, so no label can hold more
// than 8 cells; 64 cells over 8 labels then forces exactly 8 each, which is what
// `mask === 255` at the end asserts.
const regionContent = digitValues.map(label => {
  const spec = NFA.encodeSpec({
    startState: { mask: 0, take: null },
    transition: ({ mask, take }, value) => {
      if (take === null) return { mask, take: value === label };
      if (!take) return { mask, take: null };
      const bit = 1 << (value - 1);
      if (mask & bit) return undefined;
      return { mask: mask | bit, take: null };
    },
    accept: ({ mask, take }) => take === null && mask === (1 << DIGITS) - 1,
  }, shape);
  return new NFA(spec, `region ${label}`, ...labelled(cubeCells));
});

// Region labels are an artifact of this encoding -- the rules name no regions --
// so fix the 8! relabellings by requiring label k to first appear before label
// k + 1 in canvas reading order: a label may exceed every label so far by at
// most one.
const canonicalLabels = new NFA(NFA.encodeSpec({
  startState: { max: 0 },
  transition: ({ max }, value) =>
    value > max + 1 ? undefined : { max: Math.max(max, value) },
  accept: () => true,
}, shape), 'canonical labels', ...labels.at(cubeCells));

// The depth overlay certifies that each region is connected, and is a function
// of the partition so that it cannot multiply solutions: depth 1 marks the
// region's unique digit-1 cell (its root), and every other cell of the region is
// one deeper than a neighbour of the same region. The two clauses below pin the
// depth to the true distance from that root.
const rootIsDigitOne = Pair.fnToKey((digit, depth) => (digit === 1) === (depth === 1), shape);
const roots = cubeCells.map(
  id => new Pair(rootIsDigitOne, 'region root', id, depths.at(id)));

// One machine per cube cell over [own label, own depth, then each neighbour's
// label and depth]: `found` demands a same-region neighbour exactly one shallower
// (trivially satisfied at depth 1), and the rejected branch forbids a same-region
// neighbour two or more shallower, without which the depth could exceed the true
// distance.
const descentSpec = NFA.encodeSpec({
  startState: { own: null, depth: null, found: false, same: null },
  transition: (state, value) => {
    if (state.own === null) {
      return { own: value, depth: null, found: false, same: null };
    }
    if (state.depth === null) {
      return { own: state.own, depth: value, found: value === 1, same: null };
    }
    if (state.same === null) {
      return { ...state, same: value === state.own };
    }
    const base = { own: state.own, depth: state.depth, found: state.found, same: null };
    if (!state.same) return base;
    if (value < state.depth - 1) return undefined;
    return { ...base, found: state.found || value === state.depth - 1 };
  },
  accept: ({ found }) => found,
}, shape);
const connectivity = cubeCells.map(id => new NFA(
  descentSpec, 'region connectivity',
  labels.at(id), depths.at(id),
  ...cubeNeighbours(cubeCoord.get(id)).flatMap(n => [labels.at(n), depths.at(n)])));

// Sight count: multi-segment scan of [own digit, own label] then the six rays as
// label-only segments, near-to-far. `blocked` resets at each SEGMENT_BREAK (a new
// ray); a ray cell of a different label blocks the rest of that ray. `count`
// omits the origin, so the rule "including itself" is count + 1 === target, and
// it saturates at `target` (a fail sink) to bound the state.
const sightCountSpec = NFA.encodeSpec({
  startState: { target: null, own: null, count: 0, blocked: false },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      if (state.own === null) return undefined;
      return { ...state, blocked: false };
    }
    if (state.target === null) {
      return { target: value, own: null, count: 0, blocked: false };
    }
    if (state.own === null) return { ...state, own: value };
    if (state.blocked) return state;
    if (value !== state.own) return { ...state, blocked: true };
    return { ...state, count: Math.min(state.count + 1, state.target) };
  },
  accept: ({ target, count }) => target !== null && count + 1 === target,
  // 2 origin cells + 9 ray cells (three axes, three other cells each, whatever
  // the origin's position) + 6 segment breaks.
  maxDepth: 2 + 3 * (SIZE - 1) + STEPS.length,
}, shape, { multiSegment: true });

// Sight sum: the same scan with each ray interleaved [label, digit, ...] so the
// digits of the seen cells can be totalled. `phase` 0 expects a ray label, 1 a
// digit to add, 2 a digit to skip (the ray is already blocked). The origin's own
// digit seeds the total, matching "including itself".
const sightSumSpec = clue => NFA.encodeSpec({
  startState: { own: null, sum: null, blocked: false, phase: 0 },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      if (state.sum === null || state.phase !== 0) return undefined;
      return { ...state, blocked: false };
    }
    if (state.own === null) {
      return { own: value, sum: null, blocked: false, phase: 0 };
    }
    if (state.sum === null) {
      return value > clue ? undefined : { ...state, sum: value };
    }
    if (state.phase === 0) {
      const visible = !state.blocked && value === state.own;
      return { ...state, blocked: !visible, phase: visible ? 1 : 2 };
    }
    if (state.phase === 1) {
      const sum = state.sum + value;
      return sum > clue ? undefined : { ...state, sum, phase: 0 };
    }
    return { ...state, phase: 0 };
  },
  accept: ({ sum, phase }) => sum === clue && phase === 0,
  // 2 origin cells + 2 cells read per ray cell + 6 segment breaks.
  maxDepth: 2 + 2 * 3 * (SIZE - 1) + STEPS.length,
}, shape, { multiSegment: true });

const sightRules = CIRCLE_CLUES.flatMap(([row, col, clue]) => {
  const id = makeCellId(row, col);
  const rays = STEPS.map(step => cubeRay(cubeCoord.get(id), step));
  const rules = [new NFA(
    sightCountSpec, 'sight count', [id, labels.at(id)],
    // Each ray is already a cell array; at() is taking the whole ray.
    // lint-ok: overlay-map-use-array
    ...rays.map(ray => labels.at(ray)))];
  if (clue === null) return rules;
  rules.push(new NFA(
    sightSumSpec(clue), `sight sum ${clue}`, [labels.at(id), id],
    ...rays.map(labelled)));
  return rules;
});

return [
  shape,
  labels.toVar('region label'),
  depths.toVar('region depth'),
  ...domains,
  ...axisRules,
  ...regionContent,
  canonicalLabels,
  ...roots,
  ...connectivity,
  ...sightRules,
];
