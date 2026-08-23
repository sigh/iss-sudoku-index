// Title: Squares And Circles
// Author: Burning Curtains
// Video: https://www.youtube.com/watch?v=2rQgtq8_v-E
// Source: https://app.crackingthecryptic.com/sudoku/JfjF889L8d

// Normal sudoku rules apply. Digits cannot repeat within a cage (the base
// Cage all-different, over each cell's real digit -- see below). The
// digits in each cage sum to a square number (0, 1, 4, 9, 16, 25, 36); no
// cage carries a printed total, so every cage's sum is a disjunction over
// the reachable squares. Cells separated by a white dot must contain
// consecutive digits.
//
// There are 9 "hidden zero" cells, one per row/column/box, whose real
// digits are all different (one of each 1-9 across the whole grid). A
// hidden-zero cell counts as 0 for cage sums and white-dot
// consecutiveness, but its base all-different (row/column/box/cage) still
// uses its real digit. "Hidden zeros may not repeat within a cage" then
// follows from the grid-wide all-different among the 9 hidden-zero digits
// and needs no separate constraint.
//
// The flag is modelled with a widened-range overlay VZ (0-9): VZ(cell) is
// 0 unless the cell is its row/column/box's hidden zero, in which case
// VZ(cell) equals the cell's real digit -- so VZ is never ambiguous (a
// real digit is never 0). A cell's "effective value" (0 if hidden zero,
// else the real digit) is then `digit - VZ(cell)`, expressed everywhere
// below as the coefficient pair [cell, 1], [VZ(cell), -1].

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const overlay = graph.makeOverlay('VZ');
const z = cell => overlay.at(cell);

// VZ(cell) in {0, digit}: not flagged (0) or flagged (equals the digit).
const isHiddenZeroFlag = Pair.fnToKey(
  (digit, flag) => flag === 0 || flag === digit, shape);
const flagLinks = graph.cells().map(
  cell => new Pair(isHiddenZeroFlag, 'hidden zero flag', cell, z(cell)));

// Exactly one hidden zero (VZ != 0) per row/column/box: fixing 8 of the 9
// house cells' VZ to literal 0 forces the 9th to be nonzero.
const houses = [...graph.rows(), ...graph.columns(), ...graph.boxes()];
const oneHiddenZeroPerHouse = houses.map(
  house => new ContainExact('0_0_0_0_0_0_0_0', ...overlay.at(house)));

// The 9 hidden-zero real digits (the only nonzero VZ values in the whole
// grid) are exactly {1..9}, one each; unlisted value 0 is unrestricted.
const hiddenZeroDigitsAllDifferent = new ContainExact(
  '1_2_3_4_5_6_7_8_9', ...overlay.at(graph.cells()));

// Cage sum-is-square, using effective values (digit - VZ). The listed
// squares cover every size up to a 9-cell cage (max real-digit sum 45);
// an unreachable target for a smaller cage is simply never satisfied.
const squares = [0, 1, 4, 9, 16, 25, 36];
const cageSquareSum = cells => new Or(squares.map(
  sq => new Sum(sq, ...cells, ...cells.map(c => [z(c), -1]))));

// Cages (23), partitioning the grid; every cell in the grid belongs to
// exactly one, and none carries a drawn total -- see the puzzle's cage
// diagram.
const cages = [
  ['R1C2', 'R1C3', 'R2C3', 'R3C3'],
  ['R1C1', 'R2C1', 'R3C1'],
  ['R2C2', 'R3C2'],
  ['R1C4', 'R1C5'],
  ['R1C6', 'R1C7'],
  ['R1C8', 'R1C9'],
  ['R2C4', 'R2C5', 'R2C7', 'R2C8', 'R2C6', 'R2C9'],
  ['R3C4', 'R3C5'],
  ['R3C6', 'R3C7'],
  ['R3C8'],
  ['R3C9', 'R4C9', 'R4C8'],
  ['R4C4', 'R5C4', 'R6C4', 'R6C5', 'R6C6', 'R5C6', 'R4C6', 'R4C5', 'R4C7'],
  ['R5C5'],
  ['R6C7', 'R5C7', 'R5C8', 'R5C9', 'R6C9'],
  ['R6C8', 'R7C8', 'R8C8'],
  ['R7C9', 'R8C9', 'R9C9'],
  ['R7C6', 'R7C7', 'R8C7', 'R9C7', 'R9C8'],
  ['R7C5', 'R8C5', 'R8C4', 'R9C4', 'R9C5', 'R9C6', 'R8C6'],
  ['R7C4'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2', 'R8C2'],
  ['R9C3', 'R8C3', 'R7C3', 'R7C2'],
  ['R4C2', 'R4C1', 'R4C3', 'R5C3', 'R6C3', 'R6C2'],
  ['R5C2', 'R5C1', 'R6C1'],
];
const cageConstraints = cages.flatMap(cells => [
  new AllDifferent(...cells),
  cageSquareSum(cells),
]);

// White dots (4, drawn as rounded white edge marks): effective values
// differ by 1, either direction.
const consecutive = (a, b) => new Or([
  new Sum(1, a, [z(a), -1], [b, -1], [z(b), 1]),
  new Sum(1, b, [z(b), -1], [a, -1], [z(a), 1]),
]);
const whiteDots = [
  ['R2C1', 'R2C2'],
  ['R1C5', 'R1C6'],
  ['R3C9', 'R4C9'],
  ['R8C6', 'R9C6'],
].map(([a, b]) => consecutive(a, b));

// Restrict the main grid back to real digits 1-9 (the widened Shape
// admits 0 for VZ), stamped across every cell via Replicate; R1C2's own
// Given further narrows it to the puzzle's one given digit.
const digitRange = graph.makeReplicate(
  new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

return [
  shape,
  overlay.toVar('hidden zero'),
  digitRange,
  new Given('R1C2', 7),
  ...flagLinks,
  ...oneHiddenZeroPerHouse,
  hiddenZeroDigitsAllDifferent,
  ...cageConstraints,
  ...whiteDots,
];
