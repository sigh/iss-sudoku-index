// Title: Another Brick in the Wall
// Author: Arabus
// Video: https://www.youtube.com/watch?v=mxy-Ew8rCbE
// Source: https://tinyurl.com/j5r99mvm

// Rules encoded:
// - Normal Sudoku rules (rows, columns, 3x3 boxes).
// - Normal Kropki Dot rules: a white dot means consecutive digits (WhiteDot),
//   a black dot means a 1:2 ratio (BlackDot). "Not all Kropki Dots ... are
//   given" means absence carries no information, so no StrictKropki.
// - Normal XV rules: X means the pair sums to 10, V means it sums to 5.
//   "Not all ... XV's are given" likewise rules out StrictXV.
// - Normal Killer-Cage rules for the one totalled cage: distinct cells
//   summing to 11 (Cage).
// - "Each Brick (or Cage) must contain 1 Odd and 1 Even Digit": every entry
//   in the payload's `cage` array is a Brick, and so is the totalled killer
//   cage. Each Brick's two cells must differ in parity -- encoded per pair
//   with a custom Pair predicate. Differing parity already makes the two
//   digits different, and every Brick pair here shares a row or column, so no
//   separate AllDifferent is needed for the (otherwise total-less) Bricks.
// - "Singular Cell Bricks at the edge of the Grid form a Brick with the cell
//   on the other side of the grid": the payload has 6 single-cell `cage`
//   entries, all on rows 2, 4 and 6, exactly one at column 1 and one at
//   column 9 per row. Pairing each with the cell "on the other side" of its
//   own row (R2C1/R2C9, R4C1/R4C9, R6C1/R6C9) is the only reading that pairs
//   every single-cell Brick with another single-cell Brick; no other edge
//   cell (reflected or point-symmetric) is itself a single-cell Brick, so
//   this pairing is unambiguous.

const oddEvenKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);

// Two-cell Bricks with no printed total, transcribed from the payload's
// `cage` array (each entry there with 2 cells).
const dominoBricks = [
  ['R1C1', 'R1C2'], ['R1C3', 'R1C4'], ['R1C6', 'R1C7'], ['R1C8', 'R1C9'],
  ['R2C2', 'R2C3'], ['R2C4', 'R2C5'], ['R2C6', 'R3C6'], ['R2C7', 'R2C8'],
  ['R3C8', 'R3C9'], ['R3C3', 'R3C4'], ['R3C1', 'R3C2'], ['R3C5', 'R4C5'],
  ['R4C2', 'R4C3'], ['R4C7', 'R4C8'], ['R4C4', 'R5C4'], ['R5C1', 'R5C2'],
  ['R5C5', 'R5C6'], ['R5C8', 'R5C9'], ['R5C7', 'R6C7'], ['R6C5', 'R6C6'],
  ['R6C2', 'R7C2'], ['R7C1', 'R8C1'], ['R8C2', 'R8C3'], ['R9C1', 'R9C2'],
  ['R9C3', 'R9C4'], ['R7C6', 'R7C7'], ['R7C8', 'R7C9'], ['R9C5', 'R9C6'],
  ['R9C8', 'R9C9'], ['R8C7', 'R8C8'], ['R8C5', 'R8C6'], ['R7C4', 'R7C5'],
];

// Virtual Bricks formed by the wrap-around rule above, from the payload's 6
// single-cell `cage` entries (R2C9, R2C1, R4C1, R4C9, R6C9, R6C1).
const wrapBricks = [
  ['R2C1', 'R2C9'], ['R4C1', 'R4C9'], ['R6C1', 'R6C9'],
];

// The totalled killer cage (from `killercage`) is also a Brick.
const killerBrick = ['R6C3', 'R6C4'];

const oddEvenBricks = [...dominoBricks, ...wrapBricks, [...killerBrick]]
  .map(([a, b]) => new Pair(oddEvenKey, 'brick odd/even', a, b));

const killerCage = new Cage(11, ...killerBrick);

// White dots (difference), from the payload's `difference` array.
const whiteDots = [
  ['R7C1', 'R8C1'], ['R1C8', 'R2C8'],
].map(([a, b]) => new WhiteDot(a, b));

// Black dots (ratio), from the payload's `ratio` array.
const blackDots = [
  ['R1C1', 'R2C1'], ['R2C1', 'R3C1'], ['R5C3', 'R5C4'], ['R5C8', 'R5C9'],
  ['R2C4', 'R3C4'], ['R4C9', 'R5C9'], ['R8C9', 'R8C8'], ['R5C5', 'R4C5'],
].map(([a, b]) => new BlackDot(a, b));

// XV clues, from the payload's `xv` array.
const xvClues = [
  new X('R5C8', 'R5C7'),
  new V('R2C7', 'R3C7'),
];

return [
  new Shape('9x9'),
  killerCage,
  ...whiteDots,
  ...blackDots,
  ...xvClues,
  ...oddEvenBricks,
];
