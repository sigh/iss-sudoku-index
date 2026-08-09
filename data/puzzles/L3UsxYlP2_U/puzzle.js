// Title: Ramen
// Author: Nebuzaradan
// Video: https://www.youtube.com/watch?v=L3UsxYlP2_U
// Source: https://app.crackingthecryptic.com/k4y2ak2rim

// A house (row, column, or 2x3 region) contains a non-repeating prefix 1..N;
// zero is an empty cell. Purple lines are nonempty renbans after zeroes are
// ignored. Blue-line region segments are nonempty and have equal sums.
//
// Empty cells may repeat, so the grid is Raw: no implicit constraints.

const BLANK = 0;
const DIGITS = [0, 1, 2, 3, 4, 5, 6];
const shape = new Shape('6x6', '0-6', 'Raw');
const cell = (r, c) => makeCellId(r, c);
const grid = Array.from({ length: 6 }, (_, r) =>
  Array.from({ length: 6 }, (_, c) => cell(r + 1, c + 1)));
const rows = grid;
const cols = Array.from({ length: 6 }, (_, c) => grid.map(row => row[c]));
const boxes = Array.from({ length: 6 }, (_, box) => {
  const top = Math.floor(box / 2) * 2;
  const left = (box % 2) * 3;
  return grid.slice(top, top + 2).flatMap(row => row.slice(left, left + 3));
});

const gridDomain = grid.flat().map(id => new Given(id, ...DIGITS));

// The state is the set of nonzero digits seen. A repeated digit is rejected;
// acceptance requires that set to be 1..N for some N (or empty).
const housePrefix = NFA.encodeSpec({
  startState: 0,
  transition: (seen, value) => {
    if (value === BLANK) return seen;
    const bit = 1 << (value - 1);
    return seen & bit ? undefined : seen | bit;
  },
  accept: seen => seen === 0 || (seen & (seen + 1)) === 0,
}, shape);
const houses = [...rows, ...cols, ...boxes].map((unit, i) =>
  new NFA(housePrefix, `house-prefix-${i}`, ...unit));

// The state records the nonzero digits on a purple line. Its set must be a
// consecutive interval, and it cannot be empty.
const renbanSet = NFA.encodeSpec({
  startState: 0,
  transition: (seen, value) => {
    if (value === BLANK) return seen;
    const bit = 1 << (value - 1);
    return seen & bit ? undefined : seen | bit;
  },
  accept: seen => {
    if (seen === 0) return false;
    const normalized = seen / (seen & -seen);
    return (normalized & (normalized + 1)) === 0;
  },
}, shape);
const PURPLE = [
  [[5, 5], [6, 4], [6, 3], [6, 2], [5, 1]],
  [[3, 4], [4, 3], [5, 2]],
  [[2, 2], [3, 1], [4, 1]],
  [[2, 3], [3, 2], [4, 2]],
];
const renbans = PURPLE.map((line, i) =>
  new NFA(renbanSet, `renban-${i}`, ...line.map(([r, c]) => cell(r, c))));

// Each blue segment is a maximal consecutive run within one standard 2x3 box.
const BLUE_SEGMENTS = [
  [[[5, 6]], [[4, 6], [3, 6]], [[2, 6], [2, 5], [1, 6]]],
  [[[5, 4]], [[4, 5], [3, 5]], [[2, 4], [1, 4], [1, 5]]],
  [[[5, 2]], [[4, 1]]],
];
const nonempty = NFA.encodeSpec({
  startState: false,
  transition: (hasDigit, value) => hasDigit || value !== BLANK,
  accept: hasDigit => hasDigit,
}, shape);
const blue = BLUE_SEGMENTS.flatMap((segments, i) => {
  const mapped = segments.map(segment => segment.map(([r, c]) => cell(r, c)));
  return [
    new EqualSum(...mapped),
    ...mapped.map((segment, j) => new NFA(nonempty, `blue-${i}-segment-${j}`, ...segment)),
  ];
});

// The given digits in the drawn grid.
const GIVENS = [
  [1, 3, 2], [1, 4, 1], [1, 5, 3], [1, 6, 4],
  [2, 3, 1], [2, 6, 2],
  [3, 3, 3], [3, 4, 2], [3, 6, 1],
  [4, 1, 1], [4, 2, 2], [4, 4, 3], [4, 5, 4], [4, 6, 5],
  [5, 1, 3], [5, 2, 1], [5, 3, 5], [5, 4, 4], [5, 5, 2], [5, 6, 6],
  [6, 1, 2], [6, 3, 4], [6, 4, 5], [6, 5, 1], [6, 6, 3],
];

return [
  shape,
  ...gridDomain,
  ...houses,
  ...renbans,
  ...blue,
  ...GIVENS.map(([r, c, value]) => new Given(cell(r, c), value)),
];
