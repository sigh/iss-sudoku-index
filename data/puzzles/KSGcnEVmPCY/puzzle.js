// Title: Suguru Chaos Deconstruction
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=KSGcnEVmPCY
// Source: https://tinyurl.com/yxkz85wk

// Rules encoded here, in full:
//  * Fill some cells of the 15x15 grid with digits 1-9 so that no digit repeats
//    in a row or column. Cells may be left empty; there are no boxes.
//  * Cells containing a circle, square or arrow must have a digit.
//  * Digits along an arrow sum to the digit in its circle. A circle with several
//    arms is several arrows sharing the circle: each arm sums to it separately.
//  * Gray squares hold even digits, gray circles odd digits.
//  * A region is a collection of orthogonally adjacent cells; a region of size n
//    contains the digits 1..n once each; regions may not touch orthogonally
//    (diagonal contact is allowed). So a region is a maximal orthogonally
//    connected group of filled cells.
// The source's note about switching off the conflict checker is UI advice.
// Nothing is omitted.
//
// Model. The value 0 means "no digit" on every layer. Two overlays carry the
// regions, which are not drawn:
//   VL  region label: 0 on an empty cell; on a filled cell, the row number of
//       the digit 1 in its region. A region of size n holds 1..n, so it holds
//       exactly one 1, and a row holds at most one 1, so this names every
//       region uniquely with no label symmetry.
//   VD  depth: 0 on an empty cell, 1 on a region's 1, and 1 + the number of
//       orthogonal steps to that 1 inside the region otherwise.

const EMPTY = 0;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const ODD = [1, 3, 5, 7, 9];
const EVEN = [2, 4, 6, 8];
// A region's digits are distinct and drawn from 1-9, so it has at most 9 cells
// and every cell of it is within 8 orthogonal steps of its 1.
const MAX_REGION = 9;
const MAX_REACH = MAX_REGION - 1;

