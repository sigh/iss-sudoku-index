// Title: Everest
// Author: clover
// Video: https://www.youtube.com/watch?v=nrWbkPh7hWg
// Source: https://app.crackingthecryptic.com/sudoku/F7LgFMbFTn

// Rules (verbatim from the puzzle):
//   "Normal sudoku rules apply.  Digits cannot repeat within a cage and must
//    sum to the value indicated."
//
// Normal sudoku (rows, columns and the nine standard 3x3 boxes all-different)
// is the ISS 9x9 baseline; the payload's region list is exactly those boxes.
// The puzzle has no given digits: the fourteen cages are the whole clue set.
// Every rules sentence is encoded; nothing is omitted.

// Cage totals and cell lists transcribed from the fourteen dashed cages drawn
// on the board, each with its total printed in its top-left cell.
return [
  new Shape('9x9'),

  new Cage(21, 'R2C1', 'R3C1', 'R3C2', 'R4C2', 'R4C3', 'R5C3'),
  new Cage(22, 'R1C2', 'R1C3', 'R2C3', 'R2C4', 'R3C4', 'R3C5'),
  new Cage(33, 'R6C2', 'R7C2', 'R7C3', 'R8C3', 'R8C4', 'R9C4'),
  new Cage(14, 'R7C1', 'R8C1', 'R9C1'),
  new Cage(14, 'R4C4', 'R5C4', 'R5C5', 'R4C5'),
  new Cage(11, 'R6C5', 'R7C5', 'R8C5'),
  new Cage(16, 'R7C6', 'R8C6', 'R9C6'),
  new Cage(30, 'R2C6', 'R2C7', 'R3C7', 'R3C8', 'R4C8', 'R4C9'),
  new Cage(12, 'R5C6', 'R5C7', 'R5C8'),
  new Cage(14, 'R6C7', 'R6C8', 'R6C9'),
  new Cage(13, 'R8C7', 'R9C7'),
  new Cage(13, 'R7C8', 'R7C9'),
  new Cage(10, 'R8C8', 'R8C9', 'R9C8'),
  new Cage(18, 'R1C7', 'R1C8', 'R1C9'),
];
