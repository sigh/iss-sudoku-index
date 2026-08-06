// Title: Twisted
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=hoWFAOK9W1M
// Source: https://sudokupad.app/f4e7jjoad0

// The four corner 4x4 Sudokus and the rotated central 6x6 Sudoku occupy
// non-rectangular positions on a 13x13 drawing canvas. VP1..VP169 represent
// the full canvas in row-major order, with blank positions pinned to 0; the
// pinned 1x1 grid only supplies the shared 0-6 alphabet.

const cornerOrigins = [[1, 1], [1, 10], [10, 1], [10, 10]];
const cornerGrids = cornerOrigins.map(([row0, col0]) =>
  Array.from({ length: 4 }, (_, r) =>
    Array.from({ length: 4 }, (_, c) => [row0 + r, col0 + c])));

// Logical rows of the rotated 6x6 grid. Logical columns and boxes are derived
// from this drawn geometry rather than separately hand-enumerated.
const slantedRows = [
  [[2, 7], [3, 8], [4, 9], [5, 10], [6, 11], [7, 12]],
  [[3, 6], [4, 7], [5, 8], [6, 9], [7, 10], [8, 11]],
  [[4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10]],
  [[5, 4], [6, 5], [7, 6], [8, 7], [9, 8], [10, 9]],
  [[6, 3], [7, 4], [8, 5], [9, 6], [10, 7], [11, 8]],
  [[7, 2], [8, 3], [9, 4], [10, 5], [11, 6], [12, 7]],
];

const coordKey = ([row, col]) => row * 100 + col;
const physicalCells = [...new Map([
  ...cornerGrids.flat(2),
  ...slantedRows.flat(),
].map(cell => [coordKey(cell), cell])).values()]
  .sort(([ar, ac], [br, bc]) => ar - br || ac - bc);
const canvasVars = new Var('P', 'Canvas cells', '13x13');
const occupiedKeys = new Set(physicalCells.map(coordKey));
const physicalIndex = new Map(physicalCells.map(([row, col]) =>
  [coordKey([row, col]), canvasVars.cell(row, col)]));
const at = cell => {
  const mapped = physicalIndex.get(coordKey(cell));
  if (!mapped) throw new Error(`Blank canvas position used as a digit: ${cell.join(',')}`);
  return mapped;
};

const cornerSudoku = cornerGrids.flatMap(grid => {
  const rows = grid;
  const columns = Array.from({ length: 4 }, (_, c) => grid.map(row => row[c]));
  const boxes = [0, 2].flatMap(r0 => [0, 2].map(c0 =>
    [grid[r0][c0], grid[r0][c0 + 1], grid[r0 + 1][c0], grid[r0 + 1][c0 + 1]]));
  return [
    ...rows.map(group => new ContainExact('1_2_3_4', ...group.map(at))),
    ...[...columns, ...boxes].map(group => new AllDifferent(...group.map(at))),
  ];
});

// A corner-grid cell may not repeat in the same local position in another
// corner grid: 16 groups, one for each local row/column coordinate.
const disjointPositions = Array.from({ length: 4 }, (_, r) =>
  Array.from({ length: 4 }, (_, c) =>
    new AllDifferent(...cornerGrids.map(grid => at(grid[r][c]))))).flat();

const slantedColumns = Array.from({ length: 6 }, (_, c) =>
  slantedRows.map(row => row[c]));
const slantedBoxes = [0, 2, 4].flatMap(r0 => [0, 3].map(c0 =>
  [
    ...slantedRows[r0].slice(c0, c0 + 3),
    ...slantedRows[r0 + 1].slice(c0, c0 + 3),
  ]));
const slantedSudoku = [
  ...slantedRows.map(group =>
    new ContainExact('1_2_3_4_5_6', ...group.map(at))),
  ...[...slantedColumns, ...slantedBoxes].map(group =>
    new AllDifferent(...group.map(at))),
];

// A zero sentinel represents each canvas position that belongs to no grid.
// Since values are nonnegative, a single zero-sum constraint pins all blanks.
const blankCells = Array.from({ length: 13 }, (_, r) =>
  Array.from({ length: 13 }, (_, c) => [r + 1, c + 1]))
  .flat()
  .filter(cell => !occupiedKeys.has(coordKey(cell)))
  .map(([row, col]) => canvasVars.cell(row, col));
const blankCanvas = new Sum(0, ...blankCells);

const arrows = [
  {
    tens: [2, 1], ones: [2, 2],
    ray: [[2, 3], [2, 4], [2, 7], [2, 10], [2, 11], [2, 12], [2, 13]],
  },
  {
    tens: [10, 3], ones: [10, 4],
    ray: [[10, 5], [10, 7], [10, 9], [10, 10], [10, 11], [10, 12], [10, 13]],
  },
  {
    tens: [2, 4], ones: [3, 4],
    ray: [[4, 4], [5, 4], [7, 4], [9, 4], [10, 4], [11, 4], [12, 4], [13, 4]],
  },
  {
    tens: [11, 10], ones: [10, 10],
    ray: [[9, 10], [7, 10], [5, 10], [4, 10], [3, 10], [2, 10], [1, 10]],
  },
  {
    tens: [3, 12], ones: [4, 11],
    ray: [[5, 10], [6, 9], [7, 8], [8, 7], [9, 6], [10, 5], [11, 4], [12, 3], [13, 2]],
  },
  {
    tens: [7, 12], ones: [7, 10],
    ray: [[7, 8], [7, 6], [7, 4], [7, 2]],
  },
];

// Branch on X, the first digit seen. In that branch, the first X ray digits
// sum to the two-digit number 10*tens + ones. Later ray cells are irrelevant.
const xSumArrows = arrows.map(({ tens, ones, ray }) => {
  const tensCell = at(tens);
  const onesCell = at(ones);
  const rayCells = ray.map(at);
  const branches = Array.from({ length: Math.min(6, rayCells.length) }, (_, i) => {
    const x = i + 1;
    return new And([
      new Given(rayCells[0], x),
      new Sum(0, ...rayCells.slice(0, x), [tensCell, -10], [onesCell, -1]),
    ]);
  });
  return new Or(branches);
});

return [
  new Shape('1x1', '0-6'),
  canvasVars,
  new Given('R1C1', 0),
  blankCanvas,
  ...cornerSudoku,
  ...disjointPositions,
  ...slantedSudoku,
  ...xSumArrows,
];
