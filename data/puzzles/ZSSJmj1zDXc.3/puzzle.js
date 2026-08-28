// Title: Summon Example
// Author: From WSPC 2019 IB (adapted)
// Video: https://www.youtube.com/watch?v=ZSSJmj1zDXc
// Source: https://tinyurl.com/3rx759xx

// Rules. Enter the given set of digits into the grid, so that each digit appears
// exactly once in each region. Cells with equal digits cannot touch each other,
// not even diagonally. Digits in adjacent cells within a row or column form
// multi-digit numbers, read from left to right or from top to bottom; digits
// without neighbours form single-digit numbers. The numbers outside the grid
// indicate the sum of all such multi-digit and single-digit numbers in the
// respective row or column.
//
// The digit set is printed beside the board as "{1-3}", so the digits are 1-3.
// Cells may be left blank, and every rule above is stated over the 4x4 board
// below; nothing is omitted.

// Blanks are value 0. Rows and columns repeat both digits and blanks, so the
// board is a Raw grid, which carries no row/column/box rule of its own.
const shape = new Shape('4x4', '0-3', 'Raw');
const graph = cellGraph(shape);

// The ten region borders drawn in the source, each named by the cell pair it
// separates.
const borders = [
  ['R1C1', 'R2C1'], ['R1C2', 'R2C2'],
  ['R2C1', 'R2C2'], ['R2C2', 'R2C3'], ['R2C3', 'R3C3'],
  ['R3C1', 'R3C2'], ['R3C2', 'R4C2'], ['R3C3', 'R3C4'],
  ['R3C3', 'R4C3'], ['R3C4', 'R4C4'],
];

// The regions are the connected components the borders leave behind.
const edgeKey = (a, b) => [a, b].sort().join('|');
const blocked = new Set(borders.map(([a, b]) => edgeKey(a, b)));
const regions = [];
const seen = new Map();
for (const start of graph.cells()) {
  if (seen.has(start)) continue;
  const region = [start];
  seen.set(start, true);
  for (let i = 0; i < region.length; i++) {
    for (const next of graph.neighbours(region[i])) {
      if (seen.has(next) || blocked.has(edgeKey(region[i], next))) continue;
      seen.set(next, true);
      region.push(next);
    }
  }
  regions.push(region);
}

// One of each digit per region; the region's other cells are blank.
const regionRules = regions.map(cells => new ContainExact('1_2_3', ...cells));

// Equal digits may not touch, orthogonally or diagonally. Blanks are exempt, so
// this is not AntiKing. Every king-adjacent pair lies inside some 2x2 block, and
// every pair inside a 2x2 block is king-adjacent, so one all-pairs constraint per
// block covers the rule exactly.
const noTouchKey = PairX.fnToKey((a, b) => a === 0 || b === 0 || a !== b, shape);
const blocks = graph.cells()
  .map(cell => graph.block(cell, 2, 2))
  .filter(block => block !== null)
  .map(block => new PairX(noTouchKey, 'no touching', ...block));

// One machine per outside clue, scanning the line in reading order.
// `run` is the number currently being read: a digit extends it, a blank ends it
// and banks it in `done`. Both are capped at the clue, which bounds the states.
const lineSum = (target, cells, name) => new NFA(
  NFA.encodeSpec({
    startState: { done: 0, run: 0 },
    transition: ({ done, run }, value) => {
      if (value === 0) {
        const banked = done + run;
        return banked <= target ? { done: banked, run: 0 } : undefined;
      }
      const extended = run * 10 + value;
      return done + extended <= target ? { done, run: extended } : undefined;
    },
    accept: ({ done, run }) => done + run === target,
  }, shape),
  name, ...cells);

// The four printed clues: rows 1-3 read left to right, column 3 top to bottom.
const clues = [
  lineSum(5, graph.row(1), 'R1=5'),
  lineSum(2, graph.row(2), 'R2=2'),
  lineSum(32, graph.row(3), 'R3=32'),
  lineSum(23, graph.column(3), 'C3=23'),
];

return [shape, ...regionRules, ...blocks, ...clues];
