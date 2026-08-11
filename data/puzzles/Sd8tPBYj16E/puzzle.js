// Title: Superking
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=Sd8tPBYj16E
// Source: https://app.crackingthecryptic.com/sudoku/p7T9dHPbR9

// Normal sudoku rules apply (rows, columns, 3x3 boxes). Digits cannot repeat
// on a main diagonal (marked in blue): the payload draws two diagonal lines
// in the same blue colour (#34bbe6), R1C1-R9C9 and R9C1-R1C9, so both carry
// the no-repeat rule -- there is no other rule referencing a second
// blue-marked feature. Digits in two cells which are diagonal neighbours
// (a king's-move diagonal step, not up/down/left/right) must be at least 2
// apart; this is a grid-wide rule over every diagonally-adjacent cell pair,
// independent of the two marked diagonal lines above.

// Every diagonally-adjacent (king's-move diagonal) cell pair in the grid,
// each listed once, computed from the grid coordinates.
const diagonalNeighborPairs = [];
for (let r = 1; r < 9; r++) {
  for (let c = 1; c <= 9; c++) {
    if (c + 1 <= 9) {
      diagonalNeighborPairs.push([makeCellId(r, c), makeCellId(r + 1, c + 1)]);
    }
    if (c - 1 >= 1) {
      diagonalNeighborPairs.push([makeCellId(r, c), makeCellId(r + 1, c - 1)]);
    }
  }
}

return [
  new Shape('9x9'),

  new Given('R3C1', 7),
  new Given('R3C9', 8),
  new Given('R7C2', 5),
  new Given('R7C8', 8),
  new Given('R8C4', 6),
  new Given('R8C6', 7),

  new Diagonal(-1), // main diagonal, R1C1..R9C9 ('\')
  new Diagonal(1),  // anti-diagonal, R9C1..R1C9 ('/')

  // Each diagonal-neighbour pair as a 2-cell Whisper: Whisper's semantics
  // ("adjacent values differ by at least the given difference") are exactly
  // this rule's semantics.
  ...diagonalNeighborPairs.map(([a, b]) => new Whisper(2, a, b)),
];
