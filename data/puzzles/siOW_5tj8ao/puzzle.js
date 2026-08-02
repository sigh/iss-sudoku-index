// Title: The Big Zipper
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=siOW_5tj8ao
// Source: https://sudokupad.app/5tw5gusn3p

// Normal 9x9 Sudoku rules apply. Each lavender line is a zipper: pairs equally
// distant from its marked centre sum to that centre digit. The listed cells are
// the drawn paths, in order; the lavender spots mark their middle cells.
return [
  new Shape('9x9'),
  new Zipper(
    'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C8', 'R3C8', 'R3C9',
    'R4C8', 'R5C8', 'R6C7', 'R5C7', 'R4C7', 'R4C6', 'R3C6', 'R2C5',
    'R2C4', 'R1C3', 'R1C2', 'R2C1', 'R3C1', 'R3C2', 'R3C3', 'R2C3',
    'R3C4', 'R3C5', 'R4C5', 'R5C5', 'R5C6', 'R6C6', 'R7C7', 'R8C7',
    'R8C6', 'R7C6', 'R7C5', 'R8C5', 'R8C4', 'R9C3', 'R8C3', 'R9C2',
    'R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1'
  ),
  new Zipper('R5C4', 'R6C5', 'R7C4'),
  new Zipper('R7C8', 'R8C9', 'R9C9', 'R9C8', 'R9C7'),
];
