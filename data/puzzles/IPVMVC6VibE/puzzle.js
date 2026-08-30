// Title: A 16-Given Sudoku!
// Author: Unknown
// Video: https://www.youtube.com/watch?v=IPVMVC6VibE
// Source: https://cracking-the-cryptic.web.app/sudoku/Np23rGh9R7

// Rule (video description): each row, column and region contains the
// numbers from 1-9 at least once each. Rows and columns have 9 cells, so
// that is ordinary all-different and needs no extra constraint beyond the
// default Sudoku grid. The grid is not the usual 9 boxes: it has 5 regions
// (3 ordinary 3x3 boxes and 2 boxes-merged-in-threes 27-cell regions), so
// NoBoxes drops the default boxes and each region below gets its own
// "each digit present at least once" constraint via ContainAtLeast, which
// is a genuinely weaker rule than all-different on the two 27-cell regions.

// Region cell lists are the puzzle's drawn 1-indexed [row, col] region
// partition.
const regions = [
  [[1,1],[1,2],[1,3],[2,1],[2,2],[2,3],[3,1],[3,2],[3,3]],
  [[1,4],[1,5],[1,6],[2,4],[2,5],[2,6],[3,4],[3,5],[3,6],
   [1,7],[1,8],[1,9],[2,9],[3,9],[4,9],[5,9],[6,9],[6,8],[6,7],
   [5,7],[4,7],[3,7],[2,7],[2,8],[3,8],[4,8],[5,8]],
  [[4,4],[4,5],[4,6],[5,4],[5,5],[5,6],[6,4],[6,5],[6,6]],
  [[7,4],[7,5],[7,6],[8,4],[8,5],[8,6],[9,4],[9,5],[9,6],
   [7,3],[6,3],[5,3],[4,3],[4,2],[4,1],[5,1],[6,1],[7,1],[8,1],
   [9,1],[9,2],[9,3],[8,3],[8,2],[7,2],[6,2],[5,2]],
  [[7,7],[7,8],[7,9],[8,7],[8,8],[8,9],[9,7],[9,8],[9,9]],
];
const toId = ([r, c]) => makeCellId(r, c);
const ALL_DIGITS = '1_2_3_4_5_6_7_8_9';

return [
  new Shape('9x9'),
  new NoBoxes(),

  // Givens, from the puzzle's drawn cell values.
  new Given('R1C4', 2), new Given('R1C7', 7),
  new Given('R2C3', 1), new Given('R2C5', 2),
  new Given('R4C2', 7), new Given('R4C9', 3),
  new Given('R5C6', 9), new Given('R5C8', 3),
  new Given('R6C6', 1), new Given('R6C9', 8),
  new Given('R7C2', 5), new Given('R7C4', 7),
  new Given('R8C1', 5), new Given('R8C9', 1),
  new Given('R9C1', 7), new Given('R9C2', 6),

  ...regions.map(
    cells => new ContainAtLeast(ALL_DIGITS, ...cells.map(toId))),
];
