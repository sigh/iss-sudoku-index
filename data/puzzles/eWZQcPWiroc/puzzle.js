// Title: Blackjack
// Author: apiyo
// Video: https://www.youtube.com/watch?v=eWZQcPWiroc
// Source: https://app.crackingthecryptic.com/sudoku/Qm88j7J2dt
//
// Normal sudoku rules apply (standard 3x3 boxes). Anti-knight. Grey circles
// are odd, grey squares are even. Each solid grey line is a 2x2 block traced
// top-left, top-right, bottom-left, bottom-right, whose digits form a
// palindrome (both diagonals of the block match). Arrow digits sum to the
// value in their white/purple circle. The two main diagonals (drawn) must
// each contain all of 1-9. A separate short diagonal, offset from the main
// ones, is marked by an outside-grid arrow labelled 35: its digits sum to
// 35 and may repeat (this is the diagonal the "digits may repeat" clause
// refers to -- the two main diagonals already forbid repeats).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  new Given('R5C5', 9),

  new AntiKnight(),

  // "All of the digits 1 to 9 must appear on both main diagonals."
  new Diagonal(1),   // anti-diagonal R1C9-R9C1
  new Diagonal(-1),  // main diagonal R1C1-R9C9

  // Grey circles (odd) / grey squares (even) -- underlay shapes at these cells.
  new Given('R3C4', 1, 3, 5, 7, 9),
  new Given('R4C7', 1, 3, 5, 7, 9),
  new Given('R6C3', 1, 3, 5, 7, 9),
  new Given('R7C6', 1, 3, 5, 7, 9),
  new Given('R2C2', 2, 4, 6, 8),
  new Given('R2C8', 2, 4, 6, 8),
  new Given('R8C8', 2, 4, 6, 8),
  new Given('R8C2', 2, 4, 6, 8),

  // Palindrome lines: each is a 2x2 block traced in a zig-zag
  // (TL, TR, BL, BR), from the drawn line waypoints.
  new Palindrome('R3C2', 'R3C3', 'R4C2', 'R4C3'),
  new Palindrome('R2C6', 'R2C7', 'R3C6', 'R3C7'),
  new Palindrome('R6C7', 'R6C8', 'R7C7', 'R7C8'),
  new Palindrome('R7C3', 'R7C4', 'R8C3', 'R8C4'),

  // Arrows: bulb (white/purple circle) first, then arm cells.
  new Arrow('R1C9', 'R2C8', 'R3C7'),
  new Arrow('R9C1', 'R8C2', 'R7C3'),

  // Outside-grid diagonal sum clue "35", drawn as an arrow from the R4
  // lane on the right edge into the grid, along the short diagonal
  // R5C9-R6C8-R7C7-R8C6-R9C5 (offset from the two main diagonals above).
  LittleKiller.fromCells(35, graph.ray('R5C9', 1, -1), geometry),
];
