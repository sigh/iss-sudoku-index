// Title: Black Sheep
// Author: Leonhard Kohl-Lorting
// Video: https://www.youtube.com/watch?v=QlFkDBqyEDY
// Source: https://app.crackingthecryptic.com/sudoku/FL38N7nN23

// Digits 1-5 appear twice in every row, column, and box except for one
// globally consistent Black Sheep digit, which appears once. Cages sum with
// repeats allowed; grey lines are Austrian Whispers of difference 3; blue
// lines have equal sums in each box segment they cross.
//
// The repeated row and column values cannot occupy ISS main-grid cells, which
// are always all-different. The actual 9x9 answer therefore uses the VG Var
// grid; the pinned 1x1 grid is only a placeholder.

const REF = cellGraph('9x9');
const GRID = REF.makeOverlay('VG');

const groupFor = (cells) => GRID.at(cells);
const unitGroups = [...REF.rows(), ...REF.columns(), ...REF.boxes()];

// One branch per possible globally shared Black Sheep digit. Each branch
// applies its corresponding multiset to every row, column, and box.
const blackSheepUnits = new Or([1, 2, 3, 4, 5].map(sheep => {
  const multiset = [1, 2, 3, 4, 5]
    .flatMap(digit => digit === sheep ? [digit] : [digit, digit])
    .join('_');
  return new And(unitGroups.map(cells =>
    new ContainExact(multiset, ...groupFor(cells))));
}));

// Cage cells and totals transcribed from the drawn cages. Sum allows repeats.
const CAGES = [
  { total: 12, cells: ['R7C4', 'R8C4', 'R8C5', 'R9C4', 'R9C5'] },
  { total: 9, cells: ['R2C2', 'R2C3', 'R3C2', 'R3C3'] },
  { total: 12, cells: ['R5C2', 'R6C2', 'R7C1', 'R7C2'] },
];
const cages = CAGES.map(({ total, cells }) =>
  new Sum(total, ...groupFor(cells)));

// Grey line paths from the source geometry.
const WHISPERS = [
  ['R4C1', 'R5C1', 'R5C2', 'R4C2'],
  ['R8C1', 'R9C1', 'R9C2'],
  ['R8C3', 'R9C4'],
  ['R8C6', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R6C5', 'R5C5', 'R5C6', 'R4C6'],
  ['R2C6', 'R2C7', 'R1C7', 'R1C8', 'R1C9'],
];
const whispers = WHISPERS.map(cells => new Whisper(3, ...groupFor(cells)));

// Each blue path's consecutive in-box segments, transcribed from the source.
// EqualSum expresses the Region Sum rule without making the Var cells into
// ISS main-grid cells.
const REGION_SUM_SEGMENTS = [
  [['R6C1', 'R6C2', 'R6C3'], ['R6C4']],
  [['R6C6'], ['R6C7', 'R6C8', 'R5C8']],
  [['R4C7', 'R4C8', 'R4C9'], ['R3C9', 'R2C9']],
  [['R3C7'], ['R3C6', 'R3C5']],
  [['R1C4', 'R2C4', 'R3C4'], ['R3C3', 'R3C2', 'R3C1']],
];
const regionSumLines = REGION_SUM_SEGMENTS.map(segments =>
  new EqualSum(...GRID.at(segments)));

return [
  new Shape('1x1', 5),
  GRID.toVar('Grid'),
  new Given('R1C1', 1),
  blackSheepUnits,
  ...cages,
  ...whispers,
  ...regionSumLines,
];
