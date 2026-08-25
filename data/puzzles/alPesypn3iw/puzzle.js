// Title: Chris Cassidy Tribute
// Author: Mark Goodliffe
// Video: https://www.youtube.com/watch?v=alPesypn3iw
// Source: https://app.crackingthecryptic.com/webapp/qMQ7jq3mNR

// Normal sudoku. XV: X marks an adjacent pair summing to 10, V marks an
// adjacent pair summing to 5; StrictXV enforces that every unmarked adjacent
// pair sums to neither 5 nor 10 -- every such pair in the grid is drawn.
// Three colour regions (no outline, fill only) each sum to 63; digits within
// a region are not required to be distinct (Sum, not Cage).

const vPairs = [
  ['R1C4', 'R1C5'],
  ['R2C4', 'R2C5'],
  ['R1C8', 'R1C9'],
  ['R3C7', 'R3C8'],
  ['R5C5', 'R5C6'],
  ['R6C8', 'R6C9'],
  ['R6C9', 'R7C9'],
  ['R9C5', 'R9C6'],
];

const xPairs = [
  ['R2C5', 'R3C5'],
  ['R3C8', 'R4C8'],
  ['R4C2', 'R4C3'],
  ['R5C1', 'R6C1'],
  ['R5C2', 'R6C2'],
  ['R5C6', 'R5C7'],
  ['R7C3', 'R7C4'],
  ['R7C7', 'R7C8'],
  ['R7C9', 'R8C9'],
  ['R8C2', 'R8C3'],
  ['R8C7', 'R8C8'],
  ['R9C1', 'R9C2'],
  ['R9C4', 'R9C5'],
];

// Letter-shaped colour regions (fill colour, from underlays): grey "I",
// yellowgreen "S", deepskyblue "S".
const letterI = ['R1C1', 'R1C2', 'R1C3', 'R2C2', 'R3C2', 'R4C2', 'R5C1', 'R5C2', 'R5C3'];
const letterS1 = ['R3C4', 'R3C5', 'R3C6', 'R4C4', 'R5C4', 'R5C5', 'R5C6', 'R6C6', 'R7C4', 'R7C5', 'R7C6'];
const letterS2 = ['R5C7', 'R5C8', 'R5C9', 'R6C7', 'R7C7', 'R7C8', 'R7C9', 'R8C9', 'R9C7', 'R9C8', 'R9C9'];

return [
  new Shape('9x9'),
  ...vPairs.map((cells) => new V(...cells)),
  ...xPairs.map((cells) => new X(...cells)),
  new StrictXV(),
  new Sum(63, ...letterI),
  new Sum(63, ...letterS1),
  new Sum(63, ...letterS2),
];
