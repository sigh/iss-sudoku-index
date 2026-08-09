// Title: Aug 15, 2022: Odd Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=EWHoAiQgvYM
// Source: https://tinyurl.com/4rrwauvw

// Normal Sudoku rules apply. Numbers placed in grey circles must be odd.
// No dedicated Odd/Even class exists; a parity clue is a candidate
// restriction, encoded as a multi-value Given (odd cells below are the
// grey-circle marks drawn on the board).

return [
  new Shape('9x9'),

  new Given('R1C1', 2),
  new Given('R1C6', 7),
  new Given('R1C8', 1),
  new Given('R2C6', 9),
  new Given('R2C8', 3),
  new Given('R2C9', 5),
  new Given('R4C7', 9),
  new Given('R4C8', 2),
  new Given('R4C9', 4),
  new Given('R5C5', 1),
  new Given('R6C1', 4),
  new Given('R6C2', 6),
  new Given('R6C3', 5),
  new Given('R8C1', 1),
  new Given('R8C2', 3),
  new Given('R8C4', 7),
  new Given('R9C2', 5),
  new Given('R9C4', 9),
  new Given('R9C9', 8),

  new Given('R1C3', 1, 3, 5, 7, 9),
  new Given('R2C2', 1, 3, 5, 7, 9),
  new Given('R3C2', 1, 3, 5, 7, 9),
  new Given('R4C2', 1, 3, 5, 7, 9),
  new Given('R5C3', 1, 3, 5, 7, 9),
  new Given('R4C4', 1, 3, 5, 7, 9),
  new Given('R3C4', 1, 3, 5, 7, 9),
  new Given('R2C4', 1, 3, 5, 7, 9),
  new Given('R5C7', 1, 3, 5, 7, 9),
  new Given('R6C6', 1, 3, 5, 7, 9),
  new Given('R7C6', 1, 3, 5, 7, 9),
  new Given('R8C6', 1, 3, 5, 7, 9),
  new Given('R9C7', 1, 3, 5, 7, 9),
  new Given('R8C8', 1, 3, 5, 7, 9),
  new Given('R7C8', 1, 3, 5, 7, 9),
  new Given('R6C8', 1, 3, 5, 7, 9),
];
