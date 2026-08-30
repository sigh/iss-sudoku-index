// Title: A Killer Sudoku With Missing Cages?!
// Author: Unknown
// Video: https://www.youtube.com/watch?v=XlOc6Y-MHIk
// Source: https://cracking-the-cryptic.web.app/sudoku/btjTmJ64d4
//
// Classic Killer Sudoku: normal Sudoku rules (rows, columns, boxes contain
// 1-9 once each -- the default Shape('9x9') box regions match the payload's
// drawn regions exactly) plus killer cages, each with distinct digits summing
// to its printed total. No rules text is carried in the source payload; this
// reading is the only one the drawn cages support. Only 41 of the 81 cells
// belong to a cage (the "missing cages" of the title) -- the remaining 40
// cells carry no clue beyond ordinary Sudoku.
//
// Cage cells transcribed from the puzzle's drawn cage geometry.

return [
  new Shape('9x9'),

  new Cage(12, 'R2C3', 'R2C4'),
  new Cage(7, 'R2C5', 'R2C6'),
  new Cage(22, 'R4C3', 'R4C2', 'R3C3'),
  new Cage(15, 'R4C4', 'R3C4', 'R3C5'),
  new Cage(14, 'R3C7', 'R4C7', 'R4C6', 'R3C6'),
  new Cage(13, 'R3C8', 'R4C8'),
  new Cage(16, 'R4C5', 'R5C5', 'R6C5', 'R5C4', 'R5C6'),
  new Cage(10, 'R5C2', 'R5C3'),
  new Cage(10, 'R5C7', 'R5C8'),
  new Cage(10, 'R6C2', 'R7C2'),
  new Cage(11, 'R6C3', 'R7C3', 'R7C4', 'R6C4'),
  new Cage(12, 'R7C5', 'R7C6', 'R6C6'),
  new Cage(15, 'R7C7', 'R6C7', 'R6C8'),
  new Cage(9, 'R8C4', 'R8C5'),
  new Cage(17, 'R8C6', 'R8C7'),
];
