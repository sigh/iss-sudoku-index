// Title: Impossible?
// Author: Damasosos92
// Video: https://www.youtube.com/watch?v=rvj3DAIAe88
// Source: https://app.crackingthecryptic.com/sudoku/LQhq2RNjhj

// Use 0--8 in 3x3 boxes. Cage digits do not repeat, all cage totals agree,
// and the six outside ? marks are a permutation of 1--6. Each ? is both the
// X-Sums total and Full Rank of its inward row or column; ranking has no ties.
const shape = new Shape('6x6', '0-8');
const graph = cellGraph(shape);
const geometry = cellGeometry(shape);
const questionVars = new Var('Q', 'outside question marks', 6);
const flagVars = new Var('F', 'full-rank comparison flags', 138);
const cages = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C4', 'R1C5', 'R1C6'],
  ['R2C1', 'R2C2', 'R3C1', 'R4C1'],
  ['R4C3', 'R4C4', 'R5C3', 'R5C4'],
  ['R6C2', 'R6C3', 'R6C4'],
  ['R4C2', 'R5C1', 'R5C2', 'R6C1'],
  ['R2C3', 'R3C3', 'R3C4', 'R3C5'],
  ['R3C6', 'R4C5', 'R4C6', 'R5C5', 'R6C5'],
];
// Question-mark geometry transcribed from the six drawn outside markers.
const clues = [
  [questionVars.cell(1), ['R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3']],
  [questionVars.cell(2), ['R1C4', 'R2C4', 'R3C4', 'R4C4', 'R5C4', 'R6C4']],
  [questionVars.cell(3), ['R3C6', 'R3C5', 'R3C4', 'R3C3', 'R3C2', 'R3C1']],
  [questionVars.cell(4), ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6']],
  [questionVars.cell(5), ['R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C2', 'R1C2']],
  [questionVars.cell(6), ['R6C5', 'R5C5', 'R4C5', 'R3C5', 'R2C5', 'R1C5']],
];

const lessKey = Pair.fnToKey((a, b) => a < b, shape);
const allLines = [
  ...Array.from({length: 6}, (_, row) => {
    const line = Array.from({length: 6}, (_, col) => geometry.makeCellId(row, col));
    return [line, line.slice().reverse()];
  }).flat(),
  ...Array.from({length: 6}, (_, col) => {
    const line = Array.from({length: 6}, (_, row) => geometry.makeCellId(row, col));
    return [line, line.slice().reverse()];
  }).flat(),
];
const rankedLineIndexes = [16, 18, 5, 2, 15, 21];

// A numeric comparison of equal-length digit strings is lexicographic. Each
// branch selects the first unequal position; earlier positions are equal.
function lexLess(left, right) {
  return new Or(left.map((cell, index) => new And([
    ...left.slice(0, index).map((earlier, prior) =>
      new SameValues(2, earlier, right[prior])),
    new Pair(lessKey, 'lexicographic less', cell, right[index]),
  ])));
}

function lexDifferent(left, right) {
  return new Or([lexLess(left, right), lexLess(right, left)]);
}

// XSum takes literal totals, so each outside value chooses one of its six
// source-defined readings. The AllDifferent below makes the marks 1--6.
const xSums = clues.map(([question, cells]) => new Or(
  Array.from({length: 6}, (_, index) => new And([
    new Given(question, index + 1),
    XSum.fromCells(index + 1, cells, geometry),
  ]))));

// For each ranked line, a flag is 1 when another line is lower and 2 when it
// is higher. Its 23 flags sum with the displayed rank to 47, so exactly
// rank-1 lines are lower. The remaining pairs are explicitly non-equal.
let nextFlag = 1;
const rankConstraints = clues.flatMap(([question], rankedIndex) => {
  const line = allLines[rankedLineIndexes[rankedIndex]];
  const flags = allLines.flatMap((other, otherIndex) => {
    if (otherIndex === rankedLineIndexes[rankedIndex]) return [];
    const flag = flagVars.cell(nextFlag++);
    return [new Or([
      new And([new Given(flag, 1), lexLess(other, line)]),
      new And([new Given(flag, 2), lexLess(line, other)]),
    ])];
  });
  const flagCells = Array.from({length: flags.length}, (_, index) =>
    flagVars.cell(nextFlag - flags.length + index));
  return [new Sum(47, ...flagCells, question), ...flags];
});
const unrankedIndexes = allLines.map((_, index) => index).filter(index =>
  !rankedLineIndexes.includes(index));
const nonTies = unrankedIndexes.flatMap((leftIndex, offset) =>
  unrankedIndexes.slice(offset + 1).map(rightIndex =>
    lexDifferent(allLines[leftIndex], allLines[rightIndex])));

return [
  shape,
  new RegionSize(9),
  questionVars,
  flagVars,
  new AllDifferent(...questionVars.cells()),
  ...cages.map(cells => new AllDifferent(...cells)),
  new EqualSum(...cages),
  ...xSums,
  ...rankConstraints,
  ...nonTies,
];
