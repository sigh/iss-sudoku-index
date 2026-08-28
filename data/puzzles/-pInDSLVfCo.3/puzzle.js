// Title: March 16, 2022: Ordered Sums
// Author: clover!
// Video: https://www.youtube.com/watch?v=-pInDSLVfCo
// Source: https://tinyurl.com/32dm8cjk

// Normal sudoku rules apply. There are 20 two-cell cages, each printed with a
// rank digit 1-6 instead of a total (payload `cage[].value`). Rule: rank-r
// cages hold the r-th lowest total among all cage totals, ties allowed within
// a rank but not across ranks (a tie across ranks would make the higher rank
// mislabelled), and the six rank totals need not be consecutive. Every cage's
// two cells already share a row, column, or box, so cage digits are already
// forced distinct by ordinary Sudoku -- no separate cage distinctness is
// added. A duplicate, unlabelled cage outline over R3C1,R3C2 (the payload's
// lone `killercage` entry) repeats one rank-3 cage's boundary and adds no
// separate rule.
//
// A domino cage totals in [3, 17] (1+2 .. 8+9), above the 1-9 grid alphabet
// and past the 16-value widened-shape ceiling, so each rank Var stores
// total-1 (range [2, 16]) instead of the total itself; the value range is
// widened to 16 and the 81 grid cells are restricted back to 1-9 with one
// Replicate, leaving 10-16 usable only by the rank total Vars below. Every
// cage in rank r is tied by a Sum equation to one shared Var VTr (offset by
// the same -1 throughout), which both pins same-rank cages to an equal total
// and gives one value per rank to compare. The six rank Vars are then
// chained strictly increasing (VT1 < VT2 < ... < VT6) with Pair over the
// widened range; comparing the shifted values is equivalent to comparing the
// totals themselves, since every rank Var carries the same offset.

const shape = new Shape('9x9', 16);
const graph = cellGraph(shape);

const restrictGrid = graph.makeReplicate(
  new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

const givens = [
  new Given('R1C3', 9), new Given('R1C5', 6),
  new Given('R2C3', 8),
  new Given('R3C3', 4), new Given('R3C5', 3), new Given('R3C7', 8),
  new Given('R3C8', 9), new Given('R3C9', 7),
  new Given('R5C1', 4), new Given('R5C3', 2), new Given('R5C7', 7),
  new Given('R5C9', 5),
  new Given('R7C1', 2), new Given('R7C2', 6), new Given('R7C3', 1),
  new Given('R7C5', 5), new Given('R7C7', 9),
  new Given('R8C7', 1),
  new Given('R9C5', 2), new Given('R9C7', 5),
];

// Cage cells (drawn "cage" boundaries), grouped by printed rank.
const cagesByRank = {
  1: [['R4C1', 'R5C1'], ['R9C4', 'R9C5'], ['R5C8', 'R6C8'], ['R5C6', 'R6C6']],
  2: [['R1C7', 'R2C7'], ['R1C8', 'R2C8'], ['R1C9', 'R2C9']],
  3: [['R1C1', 'R1C2'], ['R2C1', 'R2C2'], ['R3C1', 'R3C2']],
  4: [['R9C8', 'R9C9'], ['R8C8', 'R8C9'], ['R7C8', 'R7C9'], ['R4C4', 'R5C4']],
  5: [['R8C1', 'R9C1'], ['R8C2', 'R9C2'], ['R8C3', 'R9C3']],
  6: [['R4C2', 'R5C2'], ['R5C9', 'R6C9'], ['R1C5', 'R1C6']],
};
const ranks = Object.keys(cagesByRank).map(Number).sort((a, b) => a - b);

const rankTotal = new Var('T', 'cage rank total, minus 1', ranks.length);

// cellA + cellB - VTr = 1, i.e. VTr = (cellA + cellB) - 1: every rank-r
// cage's sum equals the shared (offset) total.
const cageSums = ranks.flatMap(rank =>
  cagesByRank[rank].map(([a, b]) =>
    new Sum(1, a, b, [rankTotal.cell(rank), -1])));

// VTr < VT(r+1) for each consecutive rank pair: totals strictly increase
// with rank (a tie would make the higher rank mislabelled -- see the rule
// note above).
const increasingKey = Pair.fnToKey((x, y) => x < y, shape);
const rankOrder = ranks.slice(1).map((rank, i) =>
  new Pair(
    increasingKey, 'cage rank totals strictly increase',
    rankTotal.cell(ranks[i]), rankTotal.cell(rank)));

return [
  shape,
  restrictGrid,
  ...givens,
  rankTotal,
  ...cageSums,
  ...rankOrder,
];
