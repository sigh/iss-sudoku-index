// Title: Nov. 4, 2022: Antiknight
// Author: clover!
// Video: https://www.youtube.com/watch?v=FLATfYbBeug
// Source: https://tinyurl.com/nuvdyybf

// Standard 9x9 Sudoku, with the stated anti-knight rule.
return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R1C3', 2), new Given('R1C7', 6), new Given('R1C9', 7),
  new Given('R2C4', 4), new Given('R2C6', 5),
  new Given('R3C1', 3), new Given('R3C9', 8),
  new Given('R4C4', 2), new Given('R4C6', 3),
  new Given('R6C4', 1), new Given('R6C6', 8),
  new Given('R7C1', 4), new Given('R7C9', 5),
  new Given('R8C4', 7), new Given('R8C6', 2),
  new Given('R9C1', 5), new Given('R9C3', 6), new Given('R9C7', 8), new Given('R9C9', 9),
  new AntiKnight(),
];
