// Title: Divisores Dubiationis
// Author: Dr Logic
// Video: https://www.youtube.com/watch?v=rilaoNyWiFs
// Source: https://sudokupad.app/8n4fl3eo28

// Normal sudoku. Green and purple divisor lines are read from one end: each
// digit after the first divides the sum of the previous digits. Green lines do
// not repeat digits; purple lines may repeat. Red line digits alternate parity.
// Black dots are 1:2 ratio, and the white dot is consecutive.

const greenLines = [
  ['R3C1', 'R3C2', 'R3C3', 'R2C4', 'R2C5', 'R2C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R8C9', 'R9C9'],
  ['R7C6', 'R8C5', 'R9C6'],
  ['R5C4', 'R6C3', 'R7C2', 'R8C2', 'R9C2'],
];

const purpleLines = [
  ['R9C4', 'R9C3', 'R8C2'],
  ['R7C4', 'R6C5'],
  ['R6C6', 'R7C7'],
  ['R6C4', 'R5C3', 'R4C2', 'R3C2', 'R2C2'],
];

const redLines = [
  ['R3C7', 'R4C7', 'R3C8', 'R4C8', 'R3C9', 'R4C9'],
];

const divisorNfa = NFA.encodeSpec({
  startState: 0,
  transition(sum, value) {
    if (sum === 0) return value;
    if (sum % value !== 0) return undefined;
    const nextSum = sum + value;
    if (nextSum > 45) return undefined;
    return nextSum;
  },
  accept: () => true,
}, 9);

const divisorLine = cells => new Or([
  new NFA(divisorNfa, 'divisor', ...cells),
  new NFA(divisorNfa, 'divisor', ...[...cells].reverse()),
]);

const parityKey = Pair.fnToKey((a, b) => a % 2 !== b % 2, 9);

const greenDivisors = greenLines.map(divisorLine);
const greenAllDifferent = greenLines.map(cells => new AllDifferent(...cells));
const purpleDivisors = purpleLines.map(divisorLine);
const redParities = redLines.map(cells => new Pair(parityKey, 'parity line', ...cells));
const dots = [
  new BlackDot('R1C8', 'R1C9'),
  new BlackDot('R3C1', 'R3C2'),
  new BlackDot('R4C3', 'R5C3'),
  new BlackDot('R9C7', 'R9C8'),
  new WhiteDot('R5C3', 'R5C4'),
];

return [
  new Shape('9x9'),
  new Given('R6C7', 4),

  ...greenDivisors,
  ...greenAllDifferent,
  ...purpleDivisors,
  ...redParities,

  ...dots,
];
