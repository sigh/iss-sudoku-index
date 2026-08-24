// Title: Where Are the Cage Totals?
// Author: Mr.Menace
// Video: https://www.youtube.com/watch?v=N1F_b8Pzlqk
// Source: https://app.crackingthecryptic.com/sudoku/LjJGnnhJ6R

// Rules: normal sudoku; a grey-circle cell holds an odd digit, a grey-square
// cell holds an even digit; digits in a cage don't repeat and sum to the
// cage's total; the total's own decimal digits state the cage's count of odd
// and count of even digits, in no particular order. No cage prints a total
// (the puzzle's premise) -- the total is still the real, unprinted sum T of
// the cage's cells, and its digits must equal {oddCount, evenCount} as an
// unordered pair, so digit1(T) + digit2(T) = oddCount + evenCount = the
// cage's own cell count k. For k distinct digits from 1-9, T is bounded by
// [minSum(k), maxSum(k)]; the two-digit totals in that range whose digit sum
// equals k are enumerated below by hand (checked in the worker's notes).
// Where a total's two digit-to-count pairings disagree on which is
// oddCount, only the pairing whose parity matches T's own parity is
// arithmetically possible (a sum of k digits has oddCount's parity), which
// resolves "no particular order" to one pairing per achievable total.

// k=2: range [3,17]; only T=11 has digit sum 2. Its digits are 1,1, so
// oddCount=1 unambiguously (no pairing choice).
const SIZE2_BRANCHES = [[11, 1]];

// k=3: range [6,24]; only T=12 (digits 1,2) and T=21 (digits 2,1) have digit
// sum 3. T=12 is even so oddCount must be even -> oddCount=2; T=21 is odd ->
// oddCount=1.
const SIZE3_BRANCHES = [[12, 2], [21, 1]];

// k=7: range [28,42]; only T=34 (digits 3,4) has digit sum 7. T=34 is even
// -> oddCount=4.
const SIZE7_BRANCHES = [[34, 4]];

// k=8: range [36,44]; only T=44 (digits 4,4) has digit sum 8. Its digits are
// 4,4, so oddCount=4 unambiguously (no pairing choice; also consistent with
// T=44 being even).
const SIZE8_BRANCHES = [[44, 4]];

// k=9: with no repeats and only 9 possible digits, a 9-cell cage must be a
// permutation of 1-9, so T=45 (digits 4,5) and oddCount=5 always hold --
// automatically true, so this cage needs no extra branch beyond AllDifferent.

// "Exactly `target` of these cells hold an odd digit": running count of odd
// values seen, clamped at target+1 once the branch can only fail. Verified
// on a scratch accept/reject fixture before use.
const oddCountSpecs = {};
function oddCountSpec(target) {
  if (!(target in oddCountSpecs)) {
    oddCountSpecs[target] = NFA.encodeSpec({
      startState: 0,
      transition: (count, value) => Math.min(count + (value % 2), target + 1),
      accept: (count) => count === target,
    }, 9);
  }
  return oddCountSpecs[target];
}

function totalParityBranch(cells, total, oddCount) {
  return new And([
    new Sum(total, ...cells),
    new NFA(oddCountSpec(oddCount), `${oddCount} odd of ${cells.length}`, ...cells),
  ]);
}

// One real cage: "digits may not repeat" (AllDifferent) plus the hidden
// total/parity self-consistency derived above. `branches` is omitted for
// the 9-cell cage, which needs no extra branch (see k=9 note).
function hiddenTotalCage(cells, branches) {
  if (!branches) return [new AllDifferent(...cells)];
  const parity = branches.length === 1
    ? totalParityBranch(cells, ...branches[0])
    : new Or(branches.map(([total, oddCount]) => totalParityBranch(cells, total, oddCount)));
  return [new AllDifferent(...cells), parity];
}

// Cage cell lists, transcribed from the drawn cage outlines (metadata stub
// entries carrying only the title/author/rules text are not cages).
const size2Cages = [
  ['R6C8', 'R7C8'],
  ['R8C8', 'R9C8'],
];
const size3Cages = [
  ['R3C6', 'R3C7', 'R4C7'],
  ['R6C3', 'R7C3', 'R7C4'],
  ['R7C6', 'R7C7', 'R6C7'],
  ['R5C2', 'R6C2', 'R6C1'],
  ['R4C2', 'R4C1', 'R5C1'],
  ['R3C4', 'R4C4', 'R4C3'],
];
const size7Cages = [
  ['R9C3', 'R9C4', 'R8C4', 'R8C5', 'R8C6', 'R9C6', 'R9C7'],
];
const size8Cages = [
  ['R1C5', 'R2C5', 'R2C4', 'R2C3', 'R2C2', 'R2C6', 'R2C7', 'R2C8'],
];
const size9Cages = [
  ['R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R5C4', 'R5C3', 'R5C6', 'R5C7'],
];

const cages = [
  ...size2Cages.map(cells => hiddenTotalCage(cells, SIZE2_BRANCHES)),
  ...size3Cages.map(cells => hiddenTotalCage(cells, SIZE3_BRANCHES)),
  ...size7Cages.map(cells => hiddenTotalCage(cells, SIZE7_BRANCHES)),
  ...size8Cages.map(cells => hiddenTotalCage(cells, SIZE8_BRANCHES)),
  ...size9Cages.map(cells => hiddenTotalCage(cells, null)),
].flat();

// Grey markers, transcribed from the drawn underlays: eight rounded
// (circle, odd) and nine square (even).
const oddCircleCells = [
  'R3C3', 'R3C7', 'R4C4', 'R4C6', 'R6C4', 'R6C6', 'R7C3', 'R7C7',
];
const evenSquareCells = [
  'R1C1', 'R1C9', 'R2C2', 'R2C5', 'R2C8', 'R8C2', 'R8C8', 'R9C1', 'R9C9',
];

return [
  new Shape('9x9'),
  ...oddCircleCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...evenSquareCells.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...cages,
];
