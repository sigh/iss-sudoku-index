// Title: Mystery Fives
// Author: Aris Martinian
// Video: https://www.youtube.com/watch?v=u3y-0N6sBug
// Source: https://app.crackingthecryptic.com/sudoku/Fbhjtgr8Mf

// Normal sudoku. Digits do not repeat within a killer cage (AllDifferent per
// cage, below). Every instance of the digit five lies inside a killer cage,
// so cells no cage covers cannot be five. Some fives are "mystery fives":
// inside a cage's total, a mystery five counts as ten instead of five. The
// count of mystery fives across the whole grid equals the digit in the
// centre cell R5C5.
//
// Mystery-five state: a parallel Var overlay (prefix VM) gives every grid
// cell a flag of 1 (ordinary) or 2 (mystery). A Pair ties each flag to its
// digit so a flag of 2 is only legal on a cell holding five. Each cage's
// total is expressed with a coefficient Sum so a mystery flag adds the extra
// five that turns a five into a ten (derivation in the comment above
// cageSums). A final Sum ties the grid-wide mystery count to R5C5.

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VM');
const flag = cell => flags.at(cell);

// Provenance: the two drawn pencil givens.
const GIVENS = [
  ['R2C6', 1],
  ['R3C1', 9],
];

// Provenance: the drawn killer cages ([total, ...cells]).
const CAGES = [
  [30, 'R1C1', 'R1C2', 'R2C2', 'R3C2', 'R3C1'],
  [15, 'R1C3', 'R1C4', 'R2C4', 'R2C3'],
  [15, 'R1C5', 'R1C6'],
  [10, 'R1C7', 'R2C7'],
  [15, 'R3C4', 'R3C3'],
  [19, 'R4C2', 'R4C1', 'R7C1', 'R5C1', 'R6C1'],
  [26, 'R7C3', 'R7C2', 'R8C2', 'R8C1'],
  [8, 'R9C1', 'R9C2'],
  [14, 'R8C3', 'R9C3'],
  [14, 'R9C4', 'R9C5'],
  [22, 'R6C2', 'R6C3', 'R5C3'],
  [8, 'R4C5', 'R5C5', 'R6C5'],
  [25, 'R6C7', 'R7C7', 'R7C6'],
  [15, 'R8C7', 'R8C6', 'R9C6', 'R9C7'],
  [15, 'R1C8', 'R1C9'],
  [24, 'R2C9', 'R2C8', 'R3C8', 'R3C7'],
  [28, 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R6C8'],
  [14, 'R4C8', 'R4C7', 'R5C7'],
  [23, 'R7C8', 'R7C9', 'R8C9'],
  [7, 'R9C8', 'R9C9'],
];

const cagedCells = new Set(CAGES.flatMap(([, ...cells]) => cells));
// Derived: every grid cell absent from every CAGES entry above.
const uncagedCells = graph.cells().filter(cell => !cagedCells.has(cell));

// Every mystery flag is 1 or 2, stamped once over the whole overlay.
const flagDomain = flags.makeReplicate(new Given(flags.cells()[0], 1, 2));

// A flag of 2 (mystery) is only legal when the paired digit is five.
const flagMatchesDigit = graph.cells().map(cell => new Pair(
  Pair.fnToKey((digit, f) => f === 1 || digit === 5, 9),
  'mystery flag requires a five', cell, flag(cell)));

// Cage totals. Let bit = flag - 1 (0 ordinary, 1 mystery); a cage's true
// total is sum(digit) + 5*sum(bit) = sum(digit) + 5*sum(flag) - 5*N for a
// cage of N cells. Rearranged to an ISS Sum: sum(digit) + 5*sum(flag) =
// total + 5*N, i.e. coefficient 1 on each digit cell and 5 on each flag cell.
const cageSums = CAGES.map(([total, ...cells]) => new Sum(
  total + 5 * cells.length,
  ...cells,
  ...cells.map(cell => [flag(cell), 5]),
));
const cageDistinct = CAGES.map(([, ...cells]) => new AllDifferent(...cells));

// The grid-wide mystery count is sum(flag - 1) over all 81 cells, i.e.
// sum(flag) - 81; tie it to the centre cell's digit.
const mysteryCount = new Sum(
  81, ...graph.cells().map(cell => flag(cell)), ['R5C5', -1]);

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, v]) => new Given(cell, v)),
  // Rule: every five is inside a killer cage -- cells no cage covers cannot
  // be five.
  ...uncagedCells.map(cell => new Given(cell, 1, 2, 3, 4, 6, 7, 8, 9)),
  flags.toVar('mystery five flags'),
  flagDomain,
  ...flagMatchesDigit,
  ...cageSums,
  ...cageDistinct,
  mysteryCount,
];
