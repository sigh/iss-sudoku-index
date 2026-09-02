// Title: Invisible Thermometers
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=cviveR22Aog
// Source: https://app.crackingthecryptic.com/sudoku/frjRNFMDjB

// Rules:
//   Place the digits 1-8 once each in every row, column and region. A digit in
//   a cell with a circle must be odd. A digit in a cell with a square must be
//   even. There are invisible thermometers in this grid. Every empty cell (the
//   6x6 in the center) gets visited by one of those thermometers. Digits on a
//   thermometer increase from the bulb on one end to the tip on the other end.
//   The thermometers are orthogonally connected and don't fork or overlap. A
//   thermometer may have length 1 if it's bulb and tip are the same cell. The
//   difference between bulb and tip must be unique for each thermometer.
//
// Nothing is omitted. The thermometer clauses are encoded in an equivalent
// form which the rules themselves force, by counting cells:
//   - a thermometer of length L carries L strictly increasing digits, so its
//     difference d = tip - bulb is at least L - 1, and at most 7 on a 1-8 grid;
//   - the differences are distinct values in 0..7, so there are at most 8
//     thermometers, and sum(L) <= sum(d + 1) <= (0 + 1 + ... + 7) + 8 = 36;
//   - the thermometers cover the 36 empty cells and do not overlap, so
//     sum(L) >= 36, counting any cell of any thermometer.
// The two bounds meet, so every inequality above is an equality: there are
// exactly 8 thermometers, no thermometer reaches a marked border cell, their
// lengths are exactly 1, 2, ..., 8, and each has d = L - 1, i.e. every step
// along a thermometer adds exactly 1.
//
// So: the 6x6 centre splits into 8 orthogonally connected non-forking paths of
// lengths 1..8, one of each length, and along each path the digit goes up by
// one per step. Two overlays let the solver find that split. VD holds, per
// centre cell, the step to the cell before it on its own thermometer (or BULB
// when it is the thermometer's bulb); VP holds its 1-based position along that
// thermometer.

const shape = new Shape('8x8');
const graph = cellGraph(shape);

// The eight irregular regions, as drawn.
const REGIONS = [
  ['R1C1', 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R3C1', 'R3C2', 'R4C2'],
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C7'],
  ['R2C5', 'R2C6', 'R2C8', 'R3C6', 'R3C7', 'R3C8', 'R4C8', 'R5C8'],
  ['R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C5', 'R8C6', 'R8C7', 'R8C8'],
  ['R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R7C4', 'R7C5', 'R8C4'],
  ['R4C4', 'R4C5', 'R4C6', 'R4C7', 'R5C4', 'R5C5', 'R5C6', 'R5C7'],
  ['R3C3', 'R3C4', 'R3C5', 'R4C1', 'R4C3', 'R5C1', 'R5C2', 'R5C3'],
  ['R6C1', 'R6C2', 'R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R8C3'],
];

// The drawn grey markers, all of them on the border ring: circles then squares.
const CIRCLES = [
  'R1C1', 'R1C4', 'R1C5', 'R1C8', 'R2C1', 'R3C1',
  'R4C8', 'R5C8', 'R8C1', 'R8C2', 'R8C6', 'R8C8'];
const SQUARES = [
  'R1C2', 'R1C3', 'R1C6', 'R1C7', 'R2C8', 'R3C8', 'R4C1', 'R5C1',
  'R6C1', 'R6C8', 'R7C1', 'R7C8', 'R8C3', 'R8C4', 'R8C5', 'R8C7'];

// The empty cells are the unmarked ones, which is the 6x6 centre.
const MARKED = new Set([...CIRCLES, ...SQUARES]);
const CENTRE = graph.cells().filter((cell) => !MARKED.has(cell));
const IN_CENTRE = new Set(CENTRE);

const vd = graph.makeOverlay('VD', CENTRE);
const vp = graph.makeOverlay('VP', CENTRE);

// VD values: BULB, or one of the four steps to the predecessor cell. `back` is
// the value the stepped-to cell would itself use to point back the other way.
const BULB = 1;
const STEPS = [
  { code: 2, dr: -1, dc: 0, back: 3 },
  { code: 3, dr: 1, dc: 0, back: 2 },
  { code: 4, dr: 0, dc: -1, back: 5 },
  { code: 5, dr: 0, dc: 1, back: 4 },
];

// The steps from `cell` that stay inside the centre, with the cell each reaches.
const stepsFrom = (cell) => STEPS.flatMap((step) => {
  const target = graph.step(cell, step.dr, step.dc);
  return target !== null && IN_CENTRE.has(target)
    ? [{ ...step, target }] : [];
});

// Each centre cell is either a bulb, or has one named neighbour as its
// predecessor: one lower digit, one earlier position. The branches list every
// step that stays in the centre, so they also hold VD to a meaningful value.
const chain = CENTRE.map((cell) => new Or([
  new And([new Given(vd.at(cell), BULB), new Given(vp.at(cell), 1)]),
  ...stepsFrom(cell).map(({ code, target }) => new And([
    new Given(vd.at(cell), code),
    new Sum(-1, target, [cell, -1]),
    new Sum(-1, vp.at(target), [vp.at(cell), -1]),
  ])),
]));

// Don't fork: no two cells share a predecessor, i.e. of the centre neighbours
// of any cell, at most one points back at it.
const forkKeys = new Map();
const forkKey = (a, b) => {
  const id = `${a}_${b}`;
  if (!forkKeys.has(id)) {
    forkKeys.set(id, Pair.fnToKey((x, y) => !(x === a && y === b), shape));
  }
  return forkKeys.get(id);
};
const noFork = CENTRE.flatMap((cell) => {
  const steps = stepsFrom(cell);
  return steps.flatMap((s, i) => steps.slice(i + 1).map((t) => new Pair(
    forkKey(s.back, t.back), 'no fork', vd.at(s.target), vd.at(t.target))));
});

// The lengths are 1..8, one thermometer each, so position p is held by exactly
// one cell per thermometer at least p long: 9 - p cells in all.
const positions = [];
for (let p = 1; p <= 8; p++) positions.push(...Array(9 - p).fill(p));

return [
  shape,
  new NoBoxes(),
  ...REGIONS.map((cells) => new Jigsaw('8x8', ...cells)),

  ...CIRCLES.map((cell) => new Given(cell, 1, 3, 5, 7)),
  ...SQUARES.map((cell) => new Given(cell, 2, 4, 6, 8)),

  vd.toVar('predecessor'),
  vp.toVar('position'),
  ...chain,
  ...noFork,
  new ContainExact(positions.join('_'), ...vp.cells()),
];
