// Title: March 18, 2023: Domino Rally
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=RMQ3yI_pFqA
// Source: https://tinyurl.com/2e2aeymt

// Normal sudoku rules apply. Killer: digits in a cage cannot repeat and must
// sum to the total given. Every cage here is a two-cell (domino) cage; cell
// pairs and totals are transcribed from the payload's `killercage` array.
return [
  new Shape('9x9'),
  new Cage(3, 'R1C5', 'R2C5'),
  new Cage(7, 'R3C5', 'R4C5'),
  new Cage(13, 'R6C5', 'R7C5'),
  new Cage(17, 'R8C5', 'R9C5'),
  new Cage(4, 'R5C1', 'R5C2'),
  new Cage(6, 'R5C3', 'R5C4'),
  new Cage(14, 'R5C6', 'R5C7'),
  new Cage(16, 'R5C8', 'R5C9'),
  new Cage(4, 'R2C6', 'R2C7'),
  new Cage(3, 'R6C2', 'R7C2'),
  new Cage(17, 'R3C8', 'R4C8'),
  new Cage(16, 'R8C3', 'R8C4'),
  new Cage(4, 'R8C6', 'R8C7'),
  new Cage(3, 'R6C8', 'R7C8'),
  new Cage(17, 'R2C3', 'R2C4'),
  new Cage(16, 'R3C2', 'R4C2'),
  new Cage(8, 'R1C2', 'R1C3'),
  new Cage(9, 'R7C1', 'R8C1'),
  new Cage(12, 'R2C9', 'R3C9'),
  new Cage(11, 'R9C7', 'R9C8'),
];
