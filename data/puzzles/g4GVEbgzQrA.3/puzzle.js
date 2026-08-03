// Title: May 30, 2023: bakpao Approved
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=g4GVEbgzQrA
// Source: https://tinyurl.com/3j4k8xef

// Standard sudoku (Shape gives rows/cols/boxes) plus killer cages: no
// repeats within a cage, and sum to the shown total. No givens. All
// clauses of the rules text are represented; no omissions.

return [
  new Shape('9x9'),

  // Cages transcribed from the payload's killercage array; every cage is
  // two cells.
  new Cage(6, 'R1C2', 'R1C3'),
  new Cage(7, 'R2C9', 'R3C9'),
  new Cage(8, 'R9C7', 'R9C8'),
  new Cage(9, 'R7C1', 'R8C1'),
  new Cage(7, 'R2C2', 'R3C2'),
  new Cage(9, 'R7C8', 'R8C8'),
  new Cage(6, 'R8C2', 'R8C3'),
  new Cage(8, 'R2C3', 'R3C3'),
  new Cage(8, 'R2C7', 'R2C8'),
  new Cage(7, 'R3C7', 'R3C8'),
  new Cage(6, 'R7C7', 'R8C7'),
  new Cage(9, 'R7C2', 'R7C3'),
  new Cage(15, 'R1C1', 'R2C1'),
  new Cage(14, 'R1C8', 'R1C9'),
  new Cage(13, 'R8C9', 'R9C9'),
  new Cage(12, 'R9C1', 'R9C2'),
  new Cage(11, 'R9C3', 'R9C4'),
  new Cage(12, 'R6C9', 'R7C9'),
  new Cage(14, 'R1C6', 'R1C7'),
  new Cage(10, 'R3C1', 'R4C1'),
  new Cage(10, 'R4C2', 'R4C3'),
  new Cage(8, 'R6C7', 'R6C8'),
  new Cage(7, 'R7C4', 'R8C4'),
  new Cage(8, 'R2C6', 'R3C6'),
];
