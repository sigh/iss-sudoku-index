// Title: Renban Caves
// Author: yttrio
// Video: https://www.youtube.com/watch?v=gu3H58R1l2M
// Source: https://sudokupad.app/vgbfcjxvav

// Normal Sudoku rules apply, with no given digits.
//
// Every cell is either shaded or unshaded.
//   - Every shaded cell reaches the edge of the grid through shaded cells, so
//     the shaded cells may form several blobs provided each one touches the
//     border.
//   - The unshaded cells form one orthogonally connected area.
//   - A 2x2 area that is entirely shaded or entirely unshaded is explicitly
//     allowed, so that sentence adds no constraint.
//   - A circled cell is unshaded, and its digit is the number of unshaded cells
//     it sees along its row and its column, itself included; the first shaded
//     cell in each direction blocks the view.
//   - The two cells of a white dot hold consecutive digits, and exactly one of
//     them is shaded. The rules do not say the dots are exhaustive, so undotted
//     edges are unconstrained.
//   - Within one 3x3 box, each orthogonally connected group of unshaded cells
//     (connected using steps that stay inside the box) holds a nonrepeating set
//     of consecutive digits. A group of a single cell is allowed. Digits never
//     repeat inside a box, so the content of the rule is that each group's
//     digits span an unbroken run.
//
// Nothing is omitted.

const SHADED = 1;
const UNSHADED = 2;

const grid = cellGraph('9x9');

// The shading lives on an 11x11 overlay: the 9x9 grid inset in a one-cell frame
// whose cells are pinned to SHADED. "Every shaded cell reaches the grid edge
// through shaded cells" is then exactly "the shaded cells plus the frame form a
// single orthogonally connected region", which ConnectedValues states directly.
const framedGrid = cellGraph('11x11');
const shade = framedGrid.makeOverlay('VS');
const innerShade = shade.at(framedGrid.block('R2C2', 9, 9));
const shadeOf = new Map(grid.cells().map((cell, i) => [cell, innerShade[i]]));
const insetCells = new Set(innerShade);
const frameCells = shade.cells().filter(cell => !insetCells.has(cell));

// Two more whole-grid overlays name the renban group each unshaded cell belongs
// to. VM holds the smallest digit of the cell's group, which identifies the
// group inside its box; VD holds the cell's step distance from the group member
// holding that smallest digit. Shaded cells are pinned to VM = own digit and
// VD = 1 so that they carry no free choice of their own.
const groupMin = grid.makeOverlay('VM');
const groupDepth = grid.makeOverlay('VD');

// Drawn data: the eleven circles, as the cell each is drawn in.
const circles = [
  'R1C1', 'R1C5', 'R1C6', 'R1C9', 'R3C3', 'R3C5',
  'R5C1', 'R6C4', 'R6C5', 'R7C8', 'R9C5',
];

// Drawn data: the eight white dots, as the cell pair each sits between.
const whiteDots = [
  ['R1C2', 'R2C2'], ['R2C2', 'R3C2'], ['R1C8', 'R2C8'], ['R4C4', 'R4C5'],
  ['R5C7', 'R6C7'], ['R6C8', 'R6C9'], ['R7C6', 'R8C6'], ['R8C7', 'R8C8'],
];

// Box geometry the renban rule is scoped to: which box a cell is in, that
// cell's orthogonal neighbours inside the same box, and each box's internal
// adjacent pairs listed once.
const boxOf = new Map(
  grid.boxes().flatMap(box => box.map(cell => [cell, box])));
const boxNeighbours = (cell) => grid.neighbours(cell)
  .filter(other => boxOf.get(other) === boxOf.get(cell));
const boxPairs = grid.boxes().flatMap(box => {
  const order = new Map(box.map((cell, i) => [cell, i]));
  return box.flatMap(cell => boxNeighbours(cell)
    .filter(other => order.get(other) > order.get(cell))
    .map(other => [cell, other]));
});

// One machine per cell over its shade, digit, VM and VD. A shaded cell is
// pinned to the neutral VM = digit, VD = 1. An unshaded cell's group minimum
// cannot exceed its own digit, and a cell at distance 1 -- the group member the
// distances are measured from -- is the one holding that minimum.
const labelSpec = NFA.encodeSpec({
  startState: { phase: 'shade', shade: 0, digit: 0, rootable: false },
  transition: (state, value) => {
    switch (state.phase) {
      case 'shade':
        if (value !== SHADED && value !== UNSHADED) return undefined;
        return { phase: 'digit', shade: value, digit: 0, rootable: false };
      case 'digit':
        return { phase: 'min', shade: state.shade, digit: value, rootable: false };
      case 'min':
        if (state.shade === SHADED && value !== state.digit) return undefined;
        if (state.shade === UNSHADED && value > state.digit) return undefined;
        return {
          phase: 'depth',
          shade: state.shade,
          digit: 0,
          rootable: value === state.digit,
        };
      case 'depth':
        if (state.shade === SHADED && value !== 1) return undefined;
        if (state.shade === UNSHADED && value === 1 && !state.rootable) return undefined;
        return { phase: 'done', shade: 0, digit: 0, rootable: false };
      default:
        return undefined;
    }
  },
  accept: (state) => state.phase === 'done',
  maxDepth: 4,   // shade, digit, VM, VD
}, 9);

