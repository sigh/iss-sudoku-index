// Title: Limitations 8
// Author: Md88keys
// Video: https://www.youtube.com/watch?v=44nj7guMdHw
// Source: https://sudokupad.app/ndo5ff4agt

// Nine unknown, non-overlapping 3x3 boxes contain 1-9. Cells outside them are
// zero, while nonzero digits do not repeat in any row or column.
const SIZE = 11;
const shape = new Shape('1x1', '0-10');
const answer = cellGraph('11x11').makeOverlay('VG');
const occupied = cellGraph('11x11').makeOverlay('VO');
const topLeft = cellGraph('9x9').makeOverlay('VT');
const answerVars = answer.toVar('Answer grid');
const occupiedVars = occupied.toVar('Inside a box');
const topLeftVars = topLeft.toVar('3x3 box top-left');
const answerRange = Array.from({ length: 10 }, (_, value) => value);
const binaryRange = [0, 1];

const answerGrid = Array.from({ length: SIZE }, (_, row) =>
  Array.from({ length: SIZE }, (_, col) => answerVars.cell(row + 1, col + 1)));
const occupiedGrid = Array.from({ length: SIZE }, (_, row) =>
  Array.from({ length: SIZE }, (_, col) => occupiedVars.cell(row + 1, col + 1)));
const placements = Array.from({ length: 9 }, (_, row) =>
  Array.from({ length: 9 }, (_, col) => {
    const boxRow = row + 1;
    const boxCol = col + 1;
    return {
      flag: topLeftVars.cell(boxRow, boxCol),
      cells: Array.from({ length: 3 }, (_, dr) =>
        Array.from({ length: 3 }, (_, dc) =>
          answerVars.cell(boxRow + dr, boxCol + dc))).flat(),
      positions: Array.from({ length: 3 }, (_, dr) =>
        Array.from({ length: 3 }, (_, dc) =>
          [boxRow + dr, boxCol + dc])).flat(),
    };
  })).flat();

const placeholder = [new Given(makeCellId(1, 1), 0)];
const answerDomains = answer.makeReplicate(
  new Given(answer.cells()[0], ...answerRange));
const occupiedDomains = occupied.makeReplicate(
  new Given(occupied.cells()[0], ...binaryRange));
const topLeftDomains = topLeft.makeReplicate(
  new Given(topLeft.cells()[0], ...binaryRange));

const placementCoverage = occupiedGrid.flatMap((row, rowIndex) =>
  row.map((occupied, colIndex) => {
    const rowNumber = rowIndex + 1;
    const colNumber = colIndex + 1;
    const coveringFlags = placements
      .filter(({ positions }) => positions.some(
        ([row, col]) => row === rowNumber && col === colNumber))
      .map(({ flag }) => flag);
    return new EqualSum([occupied], coveringFlags);
  }));
const selectedBoxes = placements.map(({ flag, cells }) =>
  new Or([new Given(flag, 0), new AllDifferent(...cells)]));

const membershipKey = Pair.fnToKey(
  (occupied, digit) => occupied === (digit === 0 ? 0 : 1), shape);
const digitMembership = answerGrid.flatMap((row, rowIndex) =>
  row.map((digit, colIndex) => new Pair(
    membershipKey, 'box membership', occupiedGrid[rowIndex][colIndex], digit)));

const nonzeroDifferentKey = PairX.fnToKey(
  (a, b) => a === 0 || b === 0 || a !== b, shape);
const rowsAndColumns = [
  ...answerGrid,
  ...Array.from({ length: SIZE }, (_, col) =>
    answerGrid.map(row => row[col])),
].map(cells => new PairX(nonzeroDifferentKey, 'nonzero digits differ', ...cells));

const cells = coordinates => coordinates.map(([row, col]) =>
  answerVars.cell(row, col));
const uniqueCells = groups => [...new Set(groups.flat())];

