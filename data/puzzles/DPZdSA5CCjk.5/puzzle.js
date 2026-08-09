// Title: 9/1/22 - GAS: Love and Thermos
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=DPZdSA5CCjk
// Source: https://tinyurl.com/ybf6mj9j
//
// Normal sudoku rules apply. Digits in cages cannot repeat and must sum to
// the given total. Along a slow thermometer, digits must not decrease going
// from bulb to tip (adjacent cells on the line may repeat, unlike a normal
// thermometer). Slow thermometers have no dedicated ISS class, so each is
// built as a `Pair` walking the line bulb-to-tip with the relation a <= b,
// which also allows equal neighbours as the rule requires.

const cages = [
  [10, 'R3C1', 'R4C1'],
  [10, 'R2C2', 'R3C2'],
  [11, 'R2C3', 'R3C3'],
  [11, 'R3C4', 'R4C4'],
  [10, 'R4C5', 'R5C5'],
  [9, 'R3C6', 'R4C6'],
  [9, 'R2C7', 'R3C7'],
  [10, 'R2C8', 'R3C8'],
  [10, 'R3C9', 'R4C9'],
  [4, 'R5C8', 'R5C9'],
  [8, 'R6C7', 'R6C8'],
  [8, 'R7C6', 'R7C7'],
  [18, 'R8C4', 'R8C5', 'R8C6', 'R9C5'],
  [11, 'R7C3', 'R7C4'],
  [9, 'R6C2', 'R6C3'],
  [9, 'R5C1', 'R5C2'],
];

// Slow-thermometer lines, bulb (round end) first, tip last.
const thermos = [
  ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9', 'R4C9', 'R3C9', 'R2C8', 'R2C7', 'R3C6'],
  ['R4C5', 'R3C4', 'R2C3', 'R2C2', 'R3C1', 'R4C1', 'R5C1', 'R6C2', 'R7C3', 'R8C4'],
];

const slowKey = Pair.fnToKey((a, b) => a <= b, 9);

return [
  new Shape('9x9'),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
  ...thermos.map(
    (cells) => new Pair(slowKey, 'slow thermometer', ...cells)),
];
