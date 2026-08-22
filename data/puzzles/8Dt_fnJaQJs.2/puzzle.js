// Title: Nov 22, 2021: Answer Eight
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=8Dt_fnJaQJs
// Source: https://tinyurl.com/4s4h555v

// Normal sudoku rules apply (default row/column/box all-different on the 9x9
// grid). If two cells are separated by a grey dot, the digits they contain
// must be able to produce 8 via one of the four standard arithmetic
// operations (+, -, x, /). If two cells are NOT separated by a dot, this may
// or may not also hold -- the rule states no negative constraint on undotted
// pairs, so only the drawn dots are encoded.
//
// canMake8(a, b): true if a+b, |a-b|, a*b, or an exact a/b or b/a equals 8.
const canMake8 = (a, b) =>
  a + b === 8 ||
  Math.abs(a - b) === 8 ||
  a * b === 8 ||
  (b !== 0 && a % b === 0 && a / b === 8) ||
  (a !== 0 && b % a === 0 && b / a === 8);
const canMake8Key = Pair.fnToKey(canMake8, 9);

// Grey dots, transcribed from the `circle` array in the source payload
// (each entry is a 2-cell path between orthogonally adjacent cells).
const greyDots = [
  ['R2C1', 'R2C2'],
  ['R2C2', 'R2C3'],
  ['R1C8', 'R2C8'],
  ['R8C7', 'R8C8'],
  ['R8C8', 'R8C9'],
  ['R8C2', 'R9C2'],
  ['R5C5', 'R5C6'],
  ['R4C5', 'R5C5'],
  ['R5C4', 'R5C5'],
  ['R8C2', 'R8C3'],
  ['R2C7', 'R2C8'],
  ['R6C4', 'R6C5'],
  ['R6C5', 'R6C6'],
  ['R8C1', 'R8C2'],
  ['R2C8', 'R2C9'],
  ['R5C1', 'R5C2'],
  ['R5C8', 'R5C9'],
  ['R6C5', 'R7C5'],
  ['R4C8', 'R4C9'],
  ['R6C1', 'R6C2'],
  ['R7C5', 'R7C6'],
  ['R3C4', 'R3C5'],
];

return [
  new Shape('9x9'),

  new Given('R2C4', 3),
  new Given('R2C6', 8),
  new Given('R4C2', 6),
  new Given('R4C7', 4),
  new Given('R6C3', 8),
  new Given('R6C8', 3),
  new Given('R8C4', 7),
  new Given('R8C6', 5),

  ...greyDots.map(
    ([a, b]) => new Pair(canMake8Key, 'grey dot: can make 8', a, b)),
];
