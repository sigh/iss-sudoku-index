// Title: Some Kind of Chaos
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=EOHWXndyeco
// Source: https://sudokupad.app/fg8p36r2g0

// Rules encoded here:
//   SOMEDOKU        row N and column N each hold exactly N distinct digits;
//                   repeats fill the rest.
//   CHAOS           9 regions of 9 orthogonally connected cells, region pattern
//                   symmetric under 180 degree rotation.
//   CIRCLES         a circled cell's digit is the number of distinct digits in
//                   its own region; no two circles hold the same digit.
//   REGION SUM      region borders cut each blue line into segments of equal
//                   sum; every line crosses at least one border.
// Nothing is omitted.
//
// Rows and columns hold repeated digits, so the answer cannot live on an ISS
// main grid, whose rows and columns are always all-different. Every playable
// cell is therefore a Var:
//   VD  the 9x9 answer grid          VR  the region label of each cell
//   VN  the constants 1..9           VE..VM  per-region views used by CIRCLES
// The layers carry their own 9x9 layout, so the main grid holds no part of the
// puzzle: it is a single pinned cell that exists only to declare the 1-9 value
// range the layers draw from.

const CIRCLES = [
  'R2C4', 'R3C2', 'R3C3', 'R3C5', 'R5C5', 'R6C7', 'R8C3', 'R9C5', 'R9C9',
];

