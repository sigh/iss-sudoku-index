// Title: Still No Cage Totals!
// Author: Mr Menace
// Video: https://www.youtube.com/watch?v=qj1Bo_8F66M
// Source: https://app.crackingthecryptic.com/sudoku/JMF2qDtbDG

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

// k=5: range [15,35]; only T=23 (digits 2,3) and T=32 (digits 3,2). T=23 is
// odd -> oddCount=3; T=32 is even -> oddCount=2.
const SIZE5_BRANCHES = [[23, 3], [32, 2]];

// k=7: range [28,42]; only T=34 (digits 3,4) has digit sum 7. T=34 is even
// -> oddCount=4.
const SIZE7_BRANCHES = [[34, 4]];

// k=9: with no repeats and only 9 possible digits, a 9-cell cage must be a
// permutation of 1-9, so T=45 (digits 4,5) and oddCount=5 always hold --
// automatically true, so this cage needs no extra branch beyond AllDifferent.

// "Exactly `target` of these cells hold an odd digit": running count of odd
// values seen, clamped at target+1 once the branch can only fail. Verified
// on a scratch accept/reject fixture (7 Raw cells, oddCount NFA target=4):
// accepted 4-odd/3-even and rejected 3-odd, 5-odd, and 0-odd assignments.
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
  ['R4C8', 'R5C8'],
  ['R6C8', 'R6C7'],
  ['R6C4', 'R6C3'],
  ['R8C4', 'R9C4'],
  ['R5C1', 'R5C2'],
];
const size3Cages = [
  ['R1C1', 'R1C2', 'R2C2'],
  ['R2C1', 'R3C1', 'R3C2'],
  ['R2C4', 'R3C4', 'R2C5'],
  ['R2C7', 'R2C8', 'R3C8'],
  ['R8C8', 'R8C9', 'R9C9'],
  ['R8C7', 'R9C7', 'R9C8'],
];
const size5Cages = [
  ['R7C2', 'R8C2', 'R9C2', 'R8C1', 'R8C3'],
];
const size7Cages = [
  ['R1C3', 'R2C3', 'R3C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R7C8', 'R7C7'],
];
const size9Cages = [
  ['R7C6', 'R6C6', 'R6C5', 'R5C6', 'R4C6', 'R4C5', 'R4C4', 'R5C4', 'R4C3'],
];

const cages = [
  ...size2Cages.map(cells => hiddenTotalCage(cells, SIZE2_BRANCHES)),
  ...size3Cages.map(cells => hiddenTotalCage(cells, SIZE3_BRANCHES)),
  ...size5Cages.map(cells => hiddenTotalCage(cells, SIZE5_BRANCHES)),
  ...size7Cages.map(cells => hiddenTotalCage(cells, SIZE7_BRANCHES)),
  ...size9Cages.map(cells => hiddenTotalCage(cells, null)),
].flat();

// Grey markers, transcribed from the drawn underlays: one rounded (circle,
// odd) and ten square (even).
const oddCircleCell = 'R2C8';
const evenSquareCells = [
  'R1C4', 'R1C8', 'R2C9', 'R5C3', 'R5C5',
  'R6C4', 'R6C9', 'R7C3', 'R7C5', 'R9C1',
];

return [
  new Shape('9x9'),
  new Given(oddCircleCell, 1, 3, 5, 7, 9),
  ...evenSquareCells.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...cages,
];
