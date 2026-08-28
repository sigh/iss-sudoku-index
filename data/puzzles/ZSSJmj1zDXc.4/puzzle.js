// Title: Summon
// Author: Freddie Hand
// Video: https://www.youtube.com/watch?v=ZSSJmj1zDXc
// Source: https://tinyurl.com/yckzhkfa

// Rules:
//   Enter the given set of digits into the grid, so that each digit appears
//   exactly once in each region. Cells with equal digits cannot touch each
//   other, not even diagonally. Digits in adjacent cells within a row or column
//   form multi-digit numbers, read from left to right or from top to bottom;
//   digits without neighbours form single-digit numbers. The numbers outside
//   the grid indicate the sum of all such multi-digit and single-digit numbers
//   in the respective row or column.
//
// The digit set drawn above the board is {1-3}, and regions hold more cells
// than digits, so a cell is either one of 1, 2, 3 or empty. Empty is modelled
// as the value 0 on a Raw 7x7 grid: rows and columns carry no rule of their
// own here, so no latin constraints apply.
//
// Only rows 1, 3, 5, 7 and columns 1, 3, 5, 7 carry an outside number; the
// other lines are unclued and unconstrained.

const shape = new Shape('7x7', '0-3', 'Raw');
const graph = cellGraph(shape);

// Region map, read off the region borders drawn in the source. Regions have
// 3, 5 or 7 cells; each holds one 1, one 2 and one 3, the rest empty.
const REGION_MAP = [
  '1112233',
  '4442223',
  '4445223',
  '6455573',
  '6885777',
  '6888777',
  '6688999',
];
const regions = new Map();
REGION_MAP.forEach((rowStr, r) => {
  [...rowStr].forEach((label, c) => {
    if (!regions.has(label)) regions.set(label, []);
    regions.get(label).push(makeCellId(r + 1, c + 1));
  });
});
const regionDigits = [...regions.values()].map(
  cells => new ContainExact('1_2_3', ...cells));

// Equal digits may not touch, orthogonally or diagonally. 0 is "empty", not a
// digit, so two empty cells may touch.
const distinctKey = Pair.fnToKey((a, b) => a === 0 || b === 0 || a !== b, shape);
// Every king-adjacent pair lies on exactly one row, column or diagonal line, and
// Pair relates consecutive cells of the list it is given.
const diagonalStarts = (dCol) => [
  ...graph.row(1),
  ...(dCol > 0 ? graph.column(1) : graph.column(7)).slice(1),
];
const kingLines = [
  ...graph.rows(),
  ...graph.columns(),
  ...diagonalStarts(1).map(cell => graph.ray(cell, 1, 1)),
  ...diagonalStarts(-1).map(cell => graph.ray(cell, 1, -1)),
].filter(line => line.length > 1);
const noTouch = kingLines.map(
  line => new Pair(distinctKey, 'no touch', ...line));

// Outside sums. Scanning a clued line in reading order, a maximal run of
// non-empty cells is one multi-digit number. `run` is the value of the run in
// progress and `total` already includes it, so extending the run by digit v
// replaces run with run*10 + v and adds the difference to the total. An empty
// cell closes the run. Runs can only add to the total, so a total past the
// clue is a dead branch.
const sumSpec = (target) => NFA.encodeSpec({
  startState: { total: 0, run: 0 },
  transition: ({ total, run }, value) => {
    if (value === 0) return { total, run: 0 };
    const newRun = run * 10 + value;
    const newTotal = total + newRun - run;
    if (newTotal > target) return undefined;
    return { total: newTotal, run: newRun };
  },
  accept: ({ total }) => total === target,
}, shape);

// Clues printed to the right of rows 1, 3, 5, 7 and below columns 1, 3, 5, 7.
const ROW_CLUES = [[1, 129], [3, 24], [5, 21], [7, 235]];
const COL_CLUES = [[1, 46], [3, 34], [5, 8], [7, 16]];
const outsideSums = [
  ...ROW_CLUES.map(([r, t]) => new NFA(sumSpec(t), `R${r}=${t}`, ...graph.row(r))),
  ...COL_CLUES.map(([c, t]) => new NFA(sumSpec(t), `C${c}=${t}`, ...graph.column(c))),
];

return [
  shape,
  ...regionDigits,
  ...noTouch,
  ...outsideSums,
];
