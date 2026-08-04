// Title: Jan 18, '23: 10s Digit Product
// Author: clover!
// Video: https://www.youtube.com/watch?v=HJ3aT7kBtSc
// Source: https://tinyurl.com/2p85dadt

// Normal sudoku rules apply. Each circle sits between two orthogonally
// adjacent cells; its value is the tens digit of the product of the two
// cells' digits (e.g. a clue of 3 permits 5x7=35). Encoded below with a
// custom Pair relation per circle value, keyed on the tens digit of a*b.

// Circles: cell pair and printed value, transcribed from the payload's
// `circle` array (each entry's `cells` and `value`).
const circles = [
  [['R2C2', 'R3C2'], 1],
  [['R3C2', 'R3C1'], 1],
  [['R4C2', 'R3C2'], 1],
  [['R3C2', 'R3C3'], 1],
  [['R2C7', 'R2C6'], 2],
  [['R2C7', 'R1C7'], 2],
  [['R2C8', 'R2C7'], 2],
  [['R2C7', 'R3C7'], 2],
  [['R6C8', 'R7C8'], 1],
  [['R7C7', 'R7C8'], 1],
  [['R8C8', 'R7C8'], 1],
  [['R7C8', 'R7C9'], 1],
  [['R8C4', 'R8C3'], 2],
  [['R7C3', 'R8C3'], 2],
  [['R8C3', 'R8C2'], 2],
  [['R8C3', 'R9C3'], 2],
  [['R7C5', 'R6C5'], 2],
  [['R3C5', 'R4C5'], 2],
  [['R5C6', 'R5C7'], 3],
  [['R5C4', 'R5C3'], 3],
  [['R5C3', 'R5C2'], 2],
  [['R5C8', 'R5C7'], 1],
  [['R3C5', 'R2C5'], 3],
  [['R8C5', 'R7C5'], 4],
  [['R9C7', 'R9C8'], 1],
  [['R1C4', 'R1C5'], 1],
];

// Givens, transcribed from the payload grid's `value`/`given` cells.
const givens = [
  ['R2C7', 3], ['R3C2', 3], ['R3C4', 4], ['R3C6', 8],
  ['R4C3', 6], ['R4C7', 7], ['R6C3', 8], ['R6C7', 4],
  ['R7C4', 9], ['R7C6', 5], ['R7C8', 3], ['R8C3', 3],
];

// One Pair key per distinct tens-digit target, reused across every circle
// with that value.
const tensDigitKeys = new Map();
function tensDigitKey(value) {
  if (!tensDigitKeys.has(value)) {
    tensDigitKeys.set(
      value,
      Pair.fnToKey((a, b) => Math.floor(a * b / 10) === value, 9));
  }
  return tensDigitKeys.get(value);
}

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...circles.map(([cells, value]) =>
    new Pair(tensDigitKey(value), `${value}`, ...cells)),
];
