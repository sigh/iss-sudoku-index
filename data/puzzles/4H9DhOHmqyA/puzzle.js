// Title: Pinenut
// Author: Serkan Yurekli
// Video: https://www.youtube.com/watch?v=4H9DhOHmqyA
// Source: https://app.crackingthecryptic.com/sudoku/h48d9dNn2B
//
// Normal sudoku rules apply. Cages sum to the total shown, digits do not
// repeat within a cage. Marked diagonals sum to the total shown, digits may
// repeat along a diagonal. 3, 1 and 4 (the digits of "Pi") can never occupy
// two orthogonally-adjacent cells. The unshown totals of cages and diagonals
// can never be made up of only 3s, 1s and 4s -- a total is a number, and a
// number is "made up of" its own decimal digits, so this constrains each
// unshown-total group's actual (solver-computed) sum, not the digits summed
// to reach it: that sum's decimal representation must contain a digit
// outside {1, 3, 4}. Cages/diagonals whose total IS printed carry no such
// guarantee.

const piDigits = [1, 3, 4];

const givens = [
  new Given('R9C1', 1),
  new Given('R9C5', 4),
  new Given('R9C9', 3),
];

// Cages with a printed total: killer cages (distinct digits, sum to total).
const totalCages = [
  new Cage(8, 'R3C3', 'R3C4', 'R4C4'),
  new Cage(16, 'R3C5', 'R3C6', 'R3C7', 'R4C6'),
];

// Cages with no printed total: still real cages, so digits within each stay
// distinct. The sum itself is unknown, but "no repeats" still applies.
const noTotalCageCells = [
  ['R5C4', 'R6C4'],
  ['R5C6', 'R6C6'],
  ['R7C4', 'R8C4'],
  ['R7C6', 'R8C6'],
];
const noTotalCages = noTotalCageCells.map(
  cells => new AllDifferent(...cells));

// Marked diagonals with a printed total: sum to the total, repeats allowed.
// Each diagonal is drawn as a short arrow at a grid corner point, running to
// the far edge; its total is the outside number nearest that corner.
const totalDiagonals = [
  [12, ['R7C1', 'R8C2', 'R9C3']],
  [12, ['R8C1', 'R9C2']],
  [16, ['R9C6', 'R8C7', 'R7C8', 'R6C9']],
  [10, ['R1C4', 'R2C3', 'R3C2', 'R4C1']],
  [8, ['R3C9', 'R2C8', 'R1C7']],
  [12, ['R2C9', 'R1C8']],
];
const diagonalSums = totalDiagonals.map(
  ([total, cells]) => new Sum(total, ...cells));

// Marked diagonals with no printed total (repeats still allowed; no Sum here
// since the total is unknown).
const noTotalDiagonalCells = [
  ['R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9'],
  ['R9C8', 'R8C9'],
  ['R1C2', 'R2C1'],
  ['R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1'],
];

// "The unshown totals of cages and diagonals can never be made up of only
// 3s, 1s and 4s": the total is a number, and a number is "made up of" its
// decimal digits (cf. "12 is made up of a 1 and a 2"), so this is a
// constraint on the group's actual sum, not on the multiset of digits that
// produced it. Modelled as an NFA that accumulates the running sum over the
// group's cells and rejects only a final sum whose decimal digits are all in
// {1, 3, 4} (e.g. a no-total group actually summing to 13 is forbidden; one
// summing to 12 or 15 is fine). The running sum is bounded (0-54: the
// longest unshown-total group has 6 cells, each 1-9), so `maxDepth: 6`
// (the longest such group) keeps the compiled state space finite without
// needing to clamp the sum itself.
function isAllPiDigits(n) {
  return String(n).split('').every(d => piDigits.includes(Number(d)));
}
const totalNotAllPiSpec = NFA.encodeSpec({
  startState: 0,
  transition: (sum, value) => sum + value,
  accept: (sum) => !isAllPiDigits(sum),
  maxDepth: 6,
}, 9);
const totalNotAllPi = (cells) =>
  new NFA(totalNotAllPiSpec, 'unshown total is not all Pi digits', cells);

const noTotalGroupChecks = [
  ...noTotalCageCells,
  ...noTotalDiagonalCells,
].map(totalNotAllPi);

// "3, 1 and 4 can never be in neighbouring cells (orthogonally)": no
// orthogonally-adjacent pair of cells may both hold a digit from {1, 3, 4}.
// Applies over every orthogonal edge of the grid. All such edges are one of
// two shifted copies of a single relation (a cell and its right-neighbour, or
// a cell and its down-neighbour), so each direction is one `Replicate` of a
// one-edge template rather than 144 separate `Pair`s.
const graph = cellGraph('9x9');
const notBothPiKey = Pair.fnToKey(
  (a, b) => !(piDigits.includes(a) && piDigits.includes(b)), 9);
const rightEdgeOrigins = graph.cells().filter(
  cell => graph.step(cell, 0, 1) !== null);
const downEdgeOrigins = graph.cells().filter(
  cell => graph.step(cell, 1, 0) !== null);
const antiPiAdjacency = [
  graph.makeReplicate(
    new Pair(notBothPiKey, 'anti-Pi adjacency', 'R1C1', 'R1C2'),
    rightEdgeOrigins),
  graph.makeReplicate(
    new Pair(notBothPiKey, 'anti-Pi adjacency', 'R1C1', 'R2C1'),
    downEdgeOrigins),
];

return [
  new Shape('9x9'),
  ...givens,
  ...totalCages,
  ...noTotalCages,
  ...diagonalSums,
  ...noTotalGroupChecks,
  ...antiPiAdjacency,
];
