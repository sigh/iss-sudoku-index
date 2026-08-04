// Title: Adulthood
// Author: GarlicBredFries
// Video: https://www.youtube.com/watch?v=DnhcemqlOfQ
// Source: https://app.crackingthecryptic.com/sudoku/RDHLNm2JR9

// Normal sudoku rules apply.
//
// Fountains: "a set of the digits 1 to 9, one in each row, column, and box"
// are "Fountains of Youth" -- a set of nine cells holding every digit 1-9
// exactly once ("the digits 1 to 9"), one per row, one per column, one per
// box. Modelled as a parallel VF overlay per grid cell, restricted to {1, 2}
// (1 = not a fountain, 2 = a fountain): a row/column/box holding exactly one
// fountain sums to 8*1 + 1*2 = 10 (`fountainCounts`), and the digit-coverage
// half is `fountainDigits` below.
//
// Splash/value: a fountain splashes its up-to-eight king-move neighbours
// (orthogonal + diagonal), never itself; a splashed cell's "value" is its
// digit minus how many distinct fountains splash it. Each cage total is the
// sum of VALUES, not raw digits. For a cage with cells C and printed total T:
//   T = sum_{c in C} digit(c) - sum_{c in C} sum_{n in kingNeighbours(c)} (flag(n) - 1)
//     = sum_{c in C} digit(c) - sum_{(c,n) edges} flag(n) + edgeCount
// so `cageValueSum` below builds one Sum per cage as
//   Sum(T - edgeCount, ...C, ...edgeFlags (coefficient -1))
// with edgeFlags the (possibly-repeated) flag cell of every king-neighbour of
// every cage cell -- repeats add, matching a cell splashed by/into the cage
// more than once.
//
// Cages: the rules state only that a cage totals the summed values; nothing
// says cage digits are distinct, so cages are encoded as `Sum`, not `Cage`.

const grid = cellGraph('9x9');
const flags = grid.makeOverlay('VF');

const fountainCounts = flags.rowsColumnsBoxes()
  .map(group => new Sum(10, ...group));

// The nine fountains hold every digit 1-9 exactly once. An NFA reads
// [flag, digit] for every grid cell in a fixed order, carrying the set of
// digits already claimed by a fountain as a 9-bit mask; a repeat digit at a
// second fountain cell has no valid transition, and acceptance requires
// every bit of the mask set.
const fountainDigitsSpec = NFA.encodeSpec({
  startState: { mask: 0, expectDigit: false, isFountain: false },
  transition: ({ mask, expectDigit, isFountain }, value) => {
    if (!expectDigit) {
      // `value` is this cell's flag (1 = not a fountain, 2 = a fountain).
      return { mask, expectDigit: true, isFountain: value === 2 };
    }
    // `value` is this cell's digit.
    if (!isFountain) return { mask, expectDigit: false, isFountain: false };
    const bit = 1 << (value - 1);
    if (mask & bit) return undefined; // digit already claimed by a fountain
    return { mask: mask | bit, expectDigit: false, isFountain: false };
  },
  accept: ({ mask }) => mask === 0b111111111,
}, 9);
const fountainDigits = new NFA(
  fountainDigitsSpec, 'fountain digits distinct',
  grid.cells().flatMap(cell => [flags.at(cell), cell]),
);

function cageValueSum(cells, total) {
  const neighbours = cells.flatMap(c => grid.kingNeighbours(c));
  const edgeFlags = flags.at(neighbours);
  return new Sum(total - edgeFlags.length, ...cells, ...edgeFlags.map(f => [f, -1]));
}

// Cage cells and totals, transcribed from the payload's drawn cages,
// row-major within each cage.
const cages = [
  [['R1C1', 'R1C2', 'R2C1', 'R2C2'], 10],
  [['R3C1', 'R3C2'], 10],
  [['R1C3', 'R2C3'], 5],
  [['R1C7', 'R2C7'], 6],
  [['R1C8', 'R1C9', 'R2C8', 'R2C9'], 22],
  [['R3C8', 'R3C9'], 9],
  [['R4C4', 'R4C5', 'R4C6'], 18],
  [['R5C4'], 3],
  [['R5C5', 'R6C5'], 10],
  [['R5C6'], 5],
  [['R5C7', 'R5C8'], 10],
  [['R5C2', 'R5C3'], 13],
  [['R7C5', 'R8C5'], 9],
  [['R7C8', 'R7C9'], 12],
  [['R8C7', 'R9C7'], 12],
  [['R8C8', 'R8C9', 'R9C8', 'R9C9'], 17],
  [['R7C1', 'R7C2'], 10],
  [['R8C1', 'R8C2', 'R9C1', 'R9C2'], 17],
  [['R8C3', 'R9C3'], 11],
];

// Every flag cell's domain is {1, 2}; stamped once and replicated (a one-cell
// template, per the group-domain Replicate pattern) rather than 81 literal
// Givens.
const fountainDomain = flags.makeReplicate(new Given(flags.cells()[0], 1, 2));

return [
  new Shape('9x9'),
  flags.toVar('fountain flags'),
  fountainDomain,
  ...fountainCounts,
  fountainDigits,
  ...cages.map(([cells, total]) => cageValueSum(cells, total)),
];
