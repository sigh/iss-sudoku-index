// Title: Fish Hook
// Author: The Chiropractor
// Video: https://www.youtube.com/watch?v=q4dKaY8plvE
// Source: https://tinyurl.com/pbcsf4y6

// Standard 9x9 sudoku (rows/columns/3x3 boxes), no givens.
// Arrows: arm digits sum to the circle digit (bulb cell listed first,
// repeats allowed on the arm per sudoku rules). Nine arrows.
// Anti-king: no digit repeats within a king's move -> AntiKing.

return [
  new Shape('9x9'),

  new Arrow('R3C2', 'R3C3', 'R3C4', 'R2C3'),
  new Arrow('R1C5', 'R1C4', 'R1C3', 'R2C4'),
  new Arrow('R4C4', 'R5C3', 'R6C3', 'R5C4'),
  new Arrow('R8C3', 'R7C3', 'R6C4'),
  new Arrow('R6C1', 'R5C2', 'R4C2', 'R5C1'),
  new Arrow('R8C7', 'R8C6', 'R7C7', 'R6C7', 'R5C7'),
  new Arrow('R1C6', 'R2C7', 'R3C6', 'R4C6'),
  new Arrow('R1C7', 'R1C8', 'R1C9', 'R2C9'),
  new Arrow('R7C2', 'R8C2', 'R9C2', 'R8C1'),

  new AntiKing(),
];
