// Title: Dippin' Dots
// Author: Chris Napolitano
// Video: https://www.youtube.com/watch?v=4dgGvxj2ljE
// Source: https://sudokupad.app/8jf1461dp3

// Normal sudoku rules apply. Olive dots join opposite-parity digits differing
// by at least 5. Lavender dots join consecutive digits in different thirds.

const oliveKey = Pair.fnToKey(
  (a, b) => (a % 2) !== (b % 2) && Math.abs(a - b) >= 5, 9);
const lavenderKey = Pair.fnToKey(
  (a, b) => Math.abs(a - b) === 1 &&
    Math.floor((a - 1) / 3) !== Math.floor((b - 1) / 3),
  9);

const oliveDots = [
  ['R1C1', 'R1C2'], ['R1C3', 'R1C4'],
  ['R1C6', 'R1C7'], ['R1C8', 'R1C9'],
  ['R3C6', 'R3C7'], ['R4C2', 'R5C2'],
  ['R4C8', 'R4C9'], ['R6C5', 'R7C5'],
  ['R6C7', 'R6C8'], ['R7C1', 'R8C1'],
];
const lavenderDots = [
  ['R3C4', 'R3C5'], ['R5C7', 'R5C8'],
  ['R6C1', 'R7C1'], ['R6C2', 'R6C3'],
  ['R7C8', 'R7C9'], ['R8C4', 'R9C4'],
  ['R9C3', 'R9C4'],
];
const cages = [
  [13, 'R2C5', 'R2C6', 'R3C5', 'R3C6'],
  [22, 'R4C8', 'R4C9', 'R5C7', 'R5C8'],
  [14, 'R1C8', 'R1C9', 'R2C9'],
  [14, 'R8C3', 'R8C4', 'R9C4'],
  [25, 'R4C2', 'R5C2', 'R6C1', 'R6C2', 'R7C1'],
  [18, 'R7C9', 'R8C9', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...oliveDots.map(cells => new Pair(oliveKey, 'Olive dot', ...cells)),
  ...lavenderDots.map(cells => new Pair(lavenderKey, 'Lavender dot', ...cells)),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
