// Title: Square Threads
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=wecYBkW0QoI
// Source: https://sudokupad.app/n5y2dw7hdb

// Each two-cell line reads as a two-digit square in either direction.
const squareThreadKey = Pair.fnToKey((a, b) => {
  const forward = 10 * a + b;
  const reverse = 10 * b + a;
  return [16, 25, 36, 49, 64, 81].includes(forward) ||
    [16, 25, 36, 49, 64, 81].includes(reverse);
}, 9);

const squareThreads = [
  ['R2C4', 'R2C3'],
  ['R3C2', 'R4C2'],
  ['R3C1', 'R2C1'],
  ['R1C2', 'R1C3'],
  ['R3C4', 'R4C3'],
  ['R2C6', 'R2C7'],
  ['R3C8', 'R4C8'],
  ['R1C7', 'R1C8'],
  ['R3C9', 'R2C9'],
  ['R6C3', 'R7C4'],
  ['R7C6', 'R6C7'],
  ['R3C6', 'R4C7'],
  ['R6C2', 'R7C2'],
  ['R8C3', 'R8C4'],
  ['R7C1', 'R8C1'],
  ['R9C3', 'R9C2'],
  ['R9C7', 'R9C8'],
  ['R7C9', 'R8C9'],
  ['R6C8', 'R7C8'],
  ['R8C6', 'R8C7'],
  ['R2C1', 'R1C2'],
  ['R3C2', 'R2C3'],
  ['R2C7', 'R3C8'],
  ['R1C8', 'R2C9'],
  ['R8C7', 'R7C8'],
  ['R9C8', 'R8C9'],
  ['R7C2', 'R8C3'],
  ['R8C1', 'R9C2'],
].map(cells => new Pair(squareThreadKey, 'Square thread', ...cells));

return [
  new Shape('9x9'),
  new Given('R1C4', 7),
  new Given('R3C2', 5),
  new Given('R5C1', 1),
  new Given('R6C3', 4),
  // The central grey cell is a one-digit square number.
  new Given('R5C5', 1, 4, 9),
  ...squareThreads,
];
