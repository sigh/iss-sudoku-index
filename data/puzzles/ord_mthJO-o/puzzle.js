// Title: Crosswalk
// Author: zetamath
// Video: https://www.youtube.com/watch?v=ord_mthJO-o
// Source: https://sudokupad.app/sk0v8nqndi

// Normal Sudoku rules apply. Pink lines are renbans; gold lines are nabners;
// green lines are whispers with difference 5; blue lines have equal box-segment sums.
// Each table is transcribed from the correspondingly coloured drawn lines.
const pinkRenbans = [
  ['R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5'],
  ['R6C3', 'R7C3', 'R8C3', 'R9C3'],
  ['R5C2', 'R6C2', 'R7C2', 'R7C1'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R6C9', 'R7C9', 'R7C8', 'R7C7'],
];

const goldNabners = [
  ['R2C2', 'R2C1', 'R3C1', 'R3C2'],
  ['R3C8', 'R3C9', 'R4C9', 'R4C8'],
  ['R8C6', 'R9C6', 'R9C7', 'R9C8'],
  ['R5C7', 'R6C7'],
];

const greenWhispers = [
  ['R8C2', 'R8C1', 'R9C1', 'R9C2'],
  ['R9C9', 'R8C9', 'R8C8', 'R8C7'],
  ['R5C8', 'R6C8'],
  ['R5C6', 'R6C6'],
];

const blueRegionSumLines = [
  ['R2C7', 'R3C7', 'R3C6', 'R3C5', 'R3C4', 'R4C3', 'R5C3'],
];

// PairX checks every pair on a nabner, including non-adjacent cells.
const nabnerKey = PairX.fnToKey((a, b) => Math.abs(a - b) > 1, 9);

return [
  new Shape('9x9'),
  ...pinkRenbans.map(cells => new Renban(...cells)),
  ...goldNabners.map(cells => new PairX(nabnerKey, 'Nabner', ...cells)),
  ...greenWhispers.map(cells => new Whisper(5, ...cells)),
  ...blueRegionSumLines.map(cells => new RegionSumLine(...cells)),
];
