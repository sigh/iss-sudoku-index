// Title: Parity Balance
// Author: zegres
// Video: https://www.youtube.com/watch?v=IACPLGgPE-o
// Source: https://app.crackingthecryptic.com/sudoku/QbLHMd8htg

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes -- see the regions array below).
//
// Grey circle -> odd digit; grey square -> even digit (candidate
// restrictions, per the "no Odd/Even class" convention). Cells and shapes
// from the underlays list (rounded = circle, square = not rounded).
//
// Each of the 11 no-total cages: digits cannot repeat (AllDifferent), and
// the sum of the even digits placed in the cage equals the sum of the odd
// digits placed in it. There is no dedicated class for a value-parity-signed
// sum, so it is built as an NFA over each cage's cells: the state is the
// running total of (+value) for an even digit and (-value) for an odd digit;
// accept only when that signed running total is exactly 0 after all cells.
// The NFA processes cells in an arbitrary order (whatever order the cage's
// cell list is passed in) because addition is commutative, so no ordering
// claim is being made about the cage.

const oddCells = ['R1C3', 'R3C1', 'R3C7', 'R4C6', 'R6C4', 'R7C3', 'R9C9'];
const evenCells = ['R5C5', 'R6C6'];

const cages = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R3C1', 'R4C1'],
  ['R1C5', 'R2C4', 'R2C5', 'R3C5', 'R4C5'],
  ['R2C2', 'R2C3', 'R3C2'],
  ['R4C2', 'R5C1', 'R5C2', 'R5C3', 'R5C4'],
  ['R1C8', 'R1C9', 'R2C8'],
  ['R2C9', 'R3C9', 'R4C8', 'R4C9'],
  ['R6C6', 'R6C7', 'R6C8', 'R6C9', 'R7C6', 'R8C6', 'R9C6'],
  ['R7C7', 'R7C8', 'R7C9', 'R8C9'],
  ['R8C7', 'R9C7', 'R9C8', 'R9C9'],
  ['R8C4', 'R9C3', 'R9C4'],
  ['R8C1', 'R8C2', 'R9C1', 'R9C2'],
];

// maxDepth bounds state creation to the largest cage (7 cells); without it
// the running signed sum is unbounded and compilation never terminates.
const parityBalanceSpec = NFA.encodeSpec({
  startState: 0,
  transition: (sum, value) => sum + (value % 2 === 0 ? value : -value),
  accept: (sum) => sum === 0,
  maxDepth: 7,
}, 9);

const parityBalanceNFAs = cages.map(
  (cells, i) => new NFA(parityBalanceSpec, `PB${i}`, cells));

const cageAllDifferents = cages.map((cells) => new AllDifferent(...cells));

const oddGivens = oddCells.map((c) => new Given(c, 1, 3, 5, 7, 9));
const evenGivens = evenCells.map((c) => new Given(c, 2, 4, 6, 8));

return [
  new Shape('9x9'),
  ...oddGivens,
  ...evenGivens,
  ...cageAllDifferents,
  ...parityBalanceNFAs,
];