const shape = new Shape('15x15', '0-15', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();
const label = graph.makeOverlay('VL');
const depth = graph.makeOverlay('VD');
const cellAt = ([row, col]) => makeCellId(row, col);

// Transcribed from the drawn arrows, as [row, col] pairs: circle first, then
// the arm cells in order away from it, one entry per arm.
const ARROWS = [
  [[2, 3], [1, 2]],
  [[2, 3], [3, 3], [4, 3], [3, 4]],
  [[2, 3], [1, 4], [1, 5]],
  [[2, 6], [3, 5], [4, 5]],
  [[6, 9], [5, 10], [4, 10], [3, 9], [2, 9], [1, 9]],
  [[9, 5], [8, 5], [7, 5], [6, 6], [5, 7]],
  [[9, 5], [10, 6]],
  [[6, 2], [5, 1]],
  [[6, 2], [6, 3], [6, 4]],
  [[5, 4], [4, 5]],
  [[5, 9], [4, 8]],
  [[8, 3], [8, 2], [8, 1]],
  [[8, 3], [9, 4], [10, 4]],
  [[10, 3], [9, 2]],
  [[10, 3], [11, 3], [12, 3]],
  [[13, 1], [13, 2], [14, 2]],
  [[14, 5], [14, 6], [15, 7]],
  [[11, 5], [12, 4]],
  [[10, 7], [9, 8]],
  [[11, 9], [11, 8], [11, 7]],
  [[12, 10], [13, 10], [14, 10]],
  [[12, 10], [11, 11], [11, 12]],
  [[13, 13], [12, 12], [12, 11]],
  [[13, 13], [14, 13], [14, 14]],
  [[12, 15], [13, 15], [14, 15], [15, 15]],
  [[10, 11], [9, 10]],
  [[10, 11], [9, 12], [9, 13], [9, 14]],
  [[8, 12], [8, 11], [8, 10]],
].map(arm => arm.map(cellAt));
// Transcribed from the gray circles and gray squares drawn in the grid.
const GRAY_CIRCLES = [[3, 4], [7, 9], [14, 13], [15, 12]].map(cellAt);
const GRAY_SQUARES = [[3, 7], [6, 12], [7, 15]].map(cellAt);

// --- Digits, circles, squares and arrows --------------------------------------

const gridDomain = graph.makeReplicate(new Given(cells[0], EMPTY, ...DIGITS));
const mustHaveDigit = graph.makeReplicate(new Given(cells[0], ...DIGITS),
  [...new Set([...ARROWS.flat(), ...GRAY_CIRCLES, ...GRAY_SQUARES])]);
const parity = [
  ...GRAY_CIRCLES.map(cell => new Given(cell, ...ODD)),
  ...GRAY_SQUARES.map(cell => new Given(cell, ...EVEN)),
];
const arrows = ARROWS.map(arm => new Arrow(...arm));

// Reads the cells of one row or column: no digit twice, empties unrestricted.
const lineSpec = NFA.encodeSpec({
  startState: { mask: 0 },
  transition: ({ mask }, value) => {
    if (value === EMPTY) return { mask };
    if (value > MAX_REGION) return undefined;
    const bit = 1 << (value - 1);
    return (mask & bit) ? undefined : { mask: mask | bit };
  },
  accept: () => true,
}, shape);
const lines = [...graph.rows(), ...graph.columns()].map(
  line => new NFA(lineSpec, 'no repeated digit', ...line));

// --- Region layers ------------------------------------------------------------

const depthDomain = depth.makeReplicate(
  new Given(depth.cells()[0], EMPTY, ...DIGITS));
// A cell in row r can only belong to a region whose 1 lies within MAX_REACH
// rows of r.
const labelDomain = cells.map(cell => {
  const { row } = parseCellId(cell);
  const rows = [];
  for (let r = Math.max(1, row - MAX_REACH); r <= Math.min(15, row + MAX_REACH); r++) {
    rows.push(r);
  }
  return new Given(label.at(cell), EMPTY, ...rows);
});

// (digit, VL): empty cells carry no label, a 1 names its own row, every other
// digit carries some label.
const labelKeys = new Map();
const labelKey = row => {
  if (!labelKeys.has(row)) {
    labelKeys.set(row, Pair.fnToKey((digit, lab) =>
      digit === EMPTY ? lab === EMPTY : digit === 1 ? lab === row : lab !== EMPTY,
      shape));
  }
  return labelKeys.get(row);
};
// (digit, VD): empty cells have no depth, a 1 has depth 1, other digits deeper.
const depthKey = Pair.fnToKey((digit, dep) =>
  digit === EMPTY ? dep === EMPTY : digit === 1 ? dep === 1 : dep >= 2, shape);
const layerFollowsDigit = cells.flatMap(cell => [
  new Pair(labelKey(parseCellId(cell).row), 'label follows digit',
    cell, label.at(cell)),
  new Pair(depthKey, 'depth follows digit', cell, depth.at(cell)),
]);

// Along each orthogonal edge: two filled cells are in one region (regions do
// not touch), so they share a label, and their depths differ by at most one.
const sameRegion = Pair.fnToKey(
  (a, b) => a === EMPTY || b === EMPTY || a === b, shape);
const depthStep = Pair.fnToKey(
  (a, b) => a === EMPTY || b === EMPTY || Math.abs(a - b) <= 1, shape);
const STEPS = [[0, 1], [1, 0]];   // right and down: each edge once
const edgeRules = STEPS.flatMap(([dRow, dCol]) => [
  [label, sameRegion, 'adjacent filled cells share a region'],
  [depth, depthStep, 'depth changes by at most one'],
].map(([layer, key, name]) => {
  const origin = layer.cells()[0];
  const targets = layer.cells().filter(cell => layer.step(cell, dRow, dCol));
  return layer.makeReplicate(
    new Pair(key, name, origin, layer.step(origin, dRow, dCol)), targets);
}));

// Reads [VD(cell), VD(each orthogonal neighbour)]: a cell at depth d >= 2 has a
// neighbour at depth d - 1. Following those neighbours reaches a depth-1 cell,
// i.e. a 1, through filled cells only, so every filled cell is connected to
// its region's 1; with the step rule above the depth is then the true distance.
const descentSpec = NFA.encodeSpec({
  startState: { phase: 'self' },
  transition: (state, value) => {
    if (state.phase === 'self') {
      return value <= 1 ? { phase: 'done' } : { phase: 'seek', need: value - 1 };
    }
    if (state.phase === 'done') return { phase: 'done' };
    return value === state.need ? { phase: 'done' } : state;
  },
  accept: state => state.phase === 'done',
}, shape);
// Cells are grouped by which of the four neighbours exist (nine groups: the
// interior, four edges, four corners), and each group is one Replicate of a
// template whose cell sits just far enough from the grid corner to have every
// neighbour of that group.
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];   // up, down, left, right
const descentGroups = new Map();
for (const cell of cells) {
  const present = DIRS.filter(([dRow, dCol]) => graph.step(cell, dRow, dCol));
  const key = present.join('|');
  if (!descentGroups.has(key)) descentGroups.set(key, { present, members: [] });
  descentGroups.get(key).members.push(cell);
}
const descent = [...descentGroups.values()].map(({ present, members }) => {
  const rowShift = present.some(([dRow]) => dRow < 0) ? 1 : 0;
  const colShift = present.some(([, dCol]) => dCol < 0) ? 1 : 0;
  const self = makeCellId(1 + rowShift, 1 + colShift);
  const template = new NFA(descentSpec, 'nearer the region\'s 1',
    ...depth.at([self, ...present.map(([dRow, dCol]) => graph.step(self, dRow, dCol))]));
  const targets = members.map(cell => graph.step(cell, -rowShift, -colShift));
  return depth.makeReplicate(template, depth.at(targets));
});

// One machine per label k, reading (VL, digit) for every cell a label-k region
// can reach, in reading order. It collects the digits carried under label k as
// a bitmask, rejecting a repeat, and accepts when the mask is 1..n for some n
// (or empty, when no region's 1 is in row k): n distinct digits from 1-9 that
// include every smaller digit are exactly 1..n. `at` says what the next symbol
// is: a label, a member's digit, or a non-member's digit.
const regionSpec = k => NFA.encodeSpec({
  startState: { mask: 0, at: 'label' },
  transition: (state, value) => {
    if (state.at === 'label') {
      return { mask: state.mask, at: value === k ? 'member' : 'other' };
    }
    if (state.at === 'other') return { mask: state.mask, at: 'label' };
    if (value < 1 || value > MAX_REGION) return undefined;
    const bit = 1 << (value - 1);
    return (state.mask & bit) ? undefined : { mask: state.mask | bit, at: 'label' };
  },
  accept: state => state.at === 'label' && (state.mask & (state.mask + 1)) === 0,
}, shape);
const regions = [];
for (let k = 1; k <= 15; k++) {
  const reachable = cells.filter(
    cell => Math.abs(parseCellId(cell).row - k) <= MAX_REACH);
  regions.push(new NFA(regionSpec(k), 'region rooted in row ' + k,
    ...reachable.flatMap(cell => [label.at(cell), cell])));
}

return [
  shape,
  label.toVar('region label: row of its 1'),
  depth.toVar('steps from the region\'s 1'),
  gridDomain,
  depthDomain,
  ...labelDomain,
  mustHaveDigit,
  ...parity,
  ...arrows,
  ...lines,
  ...layerFollowsDigit,
  ...edgeRules,
  ...descent,
  ...regions,
];
