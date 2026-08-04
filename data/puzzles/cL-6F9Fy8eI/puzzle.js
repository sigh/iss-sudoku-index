// Title: x^y
// Author: Edric Haleen
// Video: https://www.youtube.com/watch?v=cL-6F9Fy8eI
// Source: https://app.crackingthecryptic.com/sudoku/HDGL4TtHhf

// Normal sudoku rules apply: default 9x9 Shape gives the row/column/box
// all-different groups (the drawn regions are the standard 3x3 boxes).
//
// "Cages can include repeat digits" -- every cage below is `Sum` (total
// only), never `Cage` (which also forces the cage's cells distinct).
//
// "Each cage sums to a number that can be expressed as x-to-the-power-of-y,
// where x and y are positive integers and y is not 1" -- i.e. the total is a
// perfect power: 1, 4, 8, 9, 16, 25, 27, 32, 36, ... . `perfectPowersInRange`
// below implements that definition directly. For each cage the candidate
// totals are the perfect powers inside the cage's achievable sum range; that
// range is derived from the cage's cell count and whether its cells are
// already forced mutually distinct by a shared row/column/box (checkable
// against the cage cell lists below), never from the solution.
//
// "Similar-sized cages must sum to different amounts" -- cage sizes 1, 2, 3
// and 4 each have more than one instance and need this; sizes 5, 6, 7, 8, 14
// and 79 are each unique in size, so the rule is vacuous for them.
//
// "The red line encloses a 79-cell cage" -- the drawn red outline traces
// cell borders (not a stroke through cell centres), enclosing every grid
// cell except R1C1 and R9C9 (two notches cut out of its top-left and
// bottom-right corners) -- 81 - 2 = 79 cells, matching the rules sentence.
// It is scored like any other cage below.

function perfectPowersInRange(lo, hi) {
  const result = new Set();
  // x = 1 is special: 1^y = 1 for every y, so the loop below (which relies on
  // v growing past hi to terminate) would never end for x = 1.
  if (1 >= lo && 1 <= hi) result.add(1);
  for (let x = 2; x * x <= hi; x++) {
    for (let y = 2, v = x * x; v <= hi; y++, v = x ** y) {
      if (v >= lo) result.add(v);
    }
  }
  return [...result].sort((a, b) => a - b);
}

// Achievable sum range for `count` cells that are pairwise forced distinct
// (by shared row/column/box) with digits 1-9: the count smallest vs count
// largest distinct digits.
const minDistinctSum = count => count * (count + 1) / 2;
const maxDistinctSum = count => count * 9 - count * (count - 1) / 2;

// Builds the Var-index machinery that lets `cages` (a list of cell arrays,
// all the same size) take pairwise-different totals from `candidates`: one
// index Var per cage records which candidate it used, an AllDifferent over
// the index Vars forces the choices apart, and each Or arm pins a cage's
// Sum together with its index so the two stay in lockstep.
function distinctCageSums(prefix, label, cages, candidates) {
  const idx = new Var(prefix, label, cages.length);
  return [
    idx,
    new AllDifferent(...idx.cells()),
    ...cages.map((cells, i) => new Or(
      candidates.map((total, j) => new And([
        new Sum(total, ...cells),
        new Given(idx.cell(i + 1), j + 1),
      ]))
    )),
  ];
}

const givens = [
  new Given('R4C5', 2), new Given('R4C6', 3), new Given('R4C7', 5),
  new Given('R5C4', 8), new Given('R5C5', 9), new Given('R5C6', 4),
  new Given('R6C4', 7), new Given('R6C5', 6),
  new Given('R7C7', 1),
];

// Cage cell lists below are transcribed from the drawn cage outlines; each
// is a real no-total cage per the rules above, not a killer cage.

// Size-1 cages. All four lie in box (R1-3,C1-3), which already forces them
// pairwise distinct; since there are exactly as many size-1 cages as
// perfect-power candidates in a single digit's range, restricting each to
// that candidate set plus the box's own all-different forces "similar-sized
// cages differ" automatically -- no extra machinery needed for this size.
const pow1to9 = perfectPowersInRange(1, 9); // [1, 4, 8, 9]
const size1Cages = [
  new Given('R1C1', ...pow1to9),
  new Given('R1C3', ...pow1to9),
  new Given('R3C1', ...pow1to9),
  new Given('R3C3', ...pow1to9),
];

// Size-2 cages: each pair lies in box (R1-3,C4-6), so both cells of a cage
// are forced distinct by the box.
const cage12 = ['R1C4', 'R1C5'];
const cage13 = ['R1C6', 'R2C6'];
const cage14 = ['R2C4', 'R3C4'];
const cage15 = ['R3C5', 'R3C6'];
const pow3to17 = perfectPowersInRange(minDistinctSum(2), maxDistinctSum(2)); // [4, 8, 9, 16]
const size2Cages = distinctCageSums(
  'VB', 'size-2 cage sum index', [cage12, cage13, cage14, cage15], pow3to17);