const cellLabels = grid.cells().map(cell => new NFA(
  labelSpec, 'group-label',
  shadeOf.get(cell), cell, groupMin.at(cell), groupDepth.at(cell)));

// One machine per pair of orthogonally adjacent cells inside a box, over both
// shades, both VMs and both VDs. Two adjacent unshaded cells are in the same
// group, so they carry the same VM, and their distances from the group's
// smallest-digit cell differ by at most one. A pair with a shaded cell is
// accepted whatever it carries.
const samePairSpec = NFA.encodeSpec({
  startState: { phase: 'shadeA', both: false, minA: 0, depthA: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 'shadeA':
        if (value !== SHADED && value !== UNSHADED) return undefined;
        return { phase: 'shadeB', both: value === UNSHADED, minA: 0, depthA: 0 };
      case 'shadeB':
        if (value !== SHADED && value !== UNSHADED) return undefined;
        if (!(state.both && value === UNSHADED)) {
          return { phase: 'free', both: false, minA: 0, depthA: 0 };
        }
        return { phase: 'minA', both: true, minA: 0, depthA: 0 };
      case 'free':   // one of the pair is shaded: the rest is unconstrained
        return { phase: 'free', both: false, minA: 0, depthA: 0 };
      case 'minA':
        return { phase: 'minB', both: true, minA: value, depthA: 0 };
      case 'minB':
        if (value !== state.minA) return undefined;
        return { phase: 'depthA', both: true, minA: 0, depthA: 0 };
      case 'depthA':
        return { phase: 'depthB', both: true, minA: 0, depthA: value };
      case 'depthB':
        if (Math.abs(value - state.depthA) > 1) return undefined;
        return { phase: 'free', both: false, minA: 0, depthA: 0 };
      default:
        return undefined;
    }
  },
  accept: (state) => state.phase === 'free',
  maxDepth: 6,   // two shades, two VMs, two VDs
}, 9);

const samePairs = boxPairs.map(([a, b]) => new NFA(
  samePairSpec, 'same-group',
  shadeOf.get(a), shadeOf.get(b),
  groupMin.at(a), groupMin.at(b),
  groupDepth.at(a), groupDepth.at(b)));

// One machine per cell, over its own shade and VD followed by the shade and VD
// of each of its in-box orthogonal neighbours. An unshaded cell at distance d
// greater than 1 must have an unshaded in-box neighbour at distance d - 1.
// Together with the previous machine's "adjacent distances differ by at most
// one" this makes VD the true step distance from the group's smallest-digit
// cell, so it is fixed by the shading and admits no free choice, and every
// unshaded cell is joined to that cell through its own group.
const parentSpec = NFA.encodeSpec({
  startState: { phase: 'shade', want: 0, found: false, pending: false },
  transition: (state, value) => {
    switch (state.phase) {
      case 'shade':
        if (value !== SHADED && value !== UNSHADED) return undefined;
        if (value === SHADED) {
          return { phase: 'free', want: 0, found: true, pending: false };
        }
        return { phase: 'depth', want: 0, found: false, pending: false };
      case 'depth':
        if (value === 1) {
          return { phase: 'free', want: 0, found: true, pending: false };
        }
        return { phase: 'shadeN', want: value - 1, found: false, pending: false };
      case 'free':   // nothing left to check: consume the remaining cells
        return { phase: 'free', want: 0, found: true, pending: false };
      case 'shadeN':
        if (value !== SHADED && value !== UNSHADED) return undefined;
        return {
          phase: 'depthN',
          want: state.want,
          found: state.found,
          pending: value === UNSHADED,
        };
      case 'depthN':
        return {
          phase: 'shadeN',
          want: state.want,
          found: state.found || (state.pending && value === state.want),
          pending: false,
        };
      default:
        return undefined;
    }
  },
  accept: (state) => state.found,
  maxDepth: 10,   // own shade and VD, then shade and VD of up to four neighbours
}, 9);

