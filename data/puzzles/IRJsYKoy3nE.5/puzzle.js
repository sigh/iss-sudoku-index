// Title: May 7, 2022: Sequence Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=IRJsYKoy3nE
// Source: https://tinyurl.com/3u8yt87h
//
// Normal Sudoku rules apply. Each grey line must consist of an arithmetic
// sequence: a run of numbers with a constant difference between consecutive
// terms (e.g. 1-2-3-4 or 3-5-7-9), read from either end of the line.
//
// Every drawn line is exactly 3 cells long, so "arithmetic sequence" reduces
// to: the middle term is the average of the two end terms. For three terms
// a, b, c this is direction-independent -- reading a,b,c or c,b,a both give
// the same relation (a + c = 2b) -- so "the sequence can begin at either
// end" needs no separate encoding for lines this short.
const lines = [
  ['R4C2', 'R3C3', 'R2C4'],
  ['R8C6', 'R7C7', 'R6C8'],
  ['R8C3', 'R7C4', 'R6C5'],
  ['R4C5', 'R3C6', 'R2C7'],
  ['R5C7', 'R4C8', 'R3C9'],
  ['R5C3', 'R6C2', 'R7C1'],
  ['R3C1', 'R2C2', 'R1C3'],
  ['R9C7', 'R8C8', 'R7C9'],
  ['R5C6', 'R5C5', 'R5C4'],
];

return [
  new Shape('9x9'),

  new Given('R1C8', 8), new Given('R1C9', 7),
  new Given('R2C2', 6), new Given('R2C8', 1),
  new Given('R3C3', 2), new Given('R3C6', 4),
  new Given('R4C8', 3),
  new Given('R5C1', 3), new Given('R5C5', 5), new Given('R5C9', 4),
  new Given('R6C2', 4),
  new Given('R7C4', 3), new Given('R7C7', 5),
  new Given('R8C2', 1), new Given('R8C8', 2),
  new Given('R9C1', 4), new Given('R9C2', 5),

  // a - 2*b + c = 0  <=>  a + c = 2b, the arithmetic-sequence condition for
  // a 3-term line [a, b, c].
  ...lines.map(([a, b, c]) => new Sum(0, a, [b, -2], c)),
];
