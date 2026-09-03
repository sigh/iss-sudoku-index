// Title: Miracle of the Magic Squares
// Author: BobZeBuilder
// Video: https://www.youtube.com/watch?v=MVQA2-HKkQg
// Source: https://app.crackingthecryptic.com/mds9euoo1c

// Rules encoded below, in order:
//  1. Normal sudoku. The board is empty: no givens, no drawn clues.
//  2. The grid contains 5 identical magic squares. A magic square is a 3x3
//     area whose 3 rows, 3 columns and 2 diagonals all have the same sum; the
//     rules say "3x3 area", not "box", so a magic square may sit at any of the
//     49 places a 3x3 window fits, and the 5 positions are for the solver to
//     find. Exactly 5 of the 49 windows are magic, and all 5 carry the same
//     digit in each corresponding cell.
//  3. A 6th magic square, the Special Square, is made of the nine box centres
//     laid out in box order; it is the layout of the other five rotated 90
//     degrees counterclockwise.
//  4. On the negative diagonal R1C1..R9C9, the digit in RnCn may not be n-1, n
//     or n+1 -- except at exactly one cell of the nine, whose position is not
//     given.
// Nothing is omitted.

const shape = new Shape('9x9');
const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const idx3 = [1, 2, 3];

// The digit layout shared by the five magic squares. It is not any particular
// window, so it lives off the grid; L(r, c) is its cell in row r, column c.
const layout = new Var('L', 'shared magic square layout', '3x3');
const L = (r, c) => layout.cell(r, c);

// One flag per 3x3 window, addressed by the window's top-left cell R(r)C(c)
// for r, c in 1..7:  1 = this window is a magic square, 2 = it is not magic.
const magic = new Var('M', 'magic 3x3 windows', '7x7');
const M = (r, c) => magic.cell(r, c);

// Rule 2 -- the shared layout is a magic square.
const layoutRows = idx3.map(r => idx3.map(c => L(r, c)));
const layoutCols = idx3.map(c => idx3.map(r => L(r, c)));
const layoutDiagonals = [
  [L(1, 1), L(2, 2), L(3, 3)],
  [L(1, 3), L(2, 2), L(3, 1)],
];
const layoutIsMagic = new EqualSum(
  ...layoutRows, ...layoutCols, ...layoutDiagonals);

// Rule 2 -- a window is magic exactly when its flag is 1, and every magic
// window matches the shared layout cell for cell.
//
// The "not magic" half needs the negation of the magic-square condition. Every
// 3x3 magic square has common sum 3 * (its centre digit), so a window is magic
// exactly when each of its 8 lines sums to 3 * centre, and it is NOT magic when
// at least one line misses that -- the Or over the eight machines below.
//
// offCentreLine reads a line that avoids the centre, followed by the centre:
// (a, b, c, centre), and accepts iff a + b + c != 3 * centre.
// centreLine reads the two non-centre cells of a line through the centre,
// followed by the centre: (a, b, centre), accepting iff a + b != 2 * centre --
// the centre's own term cancels from both sides.
// State: n counts symbols read, sum accumulates the line cells; on the last
// symbol the comparison is made once and parked in `ok` for `accept`.
const offCentreLine = NFA.encodeSpec({
  startState: { n: 0, sum: 0 },
  transition: (state, value) => {
    if (state.n < 3) return { n: state.n + 1, sum: state.sum + value };
    if (state.n === 3) return { n: 4, ok: state.sum !== 3 * value };
    return undefined;
  },
  accept: (state) => state.n === 4 && state.ok,
}, shape);
const centreLine = NFA.encodeSpec({
  startState: { n: 0, sum: 0 },
  transition: (state, value) => {
    if (state.n < 2) return { n: state.n + 1, sum: state.sum + value };
    if (state.n === 2) return { n: 3, ok: state.sum !== 2 * value };
    return undefined;
  },
  accept: (state) => state.n === 3 && state.ok,
}, shape);

// The window whose top-left cell is R(r)C(c), as w[i][j] for i, j in 0..2.
const window3x3 = (r, c) => [0, 1, 2].map(
  i => [0, 1, 2].map(j => makeCellId(r + i, c + j)));

const notMagic = (r, c) => {
  const w = window3x3(r, c);
  const centre = w[1][1];
  return new Or([
    // The four lines that miss the centre: both outer rows, both outer columns.
    new NFA(offCentreLine, 'row1', [...w[0], centre]),
    new NFA(offCentreLine, 'row3', [...w[2], centre]),
    new NFA(offCentreLine, 'col1', [w[0][0], w[1][0], w[2][0], centre]),
    new NFA(offCentreLine, 'col3', [w[0][2], w[1][2], w[2][2], centre]),
    // The four lines through the centre.
    new NFA(centreLine, 'row2', [w[1][0], w[1][2], centre]),
    new NFA(centreLine, 'col2', [w[0][1], w[2][1], centre]),
    new NFA(centreLine, 'diag', [w[0][0], w[2][2], centre]),
    new NFA(centreLine, 'anti', [w[0][2], w[2][0], centre]),
  ]);
};

const matchesLayout = (r, c) => {
  const w = window3x3(r, c);
  return [0, 1, 2].flatMap(
    i => [0, 1, 2].map(
      j => new SameValues(2, w[i][j], L(i + 1, j + 1))));
};

const windowOrigins = [];
for (const r of [1, 2, 3, 4, 5, 6, 7]) {
  for (const c of [1, 2, 3, 4, 5, 6, 7]) windowOrigins.push([r, c]);
}

const magicWindows = windowOrigins.map(([r, c]) => new Or([
  new And([new Given(M(r, c), 1), ...matchesLayout(r, c)]),
  new And([new Given(M(r, c), 2), notMagic(r, c)]),
]));

// Rule 2 -- there are 5 of them. The flags carry no other values, so five 1s
// among the 49 leaves the other 44 windows non-magic.
const magicFlagDomain = windowOrigins.map(
  ([r, c]) => new Given(M(r, c), 1, 2));
const fiveMagicSquares = new ContainExact(
  '1_1_1_1_1', ...windowOrigins.map(([r, c]) => M(r, c)));

// Rule 3 -- the box centres, laid out in box order as S(r, c) = R(3r-1)C(3c-1),
// are the shared layout turned 90 degrees counterclockwise. That rotation sends
// layout cell (row j, column 4-i) to result cell (row i, column j), i.e. the
// layout's right-hand column becomes the result's top row, read downwards.
const specialSquare = idx3.flatMap(r => idx3.map(
  c => new SameValues(2, makeCellId(3 * r - 1, 3 * c - 1), L(c, 4 - r))));

// Rule 4 -- RnCn avoids n-1, n, n+1 at eight of the nine diagonal cells, and
// takes one of those three at the ninth. The disjunction runs over which cell
// is the naughty one.
const withinOne = (n) => digits.filter(v => Math.abs(v - n) <= 1);
const beyondOne = (n) => digits.filter(v => Math.abs(v - n) > 1);
const naughtyDiagonal = new Or(digits.map(naughty => new And(
  digits.map(n => new Given(
    makeCellId(n, n),
    ...(n === naughty ? withinOne(n) : beyondOne(n)))))));

return [
  shape,
  layout,
  magic,
  layoutIsMagic,
  ...magicFlagDomain,
  ...magicWindows,
  fiveMagicSquares,
  ...specialSquare,
  naughtyDiagonal,
];
