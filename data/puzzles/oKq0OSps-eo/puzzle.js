// Title: Doubling Season
// Author: Syntheticc
// Video: https://www.youtube.com/watch?v=oKq0OSps-eo
// Source: https://app.crackingthecryptic.com/d9dbe5e4lr

// Rules encoded: normal Sudoku; the 45 drawn circles are a single counting
// set, and their digits have double value in cages, outside totals, comparison
// marks, white dots, and arrow arms. The arrow circle itself is not doubled.
// Circle cells transcribed from the drawn white circles.
const circleCells = [
  'R1C1', 'R1C2', 'R1C6', 'R1C7', 'R1C8',
  'R2C2', 'R2C5', 'R2C6', 'R2C7', 'R2C9',
  'R3C1', 'R3C3', 'R3C4', 'R3C6', 'R3C8',
  'R4C2', 'R4C3', 'R4C5', 'R4C6', 'R4C9',
  'R5C2', 'R5C6', 'R5C7', 'R5C8', 'R5C9',
  'R6C1', 'R6C3', 'R6C4', 'R6C5', 'R6C8',
  'R7C3', 'R7C4', 'R7C5', 'R7C7', 'R7C8',
  'R8C1', 'R8C2', 'R8C4', 'R8C5', 'R8C9',
  'R9C1', 'R9C3', 'R9C4', 'R9C7', 'R9C9',
];
const circled = new Set(circleCells);
const valueMultiplier = cell => circled.has(cell) ? 2 : 1;
const value = cell => [cell, valueMultiplier(cell)];
const valueSum = (total, cells) => cells.every(cell => valueMultiplier(cell) === 1)
  ? new Sum(total, ...cells)
  : new Sum(total, ...cells.map(value));
const valuePair = (name, a, b, predicate) => new Pair(
  Pair.fnToKey((x, y) => predicate(x * valueMultiplier(a), y * valueMultiplier(b)), 9),
  name, a, b
);

// Cage cells and totals transcribed from the ten dashed cages.
const cages = [
  [15, ['R1C3', 'R1C4', 'R1C5', 'R2C3', 'R2C4']],
  [26, ['R2C1', 'R2C2', 'R3C1']],
  [25, ['R2C7', 'R2C8', 'R2C9']],
  [3, ['R4C4', 'R5C4']],
  [12, ['R5C5', 'R5C6']],
  [44, ['R5C7', 'R5C8', 'R5C9']],
  [21, ['R7C1', 'R8C1', 'R9C1']],
  [10, ['R7C6', 'R8C6', 'R9C6']],
  [20, ['R8C9', 'R9C9']],
  [11, ['R3C2', 'R3C3']],
];

return [
  new Shape('9x9'),
  new CountingCircles(...circleCells),
  ...cages.flatMap(([total, cells]) => [new AllDifferent(...cells), valueSum(total, cells)]),
  valueSum(80, ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9']),
  valueSum(80, ['R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C3']),
  valuePair('equals', 'R9C1', 'R9C2', (a, b) => a === b),
  new GreaterThan('R7C3', 'R7C4'),
  new WhiteDot('R5C3', 'R5C4'),
  valuePair('white-dot', 'R7C5', 'R7C6', (a, b) => Math.abs(a - b) === 1),
  valuePair('white-dot', 'R7C8', 'R8C8', (a, b) => Math.abs(a - b) === 1),
  new Arrow('R7C9', 'R8C8', 'R9C8'),
];
