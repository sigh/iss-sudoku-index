// Title: Krazy Kropki
// Author: Dave Brenn
// Video: https://www.youtube.com/watch?v=LfYEZJbNlCQ
// Source: https://sudokupad.app/n528pv2c16

// Normal sudoku. An outlined cage contributes the sum of its digits to each
// adjacent dot. The upper-left digit of each box is that box's multiplier, and
// all nine multipliers are different. A black dot makes its two cage totals a
// ratio of multiplier:1; a border dot may use either neighbouring multiplier.
// The white dot makes its cage totals consecutive.

const multiCellCages = [
  ['R1C5', 'R1C6'],
  ['R6C1', 'R6C2', 'R6C3'],
  ['R7C5', 'R7C6'],
  ['R7C8', 'R8C7', 'R8C8', 'R9C8'],
  ['R8C3', 'R9C3'],
];

const graph = cellGraph('9x9');
const boxMultipliers = graph.boxes().map(box => box[0]);

// A black-dot branch fixes the applicable multiplier, then uses a coefficient
// Sum for one of the two possible orientations of the ratio.
function scaledTotals(larger, smaller, multiplierCell, multiplier) {
  return new And([
    new Given(multiplierCell, multiplier),
    multiplier === 1 ?
      new EqualSum(larger, smaller) :
      new Sum(0, ...larger, ...smaller.map(cell => [cell, -multiplier])),
  ]);
}

function krazyDot(a, b, multiplierCells) {
  const branches = [];
  for (const multiplierCell of multiplierCells) {
    for (let multiplier = 1; multiplier <= 9; multiplier++) {
      branches.push(scaledTotals(a, b, multiplierCell, multiplier));
      branches.push(scaledTotals(b, a, multiplierCell, multiplier));
    }
  }
  return new Or(branches);
}

const blackDots = [
  [['R1C1'], ['R2C1'], ['R1C1']],
  [['R1C4'], ['R1C5', 'R1C6'], ['R1C4']],
  [['R3C4'], ['R3C5'], ['R1C4']],
  [['R4C1'], ['R5C1'], ['R4C1']],
  [['R4C3'], ['R5C3'], ['R4C1']],
  [['R6C1', 'R6C2', 'R6C3'], ['R7C2'], ['R4C1', 'R7C1']],
  [['R8C3', 'R9C3'], ['R9C4'], ['R7C1', 'R7C4']],
  [['R7C5', 'R7C6'], ['R7C7'], ['R7C4', 'R7C7']],
  [['R7C7'], ['R7C8', 'R8C7', 'R8C8', 'R9C8'], ['R7C7']],
  [['R6C8'], ['R7C8', 'R8C7', 'R8C8', 'R9C8'], ['R4C7', 'R7C7']],
  [['R5C6'], ['R6C6'], ['R4C4']],
  [['R5C5'], ['R6C5'], ['R4C4']],
];

const whiteDot = new Or([
  new Sum(1, 'R2C3', ['R2C4', -1]),
  new Sum(-1, 'R2C3', ['R2C4', -1]),
]);

return [
  new Shape('9x9'),
  new Given('R8C7', 1),
  ...multiCellCages.map(cells => new AllDifferent(...cells)),
  new AllDifferent(...boxMultipliers),
  ...blackDots.map(([a, b, multipliers]) => krazyDot(a, b, multipliers)),
  whiteDot,
];
