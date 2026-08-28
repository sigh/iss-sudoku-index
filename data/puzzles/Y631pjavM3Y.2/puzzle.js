// Title: Feb. 28, 2022: Rock Steady
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=Y631pjavM3Y
// Source: https://tinyurl.com/2p9xr5fu

// Normal sudoku rules. Digits in cells directly connected by a green line
// must differ by at least 5 (a German whisper line). The green lines form
// four "rock" shapes: an eight-cell closed loop plus a four-cell diagonal
// chord through its interior. The payload draws each loop as two segments
// (a long arc and a short closer) and the chord as a third segment; each
// segment below is encoded as its own Whisper so no drawn edge is merged
// or dropped, matching the payload's own line list one for one.

// Givens, transcribed from the grid.
const givens = [
  ['R1C1', 9], ['R1C6', 1], ['R1C7', 7], ['R1C8', 6], ['R1C9', 2],
  ['R2C1', 4], ['R3C1', 3], ['R4C1', 8],
  ['R6C9', 9], ['R7C9', 3], ['R8C9', 4],
  ['R9C1', 1], ['R9C2', 6], ['R9C3', 7], ['R9C4', 2], ['R9C9', 8],
];

const whispers = [
  // Loop 1 arc (top-left)
  ['R3C2', 'R2C2', 'R1C3', 'R1C4', 'R2C5', 'R3C5', 'R4C4', 'R4C3'],
  // Loop 1 closer
  ['R4C3', 'R3C2'],
  // Loop 2 arc (top-right)
  ['R2C7', 'R2C8', 'R3C9', 'R4C9', 'R5C8', 'R5C7', 'R4C6', 'R3C6'],
  // Loop 2 closer
  ['R3C6', 'R2C7'],
  // Loop 3 arc (bottom-right)
  ['R7C8', 'R8C8', 'R9C7', 'R9C6', 'R8C5', 'R7C5', 'R6C6', 'R6C7'],
  // Loop 3 closer
  ['R6C7', 'R7C8'],
  // Loop 4 arc (bottom-left)
  ['R8C3', 'R8C2', 'R7C1', 'R6C1', 'R5C2', 'R5C3', 'R6C4', 'R7C4'],
  // Loop 4 closer
  ['R7C4', 'R8C3'],
  // Loop 1 chord
  ['R3C2', 'R2C3', 'R2C4', 'R3C5'],
  // Loop 2 chord
  ['R2C7', 'R3C8', 'R4C8', 'R5C7'],
  // Loop 3 chord
  ['R7C8', 'R8C7', 'R8C6', 'R7C5'],
  // Loop 4 chord
  ['R8C3', 'R7C2', 'R6C2', 'R5C3'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...whispers.map(cells => new Whisper(5, ...cells)),
];
