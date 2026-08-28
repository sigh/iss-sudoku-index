// Title: Those Chess Sudoku Variations
// Author: Cam Dennis
// Video: https://www.youtube.com/watch?v=3HC6bb4s34M
// Source: https://cracking-the-cryptic.web.app/sudoku/Rn6FtF2n9j

// Normal sudoku (default row/column/box all-different) plus 24 givens, and
// the King Sudoku extra rule from the video description: identical digits
// cannot be a chess king's move apart, anywhere in the grid. The same
// description also offers Queen Sudoku (9s only, queen's-move) and Knight
// Sudoku as independently-sufficient alternative readings of this same grid;
// only King -- the description's primary "EITHER ... OR" option -- is
// encoded here.
return [
  new Shape('9x9'),

  new Given('R2C2', 6), new Given('R2C9', 4),
  new Given('R3C1', 3), new Given('R3C2', 5), new Given('R3C3', 1), new Given('R3C4', 4),
  new Given('R4C5', 8), new Given('R4C6', 6), new Given('R4C7', 5), new Given('R4C8', 9), new Given('R4C9', 2),
  new Given('R5C1', 6), new Given('R5C7', 7), new Given('R5C8', 4), new Given('R5C9', 1),
  new Given('R6C3', 2), new Given('R6C7', 8),
  new Given('R7C2', 7),
  new Given('R8C1', 8), new Given('R8C5', 2), new Given('R8C7', 4), new Given('R8C9', 7),
  new Given('R9C8', 5), new Given('R9C9', 8),

  new AntiKing(),
];
