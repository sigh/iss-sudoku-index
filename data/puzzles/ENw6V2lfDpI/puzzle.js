// Title: Just Between Us You Can Count On Me
// Author: Rob Miller
// Video: https://www.youtube.com/watch?v=ENw6V2lfDpI
// Source: https://sudokupad.app/swtm07rplk

// Rules encoded:
// - Normal Sudoku.
// - Each grey line: digits on the line lie strictly between the digits in
//   its two circled endpoints (Between; the circle cells are the constructor's
//   first and last cell).
// - Every circle's digit counts how many of the grid's circles hold that
//   same digit. The rules text scopes this "in the puzzle" (not per line),
//   so all 14 circles form one CountingCircles set.
// Line and circle cell lists are transcribed from the drawn `lines` and
// `overlays` geometry.

return [
  new Shape('9x9'),

  new Given('R1C9', 2),
  new Given('R3C6', 1),
  new Given('R4C7', 8),
  new Given('R6C1', 9),
  new Given('R9C9', 5),

  new Between('R9C1', 'R8C1', 'R7C1', 'R6C2', 'R5C2'),
  new Between('R2C2', 'R2C3', 'R1C4', 'R1C5', 'R2C6'),
  new Between('R6C3', 'R7C4', 'R6C5'),
  new Between('R1C6', 'R2C7', 'R3C8', 'R4C8'),
  new Between('R8C2', 'R7C3', 'R8C3', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R8C6', 'R8C5'),
  new Between('R3C2', 'R4C2', 'R3C3', 'R3C4', 'R4C5', 'R5C5', 'R4C4'),
  new Between('R5C9', 'R6C8', 'R7C7', 'R6C7', 'R5C6', 'R5C7'),

  new CountingCircles(
    'R9C1', 'R5C2', 'R2C2', 'R2C6', 'R6C3', 'R6C5',
    'R1C6', 'R4C8', 'R8C2', 'R8C5', 'R3C2', 'R4C4',
    'R5C9', 'R5C7'
  ),
];
