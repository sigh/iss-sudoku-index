// Title: September 2, 2023: Antiknight
// Author: clover!
// Video: https://www.youtube.com/watch?v=Mmz5bSZWA-s
// Source: https://tinyurl.com/4vyuv5sd

// Normal 9x9 Sudoku rules apply. Equal digits are forbidden at chess knight moves.
return [
  new Shape('9x9'),
  new Given('R1C2', 1), new Given('R1C3', 2), new Given('R1C4', 3), new Given('R1C5', 4),
  new Given('R3C5', 5), new Given('R3C6', 6), new Given('R3C7', 7), new Given('R3C8', 8),
  new Given('R4C1', 1), new Given('R4C9', 8),
  new Given('R6C1', 6), new Given('R6C9', 9),
  new Given('R7C2', 5), new Given('R7C3', 3), new Given('R7C4', 2), new Given('R7C5', 1),
  new Given('R9C5', 8), new Given('R9C6', 7), new Given('R9C7', 9), new Given('R9C8', 4),
  new AntiKnight(),
];
