// Title: Twice or Half
// Author: Dali
// Video: https://www.youtube.com/watch?v=dh-wkVoVKK0
// Source: https://app.crackingthecryptic.com/sudoku/f9Dbmgj3MJ

// Rules encoded here:
//  - Normal sudoku, over the ten-symbol alphabet 0-9: every row, column and
//    box holds nine distinct symbols out of the ten.
//  - Exactly one 0 exists in the grid and is given (R8C8); it replaces the
//    same value in its row, its column and its box.
//  - Digits along the arrow sum to the value in its circle.
//  - A set of consecutive digits in any order appears on the purple line.
//  - Eight blue circles. The circle in row r marks the last digit of an
//    N-digit number read left to right along row r, where N is the value of
//    R_r C1.  (r2c1 = 5 puts a 5-digit number in r2c4..r2c8.)
//  - Every one of those eight numbers is twice, or half, another of them.

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

// Blue circle underlays: [grid row, column of the number's last digit].
const CIRCLES = [[1, 8], [2, 8], [3, 5], [4, 9], [5, 9], [6, 8], [7, 6], [8, 9]];

// Nine-digit, right-aligned, zero-padded copy of each special number: place t
// carries weight 10^(9-t), so column 9 is the units digit.  Padding with 0 is
// what makes numbers of different lengths comparable by a fixed alignment.
const numbers = new Var('N', 'special numbers', '8x9');
const pad = (i, t) => numbers.cell(i, t);

// The digit the given 0 stands in for.
const replaced = new Var('M', 'value replaced by the zero', 1);

const zeroCell = 'R8C8';

// Exactly one 0 in the grid, at the given cell: every other cell is 1-9.
const noOtherZero = graph.makeReplicate(
  new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9),
  graph.cells().filter(c => c !== zeroCell));

// The 0's row, column and box each hold nine of the ten symbols; the symbol
// each of them is missing is the same one.  Adding that symbol's cell to a
// nine-cell unit and asking for ten distinct values says exactly that.
const replacement = [
  new Given(replaced.cell(), 1, 2, 3, 4, 5, 6, 7, 8, 9),
  new AllDifferent(replaced.cell(), ...graph.row(8)),
  new AllDifferent(replaced.cell(), ...graph.column(8)),
  new AllDifferent(replaced.cell(), ...graph.box(9)),
];

// Purple line R2C1-R6C1; arrow bulb R5C8 with arm R5C9-R6C8-R6C7.
const drawnClues = [
  new Renban('R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1'),
  new Arrow('R5C8', 'R5C9', 'R6C8', 'R6C7'),
];

// Tie each padded number to the row it is read from.  The length N is not
// known in advance, so disjoin over the values R_r C1 can take: N cannot
// exceed the circle's column, or the number would start left of the grid.
const numberLayout = CIRCLES.map(([row, col], idx) => {
  const i = idx + 1;
  const branches = [];
  for (let n = 1; n <= col; n++) {
    const parts = [new Given(makeCellId(row, 1), n)];
    for (let t = 1; t <= 9; t++) {
      // Place t holds the digit (9 - t) columns left of the circle while that
      // place is inside the N-digit window, and a padding 0 outside it.
      parts.push(9 - t < n
        ? new SameValues(2, pad(i, t), makeCellId(row, col - (9 - t)))
        : new Given(pad(i, t), 0));
    }
    branches.push(new And(parts));
  }
  return new Or(branches);
});

// value(a) = 2 * value(b) for two nine-digit padded numbers, checked place by
// place from the units end: the cells are interleaved a9, b9, a8, b8, ...
// The state holds the 'a' digit just read and the carry out of the place
// below; a place is consistent when 2*b + carry ends in that 'a' digit.
const doubleSpec = NFA.encodeSpec({
  startState: { a: null, carry: 0 },
  transition: ({ a, carry }, value) => {
    if (a === null) return { a: value, carry };
    const doubled = 2 * value + carry;
    if (doubled % 10 !== a) return undefined;
    return { a: null, carry: doubled >= 10 ? 1 : 0 };
  },
  // No carry may leave the top place: a ninth-place overflow is not a value
  // any of these numbers can hold.
  accept: ({ a, carry }) => a === null && carry === 0,
}, shape);

const twice = (i, j) => {
  const cells = [];
  for (let t = 9; t >= 1; t--) cells.push(pad(i, t), pad(j, t));
  return new NFA(doubleSpec, `n${i}_is_2x_n${j}`, ...cells);
};

const twiceOrHalf = CIRCLES.map((_, idx) => {
  const i = idx + 1;
  const branches = [];
  for (let j = 1; j <= CIRCLES.length; j++) {
    if (j === i) continue;
    branches.push(twice(i, j), twice(j, i));
  }
  return new Or(branches);
});

return [
  shape,
  numbers,
  replaced,
  new Given('R3C4', 1),
  new Given(zeroCell, 0),
  noOtherZero,
  ...replacement,
  ...drawnClues,
  ...numberLayout,
  ...twiceOrHalf,
];
