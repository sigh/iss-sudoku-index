// Title: 121
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=G3OUdVXR5zQ
// Source: https://sudokupad.app/67rr7DMJDh

// Normal Sudoku rules apply. The outlined cage totals 121; the `>` sign points
// to the smaller digit, so its left cell R8C1 is greater than R8C2.
// The cage cells are transcribed from the single drawn 121 cage.
return [
  new Shape('9x9'),
  new Sum(121,
    'R1C8', 'R1C9',
    'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9',
    'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9',
    'R4C9',
    'R5C6', 'R5C7', 'R5C8', 'R5C9',
    'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9',
    'R7C7', 'R7C8', 'R7C9',
    'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9'),
  new GreaterThan('R8C1', 'R8C2'),
];
