// Title: Triples
// Author: Mr. Menace
// Video: https://www.youtube.com/watch?v=185Z2YzSHhk
// Source: https://app.crackingthecryptic.com/sudoku/gqBHm2hJhH

// Normal sudoku rules (default 3x3 boxes, drawn as the plain tiling). 18
// three-cell cages: digits in a cage do not repeat, and sum to the shown
// top-left total when one is shown. One cage (R5C7,R6C7,R6C8) shows no sum
// per the rules text ("where given") and the video description ("For one
// cage, the sum is not shown") -- encoded as Cage(0, ...) below: ISS treats
// a Cage sum of 0 as "any sum is ok", i.e. all-different only, no sum check.
// Cage cell lists are transcribed from the puzzle payload's cage array (drawn order).

return [
  new Shape('9x9'),

  new Cage(19, 'R1C2', 'R1C1', 'R2C1'),
  new Cage(12, 'R2C3', 'R3C3', 'R3C2'),
  new Cage(16, 'R1C5', 'R1C6', 'R2C6'),
  new Cage(9, 'R2C4', 'R3C5', 'R3C4'),
  new Cage(18, 'R1C7', 'R2C7', 'R1C8'),
  new Cage(8, 'R2C9', 'R3C9', 'R3C8'),
  new Cage(20, 'R4C2', 'R4C3', 'R5C3'),
  new Cage(15, 'R5C1', 'R6C1', 'R6C2'),
  new Cage(21, 'R4C5', 'R4C4', 'R5C4'),
  new Cage(10, 'R5C6', 'R6C6', 'R6C5'),
  new Cage(22, 'R4C8', 'R4C9', 'R5C9'),
  new Cage(0, 'R5C7', 'R6C7', 'R6C8'),
  new Cage(14, 'R7C1', 'R8C1', 'R7C2'),
  new Cage(22, 'R8C3', 'R9C2', 'R9C3'),
  new Cage(19, 'R7C5', 'R7C6', 'R8C6'),
  new Cage(7, 'R8C4', 'R9C4', 'R9C5'),
  new Cage(20, 'R7C7', 'R8C7', 'R7C8'),
  new Cage(6, 'R8C9', 'R9C9', 'R9C8'),
];
