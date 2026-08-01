// Title: 2x Cages for the price of 1
// Author: NurglesGift
// Video: https://www.youtube.com/watch?v=lU7hpaEgUHo
// Source: https://app.crackingthecryptic.com/qjB3NN6jH3

// Normal Sudoku; every outlined cage has digit sum equal to twice its largest
// digit. The grey line is a thermometer, black dots are 1:2 ratios, and the X
// is a sum-to-10 pair. Cage cell lists and marked pairs are transcribed from
// the drawn source geometry.
const maxDoubleSpec = {
  startState: { sum: 0, max: 0 },
  transition: ({ sum, max }, value) => {
    const nextSum = sum + value;
    if (nextSum > 18) return undefined;
    return { sum: nextSum, max: Math.max(max, value) };
  },
  accept: ({ sum, max }) => max > 0 && sum === 2 * max,
  maxDepth: 4,
};
const maxDouble = NFA.encodeSpec(maxDoubleSpec, 9);
const cages = [
  ['R2C1', 'R2C2', 'R3C2', 'R3C1'],
  ['R2C3', 'R2C4', 'R1C4'],
  ['R1C5', 'R1C6', 'R2C6', 'R2C5'],
  ['R3C4', 'R3C5', 'R3C6'],
  ['R1C8', 'R1C9', 'R2C9'],
  ['R1C7', 'R2C7', 'R2C8'],
  ['R4C9', 'R4C8', 'R5C8'],
  ['R6C9', 'R6C8', 'R6C7', 'R7C7'],
  ['R7C9', 'R7C8', 'R8C8'],
  ['R8C9', 'R9C9', 'R9C8'],
  ['R8C7', 'R8C6', 'R7C6'],
  ['R7C5', 'R8C5', 'R8C4'],
  ['R9C4', 'R9C3', 'R9C2'],
  ['R7C3', 'R7C2', 'R8C3', 'R8C2'],
  ['R7C1', 'R6C1', 'R6C2'],
  ['R4C1', 'R5C2', 'R4C2', 'R5C1'],
  ['R4C5', 'R4C4', 'R5C4'],
  ['R4C6', 'R5C6', 'R5C7'],
];

return [
  new Shape('9x9'),
  ...cages.map(cells => new NFA(maxDouble, 'cage sum is twice its maximum', ...cells)),
  new Thermo('R9C4', 'R9C5', 'R9C6', 'R8C5', 'R7C4'),
  new BlackDot('R3C8', 'R4C8'),
  new BlackDot('R3C7', 'R3C8'),
  new BlackDot('R2C5', 'R2C6'),
  new BlackDot('R2C3', 'R2C4'),
  new BlackDot('R5C2', 'R5C3'),
  new BlackDot('R7C1', 'R8C1'),
  new BlackDot('R6C4', 'R7C4'),
  new BlackDot('R8C3', 'R8C4'),
  new BlackDot('R8C4', 'R9C4'),
  new BlackDot('R9C5', 'R9C6'),
  new BlackDot('R7C9', 'R8C9'),
  new BlackDot('R9C8', 'R9C9'),
  new BlackDot('R8C8', 'R9C8'),
  new X('R6C1', 'R6C2'),
];
