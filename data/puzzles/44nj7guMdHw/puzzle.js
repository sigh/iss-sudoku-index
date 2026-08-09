// Title: Limitations 8
// Author: Md88keys
// Video: https://www.youtube.com/watch?v=44nj7guMdHw
// Source: https://sudokupad.app/ndo5ff4agt

// Rules encoded here:
//   Nine non-overlapping 3x3 boxes are placed anywhere in the 11x11 grid, and
//   each holds the digits 1-9. Every cell carrying a clue lies in a box. Cells
//   outside every box are written as 0, and a nonzero digit repeats in no row
//   and no column. The four digits of a quad circle appear in its 2x2.
//   For each clue type below, no digit repeats among all cells of that type:
//   blue region-sum line (box borders cut it into equal-valued segments),
//   purple consecutive-set line, green whisper (difference >= 5), red
//   alternating-parity line, grey equal-difference line, black 2:1 dots,
//   white consecutive dots.
// Omitted: the fog. It hides parts of the board while solving and clears as
//   correct digits are entered; it constrains no cell of the finished grid.

// Rows/columns repeat digits, so the grid is Raw: no implicit constraints.
// VO marks box membership, VT selects boxes.
const SIZE = 11;
const BOX = 3;
const TOP_LEFT_SPAN = SIZE - BOX + 1;
const shape = new Shape(`${SIZE}x${SIZE}`, '0-9', 'Raw');

const gridRef = cellGraph(shape);
const placementRef = cellGraph(`${TOP_LEFT_SPAN}x${TOP_LEFT_SPAN}`);
const membership = gridRef.makeOverlay('VO');
const selection = placementRef.makeOverlay('VT');
const IN_BOX = membership.toVar('Inside a placed box');
const IS_BOX = selection.toVar('3x3 box top-left');

const at = (row, col) => makeCellId(row, col);
const cells = coordinates => coordinates.map(([row, col]) => at(row, col));
const distinct = groups => [...new Set(groups.flat())];
const rowNumbers = Array.from({ length: SIZE }, (_, index) => index + 1);

// One candidate box per legal top-left cell, with the nine cells it would cover.
const placements = Array.from({ length: TOP_LEFT_SPAN }, (_, r) =>
  Array.from({ length: TOP_LEFT_SPAN }, (_, c) => {
    const top = r + 1;
    const left = c + 1;
    const offsets = Array.from({ length: BOX }, (_, d) => d);
    return {
      flag: IS_BOX.cell(top, left),
      covers: offsets.flatMap(dr => offsets.map(dc => [top + dr, left + dc])),
    };
  })).flat();

const binaryDomains = [
  membership.makeReplicate(new Given(membership.cells()[0], 0, 1)),
  selection.makeReplicate(new Given(selection.cells()[0], 0, 1)),
];

// A cell's membership flag counts the selected boxes covering it, so forcing it
// into {0, 1} is what makes the nine boxes non-overlapping.
const coverage = rowNumbers.flatMap(row => rowNumbers.map(col => new EqualSum(
  [IN_BOX.cell(row, col)],
  placements
    .filter(({ covers }) => covers.some(([r, c]) => r === row && c === col))
    .map(({ flag }) => flag))));

// A selected box holds nine different values, all nonzero because every cell it
// covers has membership 1, hence exactly the digits 1-9.
const boxDigits = placements.map(({ flag, covers }) => new Or([
  new Given(flag, 0),
  new AllDifferent(...cells(covers)),
]));

// Membership 1 <=> a digit is written; membership 0 <=> the cell shows 0.
const writtenKey = Pair.fnToKey(
  (inBox, digit) => (inBox === 1) === (digit !== 0), shape);
const written = rowNumbers.flatMap(row => rowNumbers.map(col => new Pair(
  writtenKey, 'box membership', IN_BOX.cell(row, col), at(row, col))));

// Zeroes may repeat down a row or column; digits may not.
const digitsDifferKey = PairX.fnToKey(
  (a, b) => a === 0 || b === 0 || a !== b, shape);
const rowsAndColumns = [
  ...rowNumbers.map(row => rowNumbers.map(col => at(row, col))),
  ...rowNumbers.map(col => rowNumbers.map(row => at(row, col))),
].map(line => new PairX(digitsDifferKey, 'nonzero digits differ', ...line));

// Drawn clues, transcribed from the source's line paths, dots and quad circles.
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
const quads = [
  { topLeft: at(1, 9), values: [1, 2, 6, 9] },
  { topLeft: at(6, 5), values: [3, 4, 7, 5] },
];

const clueCells = distinct([
  purple, blue, ...greens, ...reds, ...greys, ...whiteDots, ...blackDots,
  quads.flatMap(({ topLeft }) => [topLeft]),
  cells([[1, 10], [2, 9], [2, 10], [6, 6], [7, 5], [7, 6]]),
]);
const clueCellsInBox = membership.makeReplicate(
  new Given(membership.cells()[0], 1),
  membership.at(clueCells));

// A blue segment is a maximal run of consecutive line cells inside one box.
const blueRuns = placements.map(({ flag, covers }) => {
  const boxCells = new Set(cells(covers));
  const runs = [];
  blue.forEach((cell, index) => {
    if (!boxCells.has(cell)) return;
    const last = runs.at(-1);
    if (last && last.end === index - 1) {
      last.cells.push(cell);
      last.end = index;
    } else {
      runs.push({ cells: [cell], end: index });
    }
  });
  return { flag, runs: runs.map(run => run.cells) };
}).filter(({ runs }) => runs.length);
const blueSegmentValues = [
  ...blueRuns
    .filter(({ runs }) => runs.length > 1)
    .map(({ flag, runs }) => new Or([
      new Given(flag, 0),
      new EqualSum(...runs),
    ])),
  ...blueRuns.flatMap((left, index) => blueRuns.slice(index + 1).map(right =>
    new Or([
      new Given(left.flag, 0),
      new Given(right.flag, 0),
      new EqualSum(...left.runs, ...right.runs),
    ]))),
];

const parityKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), shape);

// |a - b| = |b - c| holds either as an arithmetic progression or with a = c.
const greyDifferences = greys
  .filter(line => line.length === BOX)
  .map(([first, middle, last]) => new Or([
    new Sum(0, first, last, [middle, -2]),
    new SameValues(2, first, last),
  ]));

return [
  shape,
  IN_BOX,
  IS_BOX,
  ...binaryDomains,
  new Sum(9, ...placements.map(({ flag }) => flag)),
  ...coverage,
  ...boxDigits,
  ...written,
  ...rowsAndColumns,
  clueCellsInBox,

  new AllDifferent(...blue),
  ...blueSegmentValues,

  // Renban carries the purple line's own no-repeat rule; it is the only
  // purple line, so it is also the type's no-repeat rule.
  new Renban(...purple),

  ...greens.map(line => new Whisper(5, ...line)),
  new AllDifferent(...distinct(greens)),

  ...reds.map(line => new Pair(parityKey, 'alternating parity', ...line)),
  new AllDifferent(...distinct(reds)),

  // A two-cell grey line has a single difference and so is unconstrained.
  ...greyDifferences,
  new AllDifferent(...distinct(greys)),

  ...whiteDots.map(dot => new WhiteDot(...dot)),
  new AllDifferent(...distinct(whiteDots)),
  ...blackDots.map(dot => new BlackDot(...dot)),
  new AllDifferent(...distinct(blackDots)),

  ...quads.map(({ topLeft, values }) => new Quad(topLeft, ...values)),
];
