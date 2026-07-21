// Title: Given But Hidden
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=y2PeyihdkFY
// Source: https://sudokupad.app/j6e5jfpw08

// The fog is a reveal mechanism. All circled digits are final-grid givens;
// their multiplicities (one 1, two 2s, three 3s, and so on) encode the count rule.
const circledGivens = {
  1: ['R2C7'],
  2: ['R3C6', 'R7C5'],
  3: ['R2C3', 'R3C8', 'R6C2'],
  5: ['R2C6', 'R4C5', 'R5C7', 'R6C3', 'R7C4'],
  6: ['R1C1', 'R3C5', 'R4C8', 'R5C3', 'R7C2', 'R8C7'],
  8: ['R2C4', 'R3C2', 'R4C6', 'R5C1', 'R6C7', 'R7C3', 'R8C5', 'R9C9'],
  9: ['R1C9', 'R2C2', 'R3C4', 'R4C3', 'R5C8', 'R6C5', 'R7C7', 'R8C6', 'R9C1'],
};

const givens = Object.entries(circledGivens).flatMap(([value, cells]) =>
  cells.map(cell => new Given(cell, Number(value))));

const blackDots = [
  ['R2C4', 'R2C5'],
  ['R3C2', 'R3C3'],
  ['R4C7', 'R4C8'],
  ['R4C9', 'R5C9'],
  ['R5C4', 'R6C4'],
  ['R5C9', 'R6C9'],
  ['R8C4', 'R8C5'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...blackDots,
  // The framed cells read as 10 * R5C5 + R5C6 = 34 circled givens.
  new Sum(34, ['R5C5', 10], 'R5C6'),
];
