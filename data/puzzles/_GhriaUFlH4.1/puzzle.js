// Title: August 15, 2023: Kropki Pairs
// Author: clover!
// Video: https://www.youtube.com/watch?v=_GhriaUFlH4
// Source: https://tinyurl.com/mzmxjdc9

// Normal sudoku rules apply. White dots join orthogonally adjacent cells
// whose digits are consecutive (WhiteDot); black dots join orthogonally
// adjacent cells in a 1:2 ratio (BlackDot). The rules state that not every
// possible dot is necessarily drawn, so an undotted adjacent pair carries no
// constraint (no StrictKropki negative rule) -- there are no other clues or
// givens.

// White dots (consecutive), one WhiteDot per drawn pair (raw `difference`).
const whiteDots = [
  ['R1C5', 'R1C4'], ['R1C5', 'R1C6'], ['R1C6', 'R1C7'],
  ['R9C7', 'R9C6'], ['R9C8', 'R9C7'], ['R9C9', 'R9C8'],
  ['R9C1', 'R8C1'], ['R3C9', 'R2C9'], ['R4C9', 'R3C9'],
  ['R5C1', 'R6C1'], ['R4C1', 'R5C1'], ['R4C1', 'R3C1'],
  ['R8C5', 'R8C4'], ['R8C3', 'R8C4'], ['R8C2', 'R8C3'],
  ['R4C4', 'R4C5'], ['R5C2', 'R5C3'], ['R7C6', 'R7C7'],
].map(cells => new WhiteDot(...cells));

// Black dots (1:2 ratio), one BlackDot per drawn pair (raw `ratio`).
const blackDots = [
  ['R1C2', 'R1C1'], ['R1C2', 'R1C3'], ['R1C3', 'R1C4'],
  ['R9C3', 'R9C4'], ['R9C5', 'R9C4'], ['R9C6', 'R9C5'],
  ['R1C9', 'R2C9'], ['R7C1', 'R8C1'], ['R7C1', 'R6C1'],
  ['R5C9', 'R4C9'], ['R6C9', 'R5C9'], ['R7C9', 'R6C9'],
  ['R2C7', 'R2C8'], ['R2C7', 'R2C6'], ['R2C5', 'R2C6'],
  ['R6C6', 'R6C5'], ['R5C8', 'R5C7'], ['R3C3', 'R3C4'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...whiteDots,
  ...blackDots,
];
