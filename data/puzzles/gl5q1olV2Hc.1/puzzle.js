// Title: Sept. 19, 2023: 129asaurus
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=gl5q1olV2Hc
// Source: https://tinyurl.com/yrwe5ury

// Normal Sudoku; the nine diagonal givens; and killer cages. Each unlabelled
// coloured cage still requires distinct digits, while each labelled cage also sums
// to its displayed corner total.
return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R2C2', 2), new Given('R3C3', 3),
  new Given('R4C4', 4), new Given('R5C5', 5), new Given('R6C6', 6),
  new Given('R7C7', 7), new Given('R8C8', 8), new Given('R9C9', 9),

  // The four coloured, no-total cages from the drawn cage data.
  new AllDifferent('R1C1', 'R1C2', 'R2C2', 'R3C2', 'R4C2', 'R4C3', 'R4C4', 'R5C2', 'R5C4'),
  new AllDifferent('R5C6', 'R5C8', 'R6C6', 'R6C7', 'R6C8', 'R7C8', 'R8C8', 'R9C8', 'R9C9'),
  new AllDifferent('R1C9', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9', 'R3C6', 'R4C5', 'R4C6'),
  new AllDifferent('R6C4', 'R6C5', 'R7C4', 'R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R9C1'),

  // The displayed-total cages from the drawn cage data.
  new Cage(13, 'R2C1', 'R3C1'), new Cage(7, 'R7C9', 'R8C9'),
  new Cage(3, 'R9C2', 'R9C3'), new Cage(17, 'R1C7', 'R1C8'),
  new Cage(11, 'R9C6', 'R9C7'), new Cage(9, 'R1C3', 'R1C4'),
  new Cage(5, 'R1C5', 'R1C6'), new Cage(15, 'R9C4', 'R9C5'),
  new Cage(11, 'R3C9', 'R4C9'), new Cage(9, 'R5C9', 'R6C9'),
  new Cage(11, 'R4C1', 'R5C1'), new Cage(9, 'R6C1', 'R7C1'),
];
