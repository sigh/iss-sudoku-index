// Title: Group Sums
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=3JTzpc8APdU
// Source: https://cracking-the-cryptic.web.app/sudoku/293H7dhGfN
//
// Normal sudoku rules apply (default row/column/box all-different, no
// givens). Twelve circles are drawn, each straddling a 2x2 block of cells,
// printed with a total; the four cells touched by a circle must sum to that
// total, and digits may repeat within a circle (Sum, not Cage). Cell lists
// below are the four cells each drawn circle straddles.

const circleSums = [
  [27, 'R2C3', 'R2C4', 'R3C3', 'R3C4'],
  [13, 'R1C6', 'R1C7', 'R2C6', 'R2C7'],
  [17, 'R3C8', 'R3C9', 'R4C8', 'R4C9'],
  [14, 'R4C6', 'R4C7', 'R5C6', 'R5C7'],
  [19, 'R3C5', 'R3C6', 'R4C5', 'R4C6'],
  [13, 'R3C2', 'R3C3', 'R4C2', 'R4C3'],
  [26, 'R5C3', 'R5C4', 'R6C3', 'R6C4'],
  [21, 'R6C4', 'R6C5', 'R7C4', 'R7C5'],
  [25, 'R6C1', 'R6C2', 'R7C1', 'R7C2'],
  [23, 'R6C7', 'R6C8', 'R7C7', 'R7C8'],
  [15, 'R7C6', 'R7C7', 'R8C6', 'R8C7'],
  [25, 'R8C3', 'R8C4', 'R9C3', 'R9C4'],
];

return [
  new Shape('9x9'),
  ...circleSums.map(([sum, ...cells]) => new Sum(sum, ...cells)),
];
