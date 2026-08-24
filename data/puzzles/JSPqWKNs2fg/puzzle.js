// Title: Strands
// Author: TotallyNormalCat
// Video: https://www.youtube.com/watch?v=JSPqWKNs2fg
// Source: https://app.crackingthecryptic.com/sudoku/mt7pgJhd9q

// Standard sudoku (rows, columns, boxes all 1-9; no givens). Five killer
// cages: normally digits sum to the corner total and do not repeat, but the
// rules state exactly one cage in the grid is "broken" -- its sum is wrong,
// or a digit repeats, or both. A per-cage flag Var (1 = valid, 2 = broken)
// selects which reading applies to each cage; ContainExact pins exactly one
// flag to "broken", and since flags are restricted to {1, 2} the remaining
// four automatically read "valid". Four of the five cages lie entirely
// within one row, so a repeat there is already impossible (row
// all-different) and "broken" can only mean the wrong sum. The fifth cage
// (R4C1/R3C1/R3C2) has one cell pair -- R4C1/R3C2 -- not already forced
// distinct by row, column or box, so its broken reading also allows that
// pair to repeat.
//
// Ten pink lines are "incomplete arrows": the digit on one end sums the
// other digits on the line, but the rules and art leave open which end, so
// each is encoded as the disjunction over both endpoints (Arrow with the
// bulb at the first cell of the drawn path, or at the last).

const cages = [
  { cells: ['R1C1', 'R1C2', 'R1C3'], sum: 24 },
  { cells: ['R2C4', 'R2C5', 'R2C6'], sum: 11 },
  { cells: ['R3C7', 'R3C8', 'R3C9'], sum: 23 },
  { cells: ['R4C5', 'R4C6', 'R4C7'], sum: 7 },
  // Cage cells in draw order R4C1,R3C1,R3C2; only R4C1/R3C2 is not already
  // forced distinct by row, column or box.
  { cells: ['R4C1', 'R3C1', 'R3C2'], sum: 20, repeatPair: ['R4C1', 'R3C2'] },
];

// "Wrong total": running sum clamped at target + 1. Digits are >= 1, so the
// sum only rises; once it passes the target it can never return to it, so
// clamping loses no information and the final state is != target for every
// total except the exact one.
function wrongSumNFA(target) {
  return NFA.encodeSpec({
    startState: 0,
    transition: (sum, value) => Math.min(sum + value, target + 1),
    accept: sum => sum !== target,
  }, 9);
}

const brokenFlags = new Var('B', 'broken cage flag', cages.length);

const cageConstraints = cages.flatMap((cage, i) => {
  const flag = brokenFlags.cell(i + 1);
  const validReading = new Cage(cage.sum, ...cage.cells);
  const brokenParts = [
    new NFA(wrongSumNFA(cage.sum), 'wrong sum', ...cage.cells),
  ];
  if (cage.repeatPair) {
    brokenParts.push(new SameValues(2, ...cage.repeatPair));
  }
  const brokenReading = brokenParts.length === 1
    ? brokenParts[0]
    : new Or(brokenParts);

  return [
    new Given(flag, 1, 2),
    new Or([
      new And([new Given(flag, 1), validReading]),
      new And([new Given(flag, 2), brokenReading]),
    ]),
  ];
});

const exactlyOneBroken = new ContainExact('2', ...brokenFlags.cells());

const lines = [
  ['R2C1', 'R3C2', 'R4C3'],
  ['R4C2', 'R5C3', 'R4C4'],
  ['R5C5', 'R5C6', 'R6C6'],
  ['R5C7', 'R6C7', 'R6C8'],
  ['R2C7', 'R3C8', 'R4C9'],
  ['R7C7', 'R8C7', 'R9C7'],
  ['R5C4', 'R6C5', 'R7C5'],
  ['R5C2', 'R6C3', 'R7C4', 'R8C5'],
  ['R6C1', 'R7C1', 'R8C1'],
  ['R9C2', 'R8C3', 'R8C4'],
];

const lineConstraints = lines.map(path => new Or([
  new Arrow(...path),
  new Arrow(...[...path].reverse()),
]));

return [
  new Shape('9x9'),
  brokenFlags,
  ...cageConstraints,
  exactlyOneBroken,
  ...lineConstraints,
];
