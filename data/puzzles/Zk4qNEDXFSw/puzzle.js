// Title: How Do You Even Start This Sudoku?
// Author: Mitchell Lee
// Video: https://www.youtube.com/watch?v=Zk4qNEDXFSw
// Source: https://cracking-the-cryptic.web.app/sudoku/JLm2pFd3JR

// The published puzzle data carries no rules text, so the encoding below is
// what the drawn board states on its own:
//
//   - Normal sudoku rules: each row, column and 3x3 box holds 1-9 once each.
//   - Eight dashed cages, each printed with a total, read as killer cages:
//     the digits in a cage sum to its total and do not repeat within it.
//   - One given, R7C7 = 1.
//
// Nothing else is drawn: no lines, arrows, circles, dots, shading, outside
// clues or non-standard regions. Any further rule the setter stated with the
// puzzle is not present in the published data and is therefore not encoded;
// only 28 of the 81 cells carry a clue, and this encoding is far from unique.

return [
  new Shape('9x9'),

  new Given('R7C7', 1),

  // Cells and totals transcribed from the eight drawn cages, in the order the
  // board draws them: the four 2x2 cages tiling R2C2-R5C5, then the four in
  // the lower right.
  new Cage(20, 'R2C2', 'R2C3', 'R3C2', 'R3C3'),
  new Cage(15, 'R2C4', 'R2C5', 'R3C4', 'R3C5'),
  new Cage(15, 'R4C2', 'R4C3', 'R5C2', 'R5C3'),
  new Cage(10, 'R4C4', 'R4C5', 'R5C4', 'R5C5'),
  new Cage(18, 'R6C4', 'R6C5', 'R7C5'),
  new Cage(12, 'R7C6', 'R8C6', 'R9C6'),
  new Cage(12, 'R6C7', 'R6C8', 'R6C9'),
  new Cage(7, 'R7C9', 'R8C9'),
];
