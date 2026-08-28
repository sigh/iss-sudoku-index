// Title: Feb 18, 2022: Palindrome Quads
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=HaK08DW5pJE
// Source: https://tinyurl.com/2p988dyj

// Rules encoded below:
//  - Normal sudoku rules apply (rows/cols/boxes: default Shape all-different).
//  - Grey line: the digits along it must form a palindrome.
//  - White circle: the printed digits must each appear somewhere among the
//    4 cells of the surrounding 2x2 block (Quad's native semantics).
// No givens in the payload.

// Grey palindrome lines (payload key "palindrome", lines[0..5]).
const palindromeLines = [
  ['R3C2', 'R3C3', 'R2C4', 'R2C5'],
  ['R7C8', 'R7C7', 'R8C6', 'R8C5'],
  ['R4C5', 'R4C6', 'R3C7', 'R3C8'],
  ['R2C2', 'R1C3', 'R1C4'],
  ['R9C6', 'R9C7', 'R8C8'],
  ['R7C2', 'R7C3', 'R6C4', 'R6C5'],
];

// White-circle quadruples (payload key "quadruple"); each cell list is a
// 2x2 block, values are the digits the circle prints for that block.
const quads = [
  { topLeft: 'R1C4', values: [1, 2, 3, 4] },
  { topLeft: 'R3C2', values: [3, 4, 5, 6] },
  { topLeft: 'R8C5', values: [4, 5, 6, 7] },
  { topLeft: 'R6C7', values: [6, 7, 8, 9] },
  { topLeft: 'R5C4', values: [4, 5, 7, 8] },
  { topLeft: 'R7C2', values: [1, 2, 4, 5] },
  { topLeft: 'R2C7', values: [1, 2, 6, 7] },
  { topLeft: 'R4C5', values: [1, 2, 3, 8] },
  { topLeft: 'R4C7', values: [1] },
  { topLeft: 'R5C2', values: [2] },
];

return [
  new Shape('9x9'),

  ...palindromeLines.map((cells) => new Palindrome(...cells)),

  ...quads.map(({ topLeft, values }) => new Quad(topLeft, ...values)),
];
