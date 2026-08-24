// Title: Arrow Sudoku X - Third Time's the Charm
// Author: Akash Jain
// Video: https://www.youtube.com/watch?v=6I0-7pWCUWM
// Source: https://app.crackingthecryptic.com/sudoku/Lh2Jp3th27
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens). Each arrow's
// arm digits sum to the digit in its circle; arm digits may repeat. Both
// long diagonals are drawn (deepskyblue) so both are marked: each must
// contain 1-9 with no repeats.
//
// Arrow cell paths (circle first, then arm) and diagonal cell paths are
// transcribed from the payload's drawn line geometry.

return [
  new Shape('9x9'),

  new Diagonal(-1), // main diagonal (top-left to bottom-right) R1C1..R9C9
  new Diagonal(1),  // anti diagonal (bottom-left to top-right) R1C9..R9C1

  new Arrow('R4C2', 'R3C1', 'R3C2', 'R2C3'),
  new Arrow('R2C6', 'R2C7', 'R1C7', 'R1C8'),
  new Arrow('R3C8', 'R4C7'),
  new Arrow('R4C8', 'R3C9', 'R2C9'),
  new Arrow('R6C2', 'R7C1', 'R8C1', 'R9C2'),
  new Arrow('R7C2', 'R6C3'),
  new Arrow('R8C4', 'R8C3', 'R9C3'),
  new Arrow('R7C6', 'R8C7', 'R7C8'),
  new Arrow('R9C6', 'R9C7', 'R9C8'),
];