const parents = grid.cells().map(cell => new NFA(
  parentSpec, 'group-parent',
  shadeOf.get(cell), groupDepth.at(cell),
  ...boxNeighbours(cell).flatMap(other => [
    shadeOf.get(other), groupDepth.at(other)])));

// One machine per cell, over its VM and digit followed by the digit, shade and
// VM of the other eight cells of its box. Every digit from the group's minimum
// up to the cell's own digit must sit in an unshaded cell of the same group.
// Applied at the group member holding its largest digit, that says the group
// holds every digit between its smallest and its largest, which -- the box
// already forbidding repeats -- is the renban rule. A shaded cell carries
// VM = its own digit, so the span is empty and the machine is vacuous there.
const spanSpec = NFA.encodeSpec({
  startState: { phase: 'min', min: 0, digit: 0, wanted: false },
  transition: (state, value) => {
    switch (state.phase) {
      case 'min':
        return { phase: 'digit', min: value, digit: 0, wanted: false };
      case 'digit':
        return { phase: 'otherDigit', min: state.min, digit: value, wanted: false };
      case 'otherDigit':
        return {
          phase: 'otherShade',
          min: state.min,
          digit: state.digit,
          wanted: value >= state.min && value < state.digit,
        };
      case 'otherShade':
        if (value !== SHADED && value !== UNSHADED) return undefined;
        if (state.wanted && value !== UNSHADED) return undefined;
        return {
          phase: 'otherMin',
          min: state.min,
          digit: state.digit,
          wanted: state.wanted,
        };
      case 'otherMin':
        if (state.wanted && value !== state.min) return undefined;
        return {
          phase: 'otherDigit',
          min: state.min,
          digit: state.digit,
          wanted: false,
        };
      default:
        return undefined;
    }
  },
  accept: (state) => state.phase === 'otherDigit',
  maxDepth: 26,   // own VM and digit, then digit, shade and VM of eight cells
}, 9);

const spans = grid.cells().map(cell => new NFA(
  spanSpec, 'group-span',
  groupMin.at(cell), cell,
  ...boxOf.get(cell).filter(other => other !== cell)
    .flatMap(other => [other, shadeOf.get(other), groupMin.at(other)])));

// One machine per circle: the circled digit is the first segment, then each of
// the four rays away from it in turn, read over the shade overlay. `target` is
// the circled digit, `count` the unshaded cells seen so far, and `blocked`
// records that the current ray has already run into a shaded cell, so nothing
// beyond it is visible. The break between segments starts the next ray with
// sight restored. The circled cell is itself unshaded and counts itself, so the
// rays must supply exactly `target - 1` cells; passing that is a dead branch,
// which also bounds `count`.
const sightSpec = NFA.encodeSpec({
  startState: { target: 0, count: 0, blocked: false },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return { target: state.target, count: state.count, blocked: false };
    }
    if (state.target === 0) return { target: value, count: 0, blocked: false };
    if (state.blocked || value !== UNSHADED) {
      return { target: state.target, count: state.count, blocked: true };
    }
    const count = state.count + 1;
    if (count >= state.target) return undefined;
    return { target: state.target, count: count, blocked: false };
  },
  accept: (state) => state.target !== 0 && state.count === state.target - 1,
  maxDepth: 21,   // 17 cells (the circle and its two full lines) plus 4 breaks
}, 9, { multiSegment: true });

const RAY_DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

const sightCounts = circles.map(cell => new NFA(
  sightSpec, 'sight', [cell],
  ...RAY_DIRECTIONS
    .map(([dRow, dCol]) => grid.ray(cell, dRow, dCol).slice(1)
      .map(rayCell => shadeOf.get(rayCell)))
    .filter(ray => ray.length)));

return [
  new Shape('9x9'),

  shade.toVar('shade'),
  groupMin.toVar('group min digit'),
  groupDepth.toVar('group depth'),

  // The shaded/unshaded domain is stamped over the whole shade layer, frame
  // included, so the frame pins and the circle pins narrow it rather than
  // replace it.
  shade.makeReplicate(new Given(shade.cells()[0], SHADED, UNSHADED)),
  shade.makeReplicate(new Given(shade.cells()[0], SHADED), frameCells),

  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),

  ...circles.map(cell => new Given(shadeOf.get(cell), UNSHADED)),
  ...sightCounts,

  ...whiteDots.flatMap(([a, b]) => [
    new WhiteDot(a, b),
    // The shade layer holds only SHADED and UNSHADED, so all-different across
    // the dot's two shade cells is "exactly one of them is shaded".
    new AllDifferent(shadeOf.get(a), shadeOf.get(b)),
  ]),

  ...cellLabels,
  ...samePairs,
  ...parents,
  ...spans,
];