const purple = cells([
  [9, 8], [8, 8], [8, 7], [7, 7], [6, 7], [5, 7], [4, 7], [4, 8], [3, 8],
]);
const blue = cells([
  [1, 11], [2, 11], [2, 10], [2, 9], [2, 8], [2, 7], [3, 7],
]);
const greens = [
  cells([[7, 10], [8, 10], [9, 10]]),
  cells([[7, 5], [8, 5]]),
  cells([[10, 8], [10, 9], [10, 10]]),
];
const reds = [
  cells([[1, 1], [1, 2], [2, 2]]),
  cells([[3, 2], [4, 2], [5, 2]]),
  cells([[4, 4], [5, 3], [6, 4]]),
];
const greys = [
  cells([[7, 9], [7, 8], [6, 8]]),
  cells([[10, 1], [10, 2], [9, 2]]),
  cells([[9, 5], [10, 5]]),
];
const whiteDots = [
  cells([[11, 1], [11, 2]]),
  cells([[11, 9], [11, 10]]),
  cells([[4, 6], [5, 6]]),
  cells([[5, 5], [6, 5]]),
];
const blackDots = [
  cells([[10, 8], [11, 8]]),
  cells([[7, 6], [8, 6]]),
  cells([[3, 10], [3, 11]]),
];
const quadCells = [
  cells([[1, 9], [1, 10], [2, 9], [2, 10]]),
  cells([[6, 5], [6, 6], [7, 5], [7, 6]]),
];
const clueCells = uniqueCells([
  purple, blue, ...greens, ...reds, ...greys,
  ...whiteDots, ...blackDots, ...quadCells,
]);
const clueCoverage = occupied.makeReplicate(
  new Given(occupied.cells()[0], 1),
  clueCells.map(cell => occupied.at(answer.gridAt(cell))));

// Every contiguous part of the blue line inside a selected box is a segment.
const blueRuns = placements.map(({ flag, positions }) => {
  const inBox = new Set(positions.map(([row, col]) => answerVars.cell(row, col)));
  const runs = [];
  for (const cell of blue) {
    if (!inBox.has(cell)) continue;
    if (!runs.length || blue.indexOf(cell) !== blue.indexOf(runs.at(-1).at(-1)) + 1) {
      runs.push([]);
    }
    runs.at(-1).push(cell);
  }
  return { flag, runs };
}).filter(({ runs }) => runs.length);
const blueSegmentSums = [
  ...blueRuns
    .filter(({ runs }) => runs.length > 1)
    .map(({ flag, runs }) =>
      new Or([new Given(flag, 0), new EqualSum(...runs)])),
  ...blueRuns.flatMap((left, leftIndex) =>
    blueRuns.slice(leftIndex + 1).map(right =>
      new Or([
        new Given(left.flag, 0),
        new Given(right.flag, 0),
        new EqualSum(...left.runs, ...right.runs)]))),
];

const alternatingParityKey = Pair.fnToKey(
  (a, b) => (a % 2) !== (b % 2), shape);
const redParity = reds.map(line =>
  new Pair(alternatingParityKey, 'alternating parity', ...line));
const greyDifferences = greys
  .filter(line => line.length === 3)
  .map(([first, middle, last]) =>
    new Sum(0, first, last, [middle, -2]));

return [
  shape,
  new NoBoxes(),
  answerVars,
  occupiedVars,
  topLeftVars,
  ...placeholder,
  answerDomains,
  occupiedDomains,
  topLeftDomains,
  new Sum(9, ...placements.map(({ flag }) => flag)),
  ...placementCoverage,
  ...selectedBoxes,
  ...digitMembership,
  ...rowsAndColumns,
  clueCoverage,

  // Blue region-sum line and its global no-repeat rule.
  new AllDifferent(...blue),
  ...blueSegmentSums,

  // Purple renban; Renban already includes its no-repeat rule.
  new Renban(...purple),

  // Green whispers and the clue type's global no-repeat rule.
  ...greens.map(line => new Whisper(5, ...line)),
  new AllDifferent(...uniqueCells(greens)),

  // Red alternating-parity lines and global no-repeat rule.
  ...redParity,
  new AllDifferent(...uniqueCells(reds)),

  // Grey equal-difference lines and global no-repeat rule. A two-cell line
  // imposes no additional equal-difference condition.
  ...greyDifferences,
  new AllDifferent(...uniqueCells(greys)),

  ...whiteDots.map(dot => new WhiteDot(...dot)),
  new AllDifferent(...uniqueCells(whiteDots)),
  ...blackDots.map(dot => new BlackDot(...dot)),
  new AllDifferent(...uniqueCells(blackDots)),

  new Quad(quadCells[0][0], 1, 2, 6, 9),
  new Quad(quadCells[1][0], 3, 4, 7, 5),
];
