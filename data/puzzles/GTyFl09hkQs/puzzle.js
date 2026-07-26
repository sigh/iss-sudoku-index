// Title: Kyoto
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=GTyFl09hkQs
// Source: https://sudokupad.app/3jqijal91m

// Normal sudoku rules apply (default row/column/box all-different).
// Killer cages: digits in a cage sum to the total, all different within the
// cage (every cage carries an all-different flag in the source data).
// Cage cells transcribed from the drawn cage outlines.
return [
  new Shape('9x9'),

  new Cage(15, 'R2C2', 'R2C3', 'R3C2', 'R3C3'),
  new Cage(14, 'R1C5', 'R2C5'),
  new Cage(14, 'R1C6', 'R2C6'),
  new Cage(15, 'R1C8', 'R1C9'),
  new Cage(15, 'R5C9', 'R6C9'),
  new Cage(15, 'R9C5', 'R9C6'),
  new Cage(15, 'R8C1', 'R9C1'),
  new Cage(13, 'R7C2', 'R7C3'),
  new Cage(13, 'R2C7', 'R3C7'),
  new Cage(16, 'R7C7', 'R7C8', 'R8C7', 'R8C8'),
  new Cage(7, 'R7C6', 'R8C6'),
  new Cage(7, 'R6C7', 'R6C8'),
  new Cage(14, 'R4C4', 'R4C5', 'R5C4', 'R5C5'),
  new Cage(14, 'R6C1', 'R6C2'),
  new Cage(5, 'R5C1', 'R5C2'),
];
