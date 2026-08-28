// Title: May 17, 2022: Quiet Reflection
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=TS0B01gqNpM
// Source: https://tinyurl.com/yrem8j8t
//
// Normal sudoku rules apply. Digits in cells directly connected by a green
// line must differ by at least 5 (German whisper). The drawn green strokes
// are all one colour and one constraint type; two of them share endpoints
// and together trace a single closed loop, so the shorter of the two is
// folded into the loop below as its wrap-around edge (repeating the loop's
// first cell at the end), per the closed-loop convention for sequential-pair
// classes.

// Closed loop, 16 distinct cells, with the first cell (R1C5) repeated at the
// end to cover the wrap-around edge back to the start.
const LOOP = [
  'R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1', 'R6C2', 'R7C3', 'R8C4',
  'R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9', 'R4C8', 'R3C7', 'R2C6',
  'R1C5',
];

// Remaining open whisper lines.
const OPEN_LINES = [
  ['R5C3', 'R4C4', 'R3C5', 'R4C6', 'R5C7', 'R6C6', 'R7C5', 'R6C4'],
  ['R3C1', 'R2C2', 'R1C3'],
  ['R1C7', 'R2C8', 'R3C9'],
  ['R7C9', 'R8C8', 'R9C7'],
  ['R9C3', 'R8C2', 'R7C1'],
  ['R9C4', 'R8C3', 'R7C2', 'R6C1'],
];

const whispers = [LOOP, ...OPEN_LINES].map(cells => new Whisper(5, ...cells));

return [
  new Shape('9x9'),
  new Given('R1C1', 1),
  new Given('R1C9', 3),
  new Given('R2C7', 7),
  new Given('R3C4', 6),
  new Given('R3C8', 2),
  new Given('R5C4', 9),
  new Given('R6C5', 8),
  new Given('R6C7', 5),
  new Given('R9C9', 4),
  ...whispers,
];
