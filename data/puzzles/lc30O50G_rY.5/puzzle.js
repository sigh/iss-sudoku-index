// Title: Pointing Diagonal Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=lc30O50G_rY
// Source: https://tinyurl.com/5n953y35

// Normal Sudoku Rules Apply (rows, columns, and the default 3x3 boxes each
// hold 1-9 once) plus eight outside diagonal clues: each printed number
// counts the distinct digits among the cells of the diagonal its drawn arrow
// enters ("Numbers outside the grid indicate the number of different numbers
// placed in the cells in the corresponding diagonal direction."). Each
// printed clue sits on the border between two candidate diagonal lanes; the
// arrow shaft drawn beside it (a 45-degree ray whose row+/-col is exactly on
// one lane's centre and off the other's) is what fixes the lane used below.
//
// CountDistinct needs a control cell holding the count, so each clue gets a
// Var pinned to its printed number by a Given, then used as the control cell
// over that diagonal's grid cells.

const DIAGONALS = [
  [2, ['R1C4', 'R2C3', 'R3C2', 'R4C1']],
  [5, ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1']],
  [5, ['R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5']],
  [2, ['R6C1', 'R7C2', 'R8C3', 'R9C4']],
  [2, ['R4C9', 'R3C8', 'R2C7', 'R1C6']],
  [5, ['R5C9', 'R4C8', 'R3C7', 'R2C6', 'R1C5']],
  [5, ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9']],
  [2, ['R9C6', 'R8C7', 'R7C8', 'R6C9']],
];

const clueVars = new Var('D', 'outside diagonal counts', DIAGONALS.length);

const diagonalClues = DIAGONALS.flatMap(([value, cells], i) => {
  const control = clueVars.cell(i + 1);
  return [
    new Given(control, value),
    new CountDistinct(control, ...cells),
  ];
});

return [
  new Shape('9x9'),

  new Given('R1C5', 7),
  new Given('R2C3', 2),
  new Given('R2C4', 8),
  new Given('R2C7', 6),
  new Given('R3C2', 1),
  new Given('R3C8', 5),
  new Given('R4C4', 1),
  new Given('R4C6', 5),
  new Given('R4C8', 4),
  new Given('R5C1', 1),
  new Given('R5C3', 7),
  new Given('R5C7', 3),
  new Given('R5C9', 5),
  new Given('R6C2', 6),
  new Given('R6C4', 3),
  new Given('R6C6', 7),
  new Given('R7C2', 3),
  new Given('R7C8', 7),
  new Given('R8C3', 4),
  new Given('R8C6', 2),
  new Given('R8C7', 8),
  new Given('R9C5', 3),

  clueVars,
  ...diagonalClues,
];
