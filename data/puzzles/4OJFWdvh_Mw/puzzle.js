// Title: Red Dead Difference
// Author: Mateo99
// Video: https://www.youtube.com/watch?v=4OJFWdvh_Mw
// Source: https://sudokupad.app/30nule6bb2

const redLines = [
  ['R2C1', 'R2C2', 'R3C1'],
  ['R2C7', 'R1C8', 'R2C9', 'R3C8'],
  ['R4C6', 'R5C6', 'R6C6', 'R6C5', 'R6C4', 'R5C5', 'R5C4', 'R4C4', 'R4C5', 'R3C4'],
  ['R7C9', 'R7C8', 'R8C9'],
  ['R7C6', 'R7C5', 'R8C6', 'R9C6', 'R8C5', 'R7C4', 'R8C4', 'R9C4', 'R8C3'],
];

// The line value is V = L - B. Since each entered 3x3 box sums to 45,
// V = 2 * lineSum - 45 * enteredBoxCount. The possible consecutive set is
// forced to be 1..5 by the short one-box lines, so VL1..VL5 record each V.
const valueOptions = [
  [[1, 23], [3, 24]],
  [[1, 23], [3, 24], [5, 25]],
  [[2, 46], [4, 47]],
  [[1, 23], [3, 24]],
  [[2, 46], [4, 47]],
];

const slowThermoKey = Pair.fnToKey((a, b) => a <= b, 9);

const slowThermo = line => new Or([
  new Pair(slowThermoKey, 'slow thermo', ...line),
  new Pair(slowThermoKey, 'slow thermo', ...line.slice().reverse()),
]);

const lineValue = (line, index) => new Or(
  valueOptions[index].map(([value, sum]) => new And([
    new Sum(sum, ...line),
    new Given(`VL${index + 1}`, value),
  ]))
);

return [
  new Shape('9x9'),
  new Var('L', 'Red line value', 5),
  new AllDifferent('VL1', 'VL2', 'VL3', 'VL4', 'VL5'),
  ...redLines.map(lineValue),
  ...redLines.map(slowThermo),
  new WhiteDot('R4C1', 'R4C2'),
  new WhiteDot('R3C7', 'R4C7'),
  new BlackDot('R6C1', 'R7C1'),
  new BlackDot('R5C8', 'R5C9'),
];
