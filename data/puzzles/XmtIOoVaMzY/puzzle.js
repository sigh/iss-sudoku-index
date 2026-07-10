// Title: 24 Squares!
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=XmtIOoVaMzY
// Source: https://sudokupad.app/oso53h7rd2

// Normal sudoku rules apply. Each marked line reads as a square number from
// left to right, except R3C1-R4C1 which is read from top to bottom.

const twoDigitSquares = new Set([16, 25, 36, 49, 64, 81]);
const threeDigitSquares = new Set([
  169, 196, 256, 289, 324, 361, 529, 576, 625, 729, 784, 841, 961,
]);

const twoDigitSquareKey = Pair.fnToKey((a, b) => {
  return twoDigitSquares.has(10 * a + b);
}, 9);

const threeDigitSquareNfa = NFA.encodeSpec({
  startState: { length: 0, value: 0 },
  transition: ({ length, value }, digit) => {
    if (length >= 3) return undefined;
    return { length: length + 1, value: 10 * value + digit };
  },
  accept: ({ length, value }) => {
    return length === 3 && threeDigitSquares.has(value);
  },
}, 9);

const twoCellLines = [
  ['R2C1', 'R1C2'],
  ['R3C2', 'R2C3'],
  ['R4C3', 'R3C4'],
  ['R7C6', 'R6C7'],
  ['R8C7', 'R7C8'],
  ['R9C8', 'R8C9'],
  ['R4C6', 'R3C7'],
  ['R2C8', 'R1C9'],
  ['R7C3', 'R6C4'],
  ['R9C1', 'R8C2'],
  ['R1C1', 'R2C2'],
  ['R3C3', 'R4C4'],
  ['R6C6', 'R7C7'],
  ['R8C8', 'R9C9'],
  ['R8C1', 'R9C2'],
  ['R6C3', 'R7C4'],
  ['R3C6', 'R4C7'],
  ['R1C8', 'R2C9'],
  ['R2C7', 'R3C8'],
  ['R7C2', 'R8C3'],
  ['R5C2', 'R5C3'],
  ['R5C7', 'R5C8'],
  ['R3C1', 'R4C1'],
];

return [
  new Shape('9x9'),
  new Given('R1C7', 4),
  ...twoCellLines.map(cells => new Pair(twoDigitSquareKey, '2-digit square', ...cells)),
  new NFA(threeDigitSquareNfa, '3-digit square', 'R5C4', 'R5C5', 'R5C6'),
];
