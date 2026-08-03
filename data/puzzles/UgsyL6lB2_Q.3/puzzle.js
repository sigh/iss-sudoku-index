// Title: May 25, 2023: Renban Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=UgsyL6lB2_Q
// Source: https://tinyurl.com/yy45uzeb

// Normal sudoku rules apply. Each of the 10 drawn lines is a Renban line: its
// digits must form a set of consecutive values, in any order (rules text).

// Givens transcribed from the payload's `grid` values.
const givens = [
  new Given('R1C3', 9), new Given('R1C5', 1), new Given('R1C7', 6),
  new Given('R2C2', 3), new Given('R2C8', 4),
  new Given('R3C1', 8), new Given('R3C9', 5),
  new Given('R5C1', 2), new Given('R5C9', 1),
  new Given('R7C1', 5), new Given('R7C9', 2),
  new Given('R8C2', 6), new Given('R8C8', 7),
  new Given('R9C3', 4), new Given('R9C5', 2), new Given('R9C7', 1),
];

// Renban lines transcribed from the payload's `renban`/`line` arrays (10
// lines, each 3 cells).
const renbanLines = [
  ['R3C2', 'R3C3', 'R2C3'],
  ['R2C7', 'R3C7', 'R3C8'],
  ['R7C2', 'R7C3', 'R8C3'],
  ['R8C7', 'R7C7', 'R7C8'],
  ['R9C6', 'R8C6', 'R8C5'],
  ['R4C9', 'R4C8', 'R5C8'],
  ['R1C4', 'R2C4', 'R2C5'],
  ['R6C1', 'R6C2', 'R5C2'],
  ['R5C7', 'R4C7', 'R4C6'],
  ['R5C3', 'R6C3', 'R6C4'],
].map(cells => new Renban(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...renbanLines,
];
