// Title: The Corners Are Even - Zipper Lines
// Author: Mr.Menace
// Video: https://www.youtube.com/watch?v=wwWniorauIg
// Source: https://sudokupad.app/h9w1mp7gmd

// Standard Sudoku. Grey corner squares are even. Purple lines are zipper lines.

return [
  new Shape('9x9'),
  new Given('R2C2', 2), new Given('R4C4', 1), new Given('R5C8', 3), new Given('R7C7', 1), new Given('R8C5', 7),
  new Given('R1C1', 2, 4, 6, 8), new Given('R1C9', 2, 4, 6, 8), new Given('R9C1', 2, 4, 6, 8), new Given('R9C9', 2, 4, 6, 8),
  new Zipper('R1C3','R1C4','R1C5','R1C6','R1C7'),
  new Zipper('R2C1','R3C2','R3C3','R2C3','R1C2'),
  new Zipper('R3C5','R2C6','R3C6','R4C6','R5C5','R6C4','R7C3','R8C3','R8C4'),
  new Zipper('R3C1','R4C1','R5C1','R6C1','R7C1'),
  new Zipper('R8C9','R7C8','R8C8','R8C7','R9C8'),
];