// Cell paths of the 15 skyblue strokes, in drawn order.
const LINES = [
  ['R8C1', 'R9C1', 'R9C2', 'R8C2'],
  ['R4C3', 'R4C2', 'R4C1', 'R5C1'],
  ['R3C1', 'R3C2', 'R2C2', 'R2C1', 'R1C1'],
  ['R4C8', 'R4C9'],
  ['R6C8', 'R7C8'],
  ['R5C2', 'R5C3'],
  ['R1C6', 'R1C5', 'R1C4', 'R1C3', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C6', 'R6C5'],
  ['R6C1', 'R6C2', 'R7C2', 'R7C1'],
  ['R6C1', 'R7C1'],
  ['R8C5', 'R7C5', 'R7C6', 'R8C6', 'R8C7', 'R7C7'],
  ['R8C7', 'R8C8', 'R7C9'],
  ['R5C4', 'R6C4', 'R6C3', 'R7C3', 'R7C4'],
  ['R4C7', 'R5C7', 'R5C8', 'R5C9'],
  ['R9C6', 'R9C7', 'R9C8'],
  ['R2C6', 'R2C7', 'R3C7'],
];

const grid = cellGraph('9x9');
const digits = grid.makeOverlay('VD');
const regions = grid.makeOverlay('VR');
// One extra 81-cell layer per region, used by the CIRCLES rule below.
const views = 'EFGHIJKLM'.split('').map(letter => grid.makeOverlay('V' + letter));
const LABELS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// The one main-grid cell holds nothing; pin it so it adds no search.
const filler = [new Given('R1C1', 1)];

// SOMEDOKU. VN holds the constants 1..9, used as CountDistinct controls.
const counts = new Var('N', 'Counts 1-9', 9);
const constants = LABELS.map(n => new Given(counts.cell(n), n));
const someduku = LABELS.flatMap(n => [
  new CountDistinct(counts.cell(n), ...digits.at(grid.row(n))),
  new CountDistinct(counts.cell(n), ...digits.at(grid.column(n))),
]);

// CHAOS CONSTRUCTION: nine cells per label, each label one connected blob.
const nineOfEach = LABELS.flatMap(n => Array(9).fill(n)).join('_');
const chaos = [
  new ContainExact(nineOfEach, ...regions.cells()),
  ...LABELS.map(n => new ConnectedValues('VR', n)),
];

// Which region carries which label is free, and letting the solver choose costs
// a factor of 9!. Two circles in one region would report the same distinct count
// and so hold the same digit, which the rules forbid; the nine circles therefore
// lie in nine different regions, and naming them 1..9 in drawn order is a
// labelling convention rather than a further constraint.
const labelling = CIRCLES.map((cell, i) => new Given(regions.at(cell), i + 1));

// 180 degree symmetry. Each region is a single connected label class, so the
// region pattern is exactly the set of grid edges whose two cells share a label.
// The pattern is rotation-symmetric iff that edge set is: for every edge (a, b),
// a and b share a label iff their rotations do.
const rotate = (cell) => {
  const { row, col } = parseCellId(cell);
  return makeCellId(10 - row, 10 - col);
};
// Reads four labels a, b, ra, rb and accepts when (a == b) == (ra == rb).
const rotSymNFA = NFA.encodeSpec({
  startState: { a: null, eq: null, ra: null },
  transition(state, value) {
    if (state.eq === null && state.a === null) return { a: value, eq: null, ra: null };
    if (state.eq === null) return { a: null, eq: state.a === value, ra: null };
    if (state.ra === null) return { a: null, eq: state.eq, ra: value };
    return { a: null, eq: state.eq === (state.ra === value), ra: 'done' };
  },
  accept: (state) => state.ra === 'done' && state.eq === true,
}, 9);
const rotationSymmetry = [];
const coveredEdges = new Set();
for (const a of grid.cells()) {
  for (const b of grid.neighbours(a)) {
    if (a >= b) continue;
    const [ra, rb] = [rotate(a), rotate(b)];
    const edge = `${a}|${b}`;
    const rotated = ra < rb ? `${ra}|${rb}` : `${rb}|${ra}`;
    if (coveredEdges.has(edge) || coveredEdges.has(rotated)) continue;
    coveredEdges.add(edge);
    rotationSymmetry.push(
      new NFA(rotSymNFA, 'RotSym', ...regions.at([a, b, ra, rb])));
  }
}

// CIRCLES. views[j] is region j's digits seen against the rest of the grid: a
// cell of region j shows its own digit, every other cell shows the digit of
// region j's circle. That circle digit is itself one of region j's digits, so
// the distinct values of the whole layer are exactly region j's distinct
// digits, and CountDistinct over the layer reports the circled digit.
const circleDigits = new AllDifferent(...digits.at(CIRCLES));
const views_link = LABELS.flatMap((label, j) => {
  const others = LABELS.filter(n => n !== label);
  const circleDigit = digits.at(CIRCLES[j]);
  return grid.cells().map(cell => new Or([
    new And([
      new Given(regions.at(cell), label),
      new SameValues(2, views[j].at(cell), digits.at(cell)),
    ]),
    new And([
      new Given(regions.at(cell), ...others),
      new SameValues(2, views[j].at(cell), circleDigit),
    ]),
  ]));
});
const circleCounts = LABELS.map((label, j) =>
  new CountDistinct(digits.at(CIRCLES[j]), ...views[j].cells()));

// REGION SUM LINES. Consecutive line cells are in one segment iff they share a
// region label, so a line of L cells has 2^(L-1) possible cuttings; the rule
// that every line crosses a border drops the uncut one. Each branch pins the
// label agreements it assumes and equates its segment sums.
const regionSumLines = LINES.map(cells => {
  const lineLabels = regions.at(cells);
  const lineDigits = digits.at(cells);
  const branches = [];
  for (let mask = 1; mask < (1 << (cells.length - 1)); mask++) {
    const borders = [];
    const segments = [[lineDigits[0]]];
    for (let i = 1; i < cells.length; i++) {
      const isBorder = (mask >> (i - 1)) & 1;
      borders.push(isBorder
        ? new AllDifferent(lineLabels[i - 1], lineLabels[i])
        : new SameValues(2, lineLabels[i - 1], lineLabels[i]));
      if (isBorder) segments.push([]);
      segments[segments.length - 1].push(lineDigits[i]);
    }
    branches.push(new And([...borders, new EqualSum(...segments)]));
  }
  return new Or(branches);
});

return [
  new Shape('1x1', 9),
  digits.toVar('Digits'),
  regions.toVar('Regions'),
  ...views.map((view, j) => view.toVar(`Region ${j + 1} view`)),
  counts,
  ...filler,
  ...constants,
  ...someduku,
  ...chaos,
  ...labelling,
  ...rotationSymmetry,
  circleDigits,
  ...views_link,
  ...circleCounts,
  ...regionSumLines,
];
