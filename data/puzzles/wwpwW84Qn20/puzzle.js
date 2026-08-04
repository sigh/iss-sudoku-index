// Title: 23 Renban
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=wwpwW84Qn20
// Source: https://app.crackingthecryptic.com/sudoku/jPN8QBBnHr

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). Each purple line is a "Renban": its cells hold a set of
// non-repeating consecutive digits, in any order -- Renban is set-based, so
// list order does not encode adjacency. Several lines bend diagonally
// across a box corner between straight runs, as drawn.
return [
  new Shape('9x9'),

  new Given('R2C2', 2),
  new Given('R5C6', 3),

  new Renban('R1C7', 'R2C7', 'R3C7', 'R4C8', 'R5C9', 'R6C9'),
  new Renban('R4C7', 'R5C7', 'R6C7', 'R7C8', 'R8C9', 'R9C9'),
  new Renban('R7C1', 'R7C2', 'R7C3', 'R8C4', 'R9C5', 'R9C6'),
  new Renban('R9C4', 'R8C3', 'R8C2', 'R8C1'),
  new Renban('R6C1', 'R6C2', 'R6C3', 'R5C4', 'R4C5', 'R4C6'),
  new Renban('R4C4', 'R5C3', 'R5C2'),
  new Renban('R4C3', 'R3C3', 'R2C4', 'R2C5'),
  new Renban('R2C8', 'R2C9'),
  new Renban('R4C1', 'R4C2'),
  new Renban('R6C8', 'R7C9'),
  new Renban('R2C3', 'R1C4', 'R1C5'),
  new Renban('R6C5', 'R7C4'),
  new Renban('R7C5', 'R7C6'),
  new Renban('R9C1', 'R9C2'),
];
