// Title: More Powerful Than Hate
// Author: FullDeck and Missing a Few Cards
// Video: https://www.youtube.com/watch?v=da7t19-CXGM
// Source: https://sudokupad.app/za3z46tyiu

// Standard sudoku rules apply: the digits 1-9 appear in every row, column,
// and box.

// Outer heart: an Entropic Line. Any set of three adjacent cells along the
// line must contain a low digit (1-3), a middle digit (4-6), and a high
// digit (7-9). Drawn as one open stroke; the two ends (R3C9, R4C9) are
// adjacent but not joined -- the heart's top notch.
const outerHeart = [
  'R3C9', 'R2C8', 'R1C7', 'R1C6', 'R2C5', 'R1C4', 'R1C3', 'R2C2', 'R3C1',
  'R4C1', 'R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5', 'R8C6', 'R7C7', 'R6C8',
  'R5C9', 'R4C9',
];

// Middle heart: two Renban lines, one per side of the heart. Digits on
// each line form a set of non-repeating consecutive digits in some order.
const middleHeartRight = [
  'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C8', 'R3C8', 'R2C7', 'R2C6',
];
const middleHeartLeft = [
  'R3C5', 'R2C4', 'R2C3', 'R3C2', 'R4C2', 'R5C2', 'R6C3', 'R7C4',
];

// Inner heart: a Parity Line, drawn as a closed loop. Digits along the
// line alternate odd/even, including across the loop's join, so the first
// cell repeats at the end.
const innerHeart = [
  'R3C6', 'R3C7', 'R4C7', 'R5C7', 'R6C6', 'R7C5', 'R6C4', 'R5C3', 'R4C3',
  'R3C3', 'R3C4', 'R4C5', 'R3C6',
];
const parityKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);

// Consecutive Pairs: digits in cells separated by a white dot are
// consecutive.
const whiteDots = [
  ['R7C5', 'R8C5'], ['R3C5', 'R4C5'], ['R2C5', 'R3C5'], ['R8C5', 'R9C5'],
  ['R1C5', 'R2C5'], ['R6C5', 'R7C5'], ['R7C7', 'R8C7'], ['R2C1', 'R3C1'],
  ['R6C1', 'R7C1'], ['R6C3', 'R7C3'], ['R2C3', 'R3C3'], ['R8C1', 'R9C1'],
  ['R5C3', 'R5C4'], ['R5C5', 'R5C6'], ['R5C8', 'R5C9'],
];

return [
  new Shape('9x9'),

  new Given('R1C1', 2),
  new Given('R7C2', 1),
  new Given('R8C3', 4),
  new Given('R8C8', 2),
  new Given('R9C9', 6),

  new Entropic(...outerHeart),

  new Renban(...middleHeartRight),
  new Renban(...middleHeartLeft),

  new Pair(parityKey, 'parity heart', ...innerHeart),

  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
];
