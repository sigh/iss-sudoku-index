// Title: Border Lots
// Author: DubiousMobius
// Video: https://www.youtube.com/watch?v=aFdQkHxowPM
// Source: https://sudokupad.app/84h1epyqqj

// Rules encoded here, in full:
//   Chaos construction. Place 1-6 once each in every row and column, and
//   partition the grid into six orthogonally connected 6-cell regions, each
//   holding 1-6 once.
//   Region Border Lots. The digit in a cell carrying a diamond counts the cells
//   along that diamond's purple line whose region borders are arranged in the
//   same shape as the diamond's black edges.
//
// A cell's side is a region border when it separates the cell from a cell of a
// different region, or when it lies on the grid's outer edge -- there the
// region simply ends, and the boundary is drawn exactly as an interior region
// boundary is. Every cell therefore has four sides that may be borders, which
// is what the diamond's four-edge vocabulary assumes.

const graph = cellGraph('6x6');
const cc = graph.makeOverlay('CC');

// Cell path of each drawn purple stroke. Line D is a closed ring; its repeated
// first waypoint closes the drawing and adds no fifth cell.
const LINES = {
  A: ['R5C4', 'R6C4', 'R6C5', 'R6C6', 'R5C6', 'R4C6', 'R3C6'],
  B: ['R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1', 'R2C1'],
  C: ['R3C1', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R6C1'],
  D: ['R2C4', 'R2C5', 'R3C5', 'R3C4'],
};

// Each diamond is a square rotated 45 degrees about its cell's centre, with
// vertices at the cell's compass points, so its four edges face the four
// quadrants. `edges` is the subset drawn in black over the grey outline.
const DIAMONDS = [
  { cell: 'R1C2', line: 'B', edges: ['NW', 'SE'] },
  { cell: 'R1C4', line: 'B', edges: ['SW', 'SE'] },
  { cell: 'R1C6', line: 'B', edges: ['SW', 'SE', 'NE'] },
  { cell: 'R3C5', line: 'D', edges: ['SW', 'NE'] },
  { cell: 'R6C2', line: 'C', edges: ['SW', 'SE'] },
  { cell: 'R6C4', line: 'A', edges: ['SW', 'SE'] },
  { cell: 'R6C5', line: 'A', edges: [] },
  { cell: 'R6C6', line: 'A', edges: ['SW', 'SE', 'NE'] },
];

// Matching is by shape, not by orientation: the diamond stands at 45 degrees to
// the cell it describes, so its edges never lie over the sides they stand for,
// and only the arrangement of the black edges around the diamond -- how many,
// and adjacent or opposite -- can be carried across. Diamond edges in clockwise
// order therefore correspond to cell sides in clockwise order, at whichever of
// the four offsets, so a clue admits every rotation of its drawn pattern.
const DIAMOND_EDGES_CW = ['NW', 'NE', 'SE', 'SW'];
const SIDES_CW = ['N', 'E', 'S', 'W'];
const STEPS = { N: [-1, 0], E: [0, 1], S: [1, 0], W: [0, -1] };

// Border codes: two Vars per line cell, each a 2-bit code of which sides of
// that axis are region borders. NS = 1 + 2*(N is a border) + (S is a border),
// EW likewise over E and W. A cell off every line carries no clue and gets no
// code.
const LINE_CELLS = [...new Set(Object.values(LINES).flat())];
const nsCode = graph.makeOverlay('VN', LINE_CELLS);
const ewCode = graph.makeOverlay('VE', LINE_CELLS);

const axisCodeOf = (sides, axis) =>
  1 + (sides.includes(axis[0]) ? 2 : 0) + (sides.includes(axis[1]) ? 1 : 0);
const codePairOf = (sides) => [axisCodeOf(sides, 'NS'), axisCodeOf(sides, 'EW')];

// NFA over [region label of the cell, region label of each present neighbour in
// `weights` order, the code Var]: a side is a border when that neighbour's
// label differs, and the code Var must equal the resulting code. `base` carries
// the sides with no neighbour, which are grid-edge borders and so always set.
const codeSpec = (weights, base) => ({
  startState: { i: 0, label: 0, sum: 0 },
  transition: ({ i, label, sum }, value) => {
    if (i === 0) return { i: 1, label: value, sum: base };
    if (i <= weights.length) {
      return { i: i + 1, label, sum: sum + (value !== label ? weights[i - 1] : 0) };
    }
    if (i === weights.length + 1 && value === sum + 1) return { i: i + 1, label: 0, sum: 0 };
    return undefined;
  },
  accept: ({ i }) => i === weights.length + 2,
});

const axisCode = (cell, axis, overlay) => {
  const weightOf = (side) => (side === axis[0] ? 2 : 1);
  const neighbourOf = (side) => graph.step(cell, ...STEPS[side]);
  const present = [...axis].filter(neighbourOf);
  const base = [...axis].filter(side => !neighbourOf(side))
    .reduce((sum, side) => sum + weightOf(side), 0);
  return new NFA(
    NFA.encodeSpec(codeSpec(present.map(weightOf), base), 6), 'BorderCode',
    cc.at(cell), ...present.map(side => cc.at(neighbourOf(side))), overlay.at(cell));
};

const borderCodes = LINE_CELLS.flatMap(cell => [
  axisCode(cell, 'NS', nsCode),
  axisCode(cell, 'EW', ewCode),
]);

// NFA over [the diamond's own digit, then the NS and EW code of each cell of
// its line]: a cell is counted when its two codes are one of the clue's allowed
// pairs, and the total must equal the digit. `mask` holds the pairs still
// matching after the NS code, and -1 means the next value read is an NS code.
const countSpec = (pairs) => ({
  startState: { target: 0, count: 0, mask: -1 },
  transition: ({ target, count, mask }, value) => {
    if (target === 0) return { target: value, count: 0, mask: -1 };
    if (mask === -1) {
      return {
        target, count,
        mask: pairs.reduce((m, pair, k) => m | (pair[0] === value ? 1 << k : 0), 0),
      };
    }
    const hit = pairs.some((pair, k) => (mask & (1 << k)) && pair[1] === value);
    if (count + (hit ? 1 : 0) > target) return undefined;
    return { target, count: count + (hit ? 1 : 0), mask: -1 };
  },
  accept: ({ target, count, mask }) => mask === -1 && count === target,
});

const borderLots = DIAMONDS.map(({ cell, line, edges }) => {
  const drawn = DIAMOND_EDGES_CW.map(edge => edges.includes(edge));
  const pairs = SIDES_CW.map((_, offset) => codePairOf(
    SIDES_CW.filter((side, i) => drawn[(i + offset) % SIDES_CW.length])));
  const distinct = [...new Map(pairs.map(pair => [String(pair), pair])).values()];
  return new NFA(
    NFA.encodeSpec(countSpec(distinct), 6), 'BorderLots',
    cell, ...LINES[line].flatMap(c => [nsCode.at(c), ewCode.at(c)]));
});

return [
  new Shape('6x6'),
  new NoBoxes(),
  new ChaosConstruction(),
  nsCode.toVar('N/S border code'),
  ewCode.toVar('E/W border code'),
  ...LINE_CELLS.flatMap(cell => [
    new Given(nsCode.at(cell), 1, 2, 3, 4),
    new Given(ewCode.at(cell), 1, 2, 3, 4),
  ]),
  ...borderCodes,
  ...borderLots,
];