// Size-3 cages: each triple lies in box (R1-3,C7-9).
const cage10 = ['R2C7', 'R1C7', 'R1C8'];
const cage11 = ['R2C8', 'R3C8', 'R3C9'];
const pow6to24 = perfectPowersInRange(minDistinctSum(3), maxDistinctSum(3)); // [8, 9, 16]
const size3Cages = distinctCageSums('VC', 'size-3 cage sum index', [cage10, cage11], pow6to24);

// Size-4 cages: each quad lies in box (R4-6,C7-9).
const cage8 = ['R5C7', 'R6C7', 'R6C8', 'R6C9'];
const cage9 = ['R4C7', 'R4C8', 'R4C9', 'R5C9'];
const pow10to30 = perfectPowersInRange(minDistinctSum(4), maxDistinctSum(4)); // [16, 25, 27]
const size4Cages = distinctCageSums('VD', 'size-4 cage sum index', [cage8, cage9], pow10to30);

// Size-5 cage, unique in size: box (R7-9,C7-9) forces its 5 cells distinct.
const cage7 = ['R8C7', 'R7C8', 'R8C8', 'R9C8', 'R8C9'];
const pow15to35 = perfectPowersInRange(minDistinctSum(5), maxDistinctSum(5)); // [16, 25, 27, 32]

// Size-6 cage, unique in size: box (R7-9,C4-6) forces its 6 cells distinct.
const cage6 = ['R7C5', 'R8C4', 'R9C4', 'R8C5', 'R8C6', 'R9C6'];
const pow21to39 = perfectPowersInRange(minDistinctSum(6), maxDistinctSum(6)); // [25, 27, 32, 36]

// Size-7 cage, unique in size: box (R7-9,C1-3) forces its 7 cells distinct.
const cage5 = ['R7C2', 'R8C2', 'R9C2', 'R8C1', 'R8C3', 'R9C3', 'R9C1'];
const pow28to42 = perfectPowersInRange(minDistinctSum(7), maxDistinctSum(7)); // [32, 36]

// Size-8 cage, unique in size: box (R4-6,C1-3) forces its 8 cells distinct,
// and the achievable range [36, 44] contains exactly one perfect power, so
// the total is forced to 36 -- arithmetic, not fitting to the answer.
const cage4 = ['R4C1', 'R4C2', 'R5C2', 'R5C3', 'R6C3', 'R6C2', 'R6C1', 'R5C1'];
const pow36to44 = perfectPowersInRange(minDistinctSum(8), maxDistinctSum(8)); // [36]

// Size-14 cage, unique in size. Its 14 cells are box (R4-6,C4-6) in full
// (9 cells, forced distinct, fixed sum 45) plus 5 more cells from
// neighbouring boxes (R4C3, R7C3, R7C4, R7C6, R7C7) that are not all
// mutually forced distinct, so each of those 5 only contributes its own 1-9
// range: achievable total range is 45 + [5, 45] = [50, 90].
const cage16 = [
  'R4C3', 'R4C4', 'R5C4', 'R6C4', 'R7C3', 'R7C4', 'R6C5', 'R6C6',
  'R7C6', 'R7C7', 'R4C6', 'R4C5', 'R5C5', 'R5C6',
];
const pow50to90 = perfectPowersInRange(50, 90); // [64, 81]

// Size-79 cage: the red-line region, i.e. every grid cell except R1C1 and
// R9C9 (see the header comment). Every row always sums to 45 (each digit
// 1-9 once), so the whole grid always sums to 9*45 = 405 regardless of any
// cage rule, and this cage's total is always 405 - R1C1 - R9C9. R1C1 is
// restricted above to {1, 4, 8, 9} (its own size-1 cage rule); R9C9 carries
// no cage of its own, so it is only bounded to 1-9. That puts this cage's
// achievable range at 405 - 9 - 9 = 387 to 405 - 1 - 1 = 403, which contains
// exactly one perfect power -- forced arithmetic, not fitting to the answer.
const allCells = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) allCells.push(makeCellId(r, c));
}
const cage79 = allCells.filter(cell => cell !== 'R1C1' && cell !== 'R9C9');
const pow387to403 = perfectPowersInRange(387, 403); // [400]

return [
  new Shape('9x9'),
  ...givens,
  ...size1Cages,
  ...size2Cages,
  ...size3Cages,
  ...size4Cages,
  new Or(pow15to35.map(total => new Sum(total, ...cage7))),
  new Or(pow21to39.map(total => new Sum(total, ...cage6))),
  new Or(pow28to42.map(total => new Sum(total, ...cage5))),
  new Sum(pow36to44[0], ...cage4),
  new Or(pow50to90.map(total => new Sum(total, ...cage16))),
  new Sum(pow387to403[0], ...cage79),
];
