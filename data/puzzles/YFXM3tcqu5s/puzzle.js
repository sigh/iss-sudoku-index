// Title: Counting Cages
// Author: Plasmath
// Video: https://www.youtube.com/watch?v=YFXM3tcqu5s
// Source: https://sudokupad.app/ijlrol8kkd

// Rules:
//   Normal sudoku rules apply.
//   Digits do not repeat in cages. Each cage has a circled digit, indicating
//   how many cages have the same sum as that cage. For example, if a cage sums
//   to 12 and has a circled 5, there are exactly 5 cages in the puzzle which
//   sum to 12.
//
// The rules' worked example counts the cage itself among the cages summing to
// 12, so a circled digit counts its own cage. No cage carries a printed total
// and no circle carries a printed value: the 24 circles sit on ordinary grid
// cells, exactly one inside each cage, so a cage's "circled digit" is the digit
// solved into that cell. Nothing is omitted.

// Drawn cages, in source order.
const CAGES = [
  ['R3C3'],
  ['R3C7'],
  ['R7C7'],
  ['R1C8', 'R1C9', 'R2C8', 'R2C9', 'R3C8', 'R3C9'],
  ['R3C4', 'R3C5', 'R3C6', 'R4C6'],
  ['R5C2'],
  ['R8C5'],
  ['R5C6', 'R6C6'],
  ['R1C6', 'R1C7'],
  ['R1C1', 'R2C1'],
  ['R2C2', 'R3C2'],
  ['R8C1', 'R9C1'],
  ['R4C7', 'R4C8'],
  ['R5C4', 'R5C5'],
  ['R9C4', 'R9C5'],
  ['R9C2', 'R9C3'],
  ['R4C2', 'R4C3'],
  ['R5C7', 'R6C7'],
  ['R1C5', 'R2C5'],
  ['R6C4', 'R7C4'],
  ['R8C8', 'R8C9'],
  ['R5C9', 'R6C9', 'R7C9'],
  ['R7C2', 'R8C2', 'R8C3', 'R8C4'],
  ['R5C3', 'R6C3', 'R7C3'],
];

// Drawn circles, in source order: 24 circles, each on a cell of one cage.
const CIRCLES = [
  'R7C7', 'R3C7', 'R3C3', 'R5C2', 'R8C5', 'R9C1',
  'R9C2', 'R1C7', 'R2C2', 'R5C3', 'R4C8', 'R5C4',
  'R9C5', 'R3C5', 'R8C4', 'R7C9', 'R5C6', 'R2C1',
  'R5C7', 'R1C5', 'R4C2', 'R8C8', 'R6C4', 'R3C8',
];

// The circle to cage match is one-to-one, so each cage's clue is a single cell.
const circledCell = CAGES.map(cage => CIRCLES.find(cell => cage.includes(cell)));

// A cage sum here runs from 1 (a lone cell) to 39 (six distinct digits), past
// the 9 values one cell can hold, so each sum is carried in two Var cells as
// sum = 9 * (high - 1) + low. Holding low in 1-9 makes that split unique, so
// two cages sum alike exactly when both of their parts match.
const sumHigh = new Var('VH', 'cage sum, high part', CAGES.length);
const sumLow = new Var('VL', 'cage sum, low part', CAGES.length);

// One flag per unordered pair of cages, 2 when the two cages have equal sums
// and 1 when they do not. The counting rule reads these flags.
const pairs = CAGES.flatMap(
  (_, i) => CAGES.slice(i + 1).map((_, k) => [i, i + 1 + k]));
const sameSum = new Var('VS', 'equal-sum flag per cage pair', pairs.length);

// Reads [high_i, low_i, high_j, low_j, flag]. The state carries the first
// cage's two parts, then whether the second cage matched them; the last step
// admits the flag value that reports the match, and no other, so the machine
// fixes each flag rather than merely constraining it.
const sameSumSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 0: return { phase: 1, high: value };
      case 1: return { phase: 2, high: state.high, low: value };
      case 2: return { phase: 3, low: state.low, highEq: value === state.high };
      case 3: return { phase: 4, equal: state.highEq && value === state.low };
      case 4: return value === (state.equal ? 2 : 1) ? { phase: 5 } : undefined;
      default: return undefined;
    }
  },
  accept: state => state.phase === 5,
}, 9);

// The flags a cage takes part in: 23 per cage, one for every other cage.
const flagsOfCage = CAGES.map(
  (_, i) => pairs.flatMap(([a, b], k) => (a === i || b === i) ? [k] : []));

return [
  new Shape('9x9'),
  sumHigh,
  sumLow,
  sameSum,

  // Digits do not repeat in cages; no cage has a printed total.
  ...CAGES.map(cage => new Cage(0, ...cage)),

  ...CAGES.map((cage, i) => new Sum(
    -9, ...cage, [sumHigh.cell(i + 1), -9], [sumLow.cell(i + 1), -1])),

  ...pairs.map(([i, j], k) => new NFA(
    sameSumSpec, 'equal cage sums',
    sumHigh.cell(i + 1), sumLow.cell(i + 1),
    sumHigh.cell(j + 1), sumLow.cell(j + 1),
    sameSum.cell(k + 1))),

  // Circled digit = 1 (this cage) + the number of other cages with the same
  // sum = 1 + sum over the cage's 23 flags of (flag - 1), so the flags total
  // 22 more than the circled digit.
  ...CAGES.map((cage, i) => new Sum(
    flagsOfCage[i].length - 1,
    ...flagsOfCage[i].map(k => sameSum.cell(k + 1)),
    [circledCell[i], -1])),
];
