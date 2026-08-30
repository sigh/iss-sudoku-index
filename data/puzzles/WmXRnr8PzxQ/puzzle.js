// Title: Unknown
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=WmXRnr8PzxQ
// Source: https://cracking-the-cryptic.web.app/sudoku/Tp2JQjQhPN

// Encoded: normal 9x9 sudoku (default row/column/box all-different, standard
// 3x3 boxes as drawn) and the twelve given digits.
//
// Omitted, because no rules prose exists for this puzzle and nothing drawn
// states what the marks mean:
//   - five outside text clues, one glyph each: '+' above column 1, '0' above
//     column 4, '+' above column 7, '0' left of row 7, '0' left of row 8;
//   - four short arrows, each centred on the border between two orthogonally
//     adjacent cells: R2C2->R1C2, R3C4->R2C4, R8C3->R8C2, R7C9->R8C9;
//   - two grey shaded cells, R6C7 and R9C8.
// Twelve givens cannot pin a classic sudoku, so this encoding is a faithful
// subset of the puzzle and not the whole of it.

// Givens transcribed from the twelve filled cells drawn on the board.
return [
  new Shape('9x9'),

  new Given('R1C1', 5),
  new Given('R1C5', 3),
  new Given('R1C6', 7),
  new Given('R2C5', 2),
  new Given('R3C2', 4),
  new Given('R3C3', 8),
  new Given('R5C4', 5),
  new Given('R6C1', 4),
  new Given('R6C5', 1),
  new Given('R7C6', 3),
  new Given('R9C7', 2),
  new Given('R9C9', 5),
];
