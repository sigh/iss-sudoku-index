// Title: Gamma and Epsilon Sudoku
// Author: Tyrgannus
// Video: https://www.youtube.com/watch?v=BW4QRK9yB5k
// Source: https://tinyurl.com/ykdhp9fy

// Normal sudoku rules apply. Black dots require a 1:3 ratio between the two
// cells; white dots require a difference of 5. The rules state undrawn dot
// positions carry no information ("Not all dots are necessarily given (No
// negative constraint)"), so no negative (Strict Kropki) constraint is
// added for the absent positions.

const ratioKey = Pair.fnToKey((a, b) => a === b * 3 || b === a * 3, 9);
const differenceKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 5, 9);

const blackDots = [
  ['R1C4', 'R2C4'],
  ['R1C6', 'R2C6'],
  ['R6C1', 'R7C1'],
  ['R6C9', 'R7C9'],
  ['R8C4', 'R8C5'],
  ['R8C5', 'R8C6'],
].map(([a, b]) => new Pair(ratioKey, 'Ratio', a, b));

const whiteDots = [
  ['R1C5', 'R2C5'],
  ['R1C1', 'R2C1'],
  ['R1C9', 'R2C9'],
  ['R5C2', 'R5C3'],
  ['R5C7', 'R5C8'],
  ['R8C5', 'R9C5'],
  ['R8C3', 'R8C4'],
  ['R8C6', 'R8C7'],
  ['R4C7', 'R4C8'],
  ['R4C2', 'R4C3'],
].map(([a, b]) => new Pair(differenceKey, 'Difference', a, b));

return [
  new Shape('9x9'),
  new Given('R2C1', 1),
  new Given('R2C9', 9),
  new Given('R4C3', 2),
  new Given('R4C7', 8),
  new Given('R6C3', 3),
  new Given('R6C7', 7),
  new Given('R7C4', 5),
  new Given('R7C6', 6),
  ...blackDots,
  ...whiteDots,
];
