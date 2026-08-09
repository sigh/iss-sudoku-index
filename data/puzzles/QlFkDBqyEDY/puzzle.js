// Title: Black Sheep
// Author: Leonhard Kohl-Lorting
// Video: https://www.youtube.com/watch?v=QlFkDBqyEDY
// Source: https://app.crackingthecryptic.com/sudoku/FL38N7nN23

// Digits 1-5 appear twice in every row, column, and box except for one
// globally consistent Black Sheep digit, which appears once. Cages sum with
// a digit allowed to repeat once (i.e. up to twice) within the cage; grey
// lines are Austrian Whispers of difference 3; blue lines have equal sums in
// each box segment they cross.
//
// Rows/columns repeat digits, so the grid is Raw: no implicit constraints.

const SHAPE = new Shape('9x9', '1-5', 'Raw');
const REF = cellGraph(SHAPE);

// Raw grid has no default boxes; build the ordinary 3x3 tiling explicitly.
const boxes = [];
for (let r = 1; r <= 9; r += 3) {
  for (let c = 1; c <= 9; c += 3) {
    boxes.push(REF.block(makeCellId(r, c), 3, 3));
  }
}
const unitGroups = [...REF.rows(), ...REF.columns(), ...boxes];

// One branch per possible globally shared Black Sheep digit. Each branch
// applies its corresponding multiset to every row, column, and box.
const blackSheepUnits = new Or([1, 2, 3, 4, 5].map(sheep => {
  const multiset = [1, 2, 3, 4, 5]
    .flatMap(digit => digit === sheep ? [digit] : [digit, digit])
    .join('_');
  return new And(unitGroups.map(cells =>
    new ContainExact(multiset, ...cells)));
}));

// Cage cells and totals transcribed from the drawn cages. "Digits may repeat
// once" caps any one digit at two occurrences per cage, so a plain Sum (no
// cap) would accept extra multiplicities (e.g. a digit three times); this NFA
// tracks each digit's running count alongside the running total and rejects
// a third occurrence of any digit or a total that overshoots.
const cageNFA = (total, numCells) => NFA.encodeSpec({
  startState: { sum: 0, counts: [0, 0, 0, 0, 0] },
  transition: ({ sum, counts }, v) => {
    const nextCounts = counts.slice();
    if (++nextCounts[v - 1] > 2) return undefined;
    const nextSum = sum + v;
    if (nextSum > total) return undefined;
    return { sum: nextSum, counts: nextCounts };
  },
  accept: ({ sum }) => sum === total,
  maxDepth: numCells,
}, SHAPE);

const CAGES = [
  { total: 12, cells: ['R7C4', 'R8C4', 'R8C5', 'R9C4', 'R9C5'] },
  { total: 9, cells: ['R2C2', 'R2C3', 'R3C2', 'R3C3'] },
  { total: 12, cells: ['R5C2', 'R6C2', 'R7C1', 'R7C2'] },
];
const cages = CAGES.map(({ total, cells }) =>
  new NFA(cageNFA(total, cells.length), `cage sum ${total}`, ...cells));

// Grey line paths from the source geometry.
const WHISPERS = [
  ['R4C1', 'R5C1', 'R5C2', 'R4C2'],
  ['R8C1', 'R9C1', 'R9C2'],
  ['R8C3', 'R9C4'],
  ['R8C6', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R6C5', 'R5C5', 'R5C6', 'R4C6'],
  ['R2C6', 'R2C7', 'R1C7', 'R1C8', 'R1C9'],
];
const whispers = WHISPERS.map(cells => new Whisper(3, ...cells));

// Each blue path's consecutive in-box segments, transcribed from the source.
const REGION_SUM_SEGMENTS = [
  [['R6C1', 'R6C2', 'R6C3'], ['R6C4']],
  [['R6C6'], ['R6C7', 'R6C8', 'R5C8']],
  [['R4C7', 'R4C8', 'R4C9'], ['R3C9', 'R2C9']],
  [['R3C7'], ['R3C6', 'R3C5']],
  [['R1C4', 'R2C4', 'R3C4'], ['R3C3', 'R3C2', 'R3C1']],
];
const regionSumLines = REGION_SUM_SEGMENTS.map(segments =>
  new EqualSum(...segments));

return [
  SHAPE,
  blackSheepUnits,
  ...cages,
  ...whispers,
  ...regionSumLines,
];
