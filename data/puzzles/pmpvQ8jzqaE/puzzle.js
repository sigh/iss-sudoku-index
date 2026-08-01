// Title: Parity Snakes
// Author: Malrog
// Video: https://www.youtube.com/watch?v=pmpvQ8jzqaE
// Source: https://sudokupad.app/y23lun2exp

// Normal 9x9 sudoku. Grey squares are even, and each drawn white dot joins
// consecutive digits. The solver-discovered parity snakes are omitted.
return [
  new Shape('9x9'),

  // The two grey squares shown in the grid are even.
  new Given('R1C1', 2, 4, 6, 8),
  new Given('R3C3', 2, 4, 6, 8),

  // The seven drawn white dots from the source artwork.
  new WhiteDot('R4C1', 'R5C1'),
  new WhiteDot('R4C5', 'R5C5'),
  new WhiteDot('R6C4', 'R7C4'),
  new WhiteDot('R8C4', 'R9C4'),
  new WhiteDot('R7C6', 'R8C6'),
  new WhiteDot('R9C8', 'R9C9'),
  new WhiteDot('R4C8', 'R4C9'),
];
