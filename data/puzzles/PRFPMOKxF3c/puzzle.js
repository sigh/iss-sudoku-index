// Title: Gumption
// Author: Nicolas Duhail
// Video: https://www.youtube.com/watch?v=PRFPMOKxF3c
// Source: https://sudokupad.app/e7tu7y35ij

// Normal sudoku, alternating odd/even red lines, and arrow sums.
return [
  new Shape('9x9'),
  // Paths of the two drawn red lines.
  new Modular(2, 'R5C2', 'R6C1'),
  new Modular(2, 'R4C3', 'R3C4', 'R2C5', 'R1C5', 'R1C4'),
  // Ten drawn shafts, with each connected circle first.
  new Arrow('R3C8', 'R2C9', 'R1C8', 'R2C7', 'R1C6'),
  new Arrow('R3C8', 'R4C9'),
  new Arrow('R3C2', 'R2C1', 'R1C2', 'R2C3'),
  new Arrow('R3C2', 'R4C1'),
  new Arrow('R8C5', 'R9C6', 'R8C7', 'R9C8', 'R8C9'),
  new Arrow('R8C5', 'R9C4', 'R8C3', 'R9C2'),
  new Arrow('R4C5', 'R3C6', 'R4C7', 'R5C8', 'R6C9'),
  new Arrow('R4C5', 'R5C4', 'R6C5', 'R5C6'),
  new Arrow('R7C6', 'R6C7', 'R7C8'),
  new Arrow('R8C1', 'R7C2', 'R6C3', 'R7C4'),
];
