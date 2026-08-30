// Title: Pi Sudoku
// Author: Aad van der Wetering
// Video: https://www.youtube.com/watch?v=N41yZsxIsK8
// Source: https://cracking-the-cryptic.web.app/sudoku/HBMQr6HjJH
//
// No rules text is archived; the only stated rule is the video description's
// "this is a King Sudoku ie a digit cannot appear in a cell which is a king's
// move (in chess) away from itself" (AntiKing). Rows and columns keep the
// default all-different groups. The payload's own `regions` array defines
// only 8 of the 9 boxes as all-different groups (NoBoxes drops the implicit
// ones, the 8 Jigsaw calls below reinstate exactly those transcribed from
// `regions`); the bottom-right block (R7C7-R9C9) carries no box rule at all.
// A thickness-5 wall on the R1C4|R1C5 border and an unlabelled black dot at
// the R1C5/R1C6/R2C5/R2C6 corner have no stated meaning and no fitting
// standard convention -- omitted (blocker #1655).

return [
  new Shape('9x9'),

  new Given('R1C4', 4),
  new Given('R1C5', 3),
  new Given('R1C6', 1),
  new Given('R2C3', 8),
  new Given('R2C7', 4),
  new Given('R3C2', 3),
  new Given('R3C8', 1),
  new Given('R4C1', 2),
  new Given('R4C9', 5),
  new Given('R5C1', 3),
  new Given('R5C5', 6),
  new Given('R5C9', 9),
  new Given('R6C1', 9),
  new Given('R6C9', 2),
  new Given('R7C2', 7),
  new Given('R7C8', 6),
  new Given('R8C3', 9),
  new Given('R8C7', 5),
  new Given('R9C4', 8),
  new Given('R9C5', 5),
  new Given('R9C6', 3),

  new AntiKing(),

  new NoBoxes(),
  new Jigsaw('9x9', 'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'),
  new Jigsaw('9x9', 'R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C2', 'R6C3'),
  new Jigsaw('9x9', 'R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3'),
  new Jigsaw('9x9', 'R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C5', 'R3C6'),
  new Jigsaw('9x9', 'R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'),
  new Jigsaw('9x9', 'R7C4', 'R7C5', 'R7C6', 'R8C4', 'R8C5', 'R8C6', 'R9C4', 'R9C5', 'R9C6'),
  new Jigsaw('9x9', 'R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9'),
  new Jigsaw('9x9', 'R4C7', 'R4C8', 'R4C9', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C8', 'R6C9'),
];
