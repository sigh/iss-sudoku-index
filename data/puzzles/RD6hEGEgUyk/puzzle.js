// Title: Extra Ball
// Author: Blobz
// Video: https://www.youtube.com/watch?v=RD6hEGEgUyk
// Source: https://sudokupad.app/blobz/extra-ball

// Each path step has row, column, and digit Vars. The row/column pair selects a
// grid cell, while the digit Var is tied to that cell. Monotone movement plus no
// repeated cells also rules out self-crossing: a path crosses each horizontal
// row boundary at most once.

const graph = cellGraph('9x9');
const gridCells = graph.cells();
const rowMoveKey = Pair.fnToKey((a, b) => b === a || b === a + 1, 9);
const colMoveKey = Pair.fnToKey((a, b) => Math.abs(a - b) <= 1, 9);
const sameBandKey = Pair.fnToKey(
  (a, b) => Math.floor((a - 1) / 3) === Math.floor((b - 1) / 3), 9);
const differentBandKey = Pair.fnToKey(
  (a, b) => Math.floor((a - 1) / 3) !== Math.floor((b - 1) / 3), 9);
const greenDifferenceKey = Pair.fnToKey((a, b) => Math.abs(a - b) >= 5, 9);

const rc = cell => parseCellId(cell);
const blocked = [
  'R1C1', 'R1C3', 'R1C5', 'R1C7', 'R1C9',
  'R2C1', 'R2C9', 'R3C1', 'R3C9', 'R4C1', 'R4C7', 'R4C9',
  'R5C1', 'R5C3', 'R5C9', 'R6C1', 'R6C9', 'R7C1', 'R7C7', 'R7C9',
  'R8C1', 'R8C2', 'R8C4', 'R8C8', 'R8C9',
  'R9C1', 'R9C2', 'R9C5', 'R9C8', 'R9C9',
].map(rc);
const playable = gridCells.filter(cell => {
  const { row, col } = rc(cell);
  return !blocked.some(block => block.row === row && block.col === col);
});

const pathSpecs = [
  { key: 'B', label: 'Blue path', length: 10, start: 'R1C2', end: 'R9C7' },
  { key: 'G', label: 'Green path', length: 11, start: 'R1C4', end: 'R9C3' },
  { key: 'R', label: 'Red path', length: 10, start: 'R1C6', end: 'R9C6' },
  { key: 'O', label: 'Orange path', length: 12, start: 'R1C8', end: 'R9C4' },
].map(spec => ({
  ...spec,
  rows: new Var(`Y${spec.key}`, `${spec.label} rows`, spec.length),
  cols: new Var(`X${spec.key}`, `${spec.label} columns`, spec.length),
  digits: new Var(`D${spec.key}`, `${spec.label} digits`, spec.length),
}));

const allSteps = pathSpecs.flatMap(path => Array.from({ length: path.length }, (_, i) => ({
  row: path.rows.cell(i + 1),
  col: path.cols.cell(i + 1),
})));

const distinctCells = allSteps.flatMap((a, i) => allSteps.slice(i + 1).map(b => new Or([
  new AllDifferent(a.row, b.row),
  new AllDifferent(a.col, b.col),
])));

const avoidBlocked = allSteps.flatMap(step => blocked.map(({ row, col }) => new Or([
  new Given(step.row, ...[1, 2, 3, 4, 5, 6, 7, 8, 9].filter(value => value !== row)),
  new Given(step.col, ...[1, 2, 3, 4, 5, 6, 7, 8, 9].filter(value => value !== col)),
])));

const endpoints = pathSpecs.flatMap(({ rows, cols, length, start, end }) => {
  const first = rc(start);
  const last = rc(end);
  return [
    new Given(rows.cell(1), first.row), new Given(cols.cell(1), first.col),
    new Given(rows.cell(length), last.row), new Given(cols.cell(length), last.col),
  ];
});

const digitLinks = pathSpecs.flatMap(({ rows, cols, digits, length }) =>
  Array.from({ length }, (_, i) => new Or(playable.map(cell => {
    const { row, col } = rc(cell);
    return new And([
      new Given(rows.cell(i + 1), row),
      new Given(cols.cell(i + 1), col),
      new SameValues(2, digits.cell(i + 1), cell),
    ]);
  }))));

const targetCages = [
  ['R3C3', 'R3C4', 'R3C5', 'R4C4'],
  ['R5C6', 'R6C5', 'R6C6', 'R6C7'],
];
const targetVisits = pathSpecs.flatMap(({ rows, cols, length }) => targetCages.map(target =>
  new Or(Array.from({ length }, (_, i) => target.map(cell => {
    const { row, col } = rc(cell);
    return new And([
      new Given(rows.cell(i + 1), row),
      new Given(cols.cell(i + 1), col),
    ]);
  })).flat())));

const movement = pathSpecs.flatMap(({ rows, cols }) => [
  new Pair(rowMoveKey, 'Sideways or downward rows', ...rows.cells()),
  new Pair(colMoveKey, 'Sideways or downward columns', ...cols.cells()),
]);

const blue = pathSpecs.find(path => path.key === 'B');
const blueSegmentChoices = Array.from({ length: 1 << (blue.length - 1) }, (_, mask) => {
  const segments = [[]];
  const boundaryConstraints = [];
  for (let i = 0; i < blue.length; i++) {
    segments[segments.length - 1].push(blue.digits.cell(i + 1));
    if (i === blue.length - 1) continue;
    const crosses = (mask & (1 << i)) !== 0;
    const rowPair = [blue.rows.cell(i + 1), blue.rows.cell(i + 2)];
    const colPair = [blue.cols.cell(i + 1), blue.cols.cell(i + 2)];
    boundaryConstraints.push(crosses ? new Or([
      new Pair(differentBandKey, 'Crosses box row', ...rowPair),
      new Pair(differentBandKey, 'Crosses box column', ...colPair),
    ]) : new And([
      new Pair(sameBandKey, 'Stays in box row', ...rowPair),
      new Pair(sameBandKey, 'Stays in box column', ...colPair),
    ]));
    if (crosses) segments.push([]);
  }
  return new And([
    ...boundaryConstraints,
    new EqualSum(...segments),
  ]);
});

const green = pathSpecs.find(path => path.key === 'G');
const red = pathSpecs.find(path => path.key === 'R');

return [
  new Shape('9x9'),
  new Given('R4C7', 6),
  new Given('R5C3', 3),
  new Given('R7C7', 3),
  new Given('R8C4', 3),
  new Cage(29, 'R3C3', 'R3C4', 'R3C5', 'R4C4'),
  new Cage(16, 'R5C6', 'R6C5', 'R6C6', 'R6C7'),
  new Cage(12, 'R9C1', 'R9C2'),
  new Cage(7, 'R9C8', 'R9C9'),
  ...pathSpecs.flatMap(({ rows, cols, digits }) => [rows, cols, digits]),
  ...endpoints,
  ...movement,
  ...distinctCells,
  ...avoidBlocked,
  ...digitLinks,
  ...targetVisits,
  new Or(blueSegmentChoices),
  new Pair(greenDifferenceKey, 'Green adjacent difference at least 5', ...green.digits.cells()),
  ...red.digits.cells().map(cell => new Given(cell, 5, 6, 7, 8, 9)),
];
