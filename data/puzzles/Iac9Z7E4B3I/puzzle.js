// Title: Treasure Map
// Author: BremSter
// Video: https://www.youtube.com/watch?v=Iac9Z7E4B3I
// Source: https://app.crackingthecryptic.com/sudoku/9NBn32M3gb

// Normal sudoku rules apply (default row/column/box all-different). Digits
// along an arrow sum to the digit in that arrow's circle. Digits cannot
// repeat on either main diagonal.
//
// The two diagonal strokes are each drawn as three separate segments (one
// per box) that reassemble into the full R1C1-R9C9 and R1C9-R9C1 diagonals;
// a third styling-only line entry renders nothing and is omitted.
//
// One bulb cell, R6C5, is the sum target of four separate arrows (two
// 3-cell arms sharing the pass-through cell R5C5, and two independent
// 2-cell arms) -- each is encoded as its own Arrow.

const arrows = [
  ['R1C2', 'R1C3', 'R1C4'],
  ['R1C9', 'R2C8', 'R3C8', 'R3C9'],
  ['R3C6', 'R2C5', 'R3C4'],
  ['R4C1', 'R4C2', 'R4C3', 'R5C4'],
  ['R5C2', 'R5C1', 'R6C1'],
  ['R6C5', 'R5C5', 'R4C4', 'R3C3'],
  ['R6C5', 'R5C5', 'R4C6', 'R3C7'],
  ['R6C5', 'R6C4', 'R7C3'],
  ['R6C5', 'R6C6', 'R7C7'],
  ['R7C4', 'R8C5', 'R7C6'],
  ['R7C8', 'R8C8', 'R9C8'],
  ['R6C9', 'R6C8', 'R6C7', 'R5C6'],
  ['R4C9', 'R5C9', 'R5C8'],
  ['R9C1', 'R8C2', 'R7C2', 'R7C1'],
].map(cells => new Arrow(...cells));

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  ...arrows,
];
