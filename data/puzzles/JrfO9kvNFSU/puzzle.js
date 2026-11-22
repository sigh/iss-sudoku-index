// Title: Hitting a Good Balance
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=JrfO9kvNFSU
// Source: https://sudokupad.app/gg3jmhuwel

// Rules encoded:
// - Normal sudoku rules (ISS default).
// - Digits do not repeat on a beige hitline (AllDifferent per line).
// - Along each line, position 1 is the end marked with a square. A digit equal
//   to its position is a hit, otherwise a miss; hit digits and miss digits sum
//   to the same total on each line (NFA below).
// Fog of war is solving UI, not a final-grid constraint.

// The nine hitlines, listed from the squared end (position 1) outward.
// Squares: R1C3, R2C4, R3C1, R5C1, R5C8, R6C5, R8C1, R8C8, R9C6.
const lines = [
  ['R2C4', 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4'],
  ['R9C6', 'R8C6', 'R7C6', 'R6C6', 'R5C6', 'R4C6', 'R3C6', 'R2C6'],
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'],
  ['R3C1', 'R3C2', 'R3C3'],
  ['R6C5', 'R7C5', 'R8C5'],
  ['R5C1', 'R6C2', 'R6C3', 'R5C3', 'R4C2'],
  ['R8C1', 'R7C2', 'R6C1'],
  ['R5C8', 'R5C9', 'R4C9', 'R4C8', 'R4C7'],
  ['R8C8', 'R8C7', 'R7C7', 'R6C7', 'R6C8', 'R6C9'],
];

// State: pos = 1-based position of the next cell; bal = (sum of hit digits) -
// (sum of miss digits) so far. Accept when bal is 0. pos saturates at 10 (no
// line has more than 8 cells); bal stays within +/-45 given distinct digits.
const shape = new Shape('9x9');
const balanceSpec = NFA.encodeSpec({
  startState: { pos: 1, bal: 0 },
  transition: ({ pos, bal }, value) => ({
    pos: Math.min(pos + 1, 10),
    bal: bal + (value === pos ? value : -value),
  }),
  accept: ({ bal }) => bal === 0,
  maxDepth: 9,
}, shape);

return [
  shape,
  ...lines.map(line => new AllDifferent(...line)),
  ...lines.map((line, i) => new NFA(balanceSpec, `hit${i + 1}`, line)),
];
