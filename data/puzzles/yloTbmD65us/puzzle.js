// Title: Runway
// Author: Qodec
// Video: https://www.youtube.com/watch?v=yloTbmD65us
// Source: https://sudokupad.app/0qxs14n4hl

// Standard Sudoku; arrow arms sum to their circles. Dashed maximum killer cages
// have distinct digits and a displayed inclusive upper bound; unlabelled cages
// retain only their distinctness. Cage and arrow cell lists are transcribed from
// the drawn source data.
const maximumCage = (max, min, ...cells) => new Or(
  Array.from({length: max - min + 1}, (_, i) => new Cage(min + i, ...cells)));

return [
  new Shape('9x9'),

  new Arrow('R3C1', 'R2C2', 'R1C3'),
  new Arrow('R3C4', 'R2C3', 'R1C2'),
  new Arrow('R4C1', 'R5C2', 'R6C3'),
  new Arrow('R4C4', 'R5C3', 'R6C2'),
  new Arrow('R9C8', 'R9C7', 'R9C6', 'R9C5'),
  new Arrow('R8C8', 'R8C7', 'R8C6', 'R8C5'),

  maximumCage(10, 3, 'R7C2', 'R7C3'),
  new Given('R7C4', 1, 2, 3, 4),
  maximumCage(9, 6, 'R6C9', 'R7C9', 'R8C9'),
  maximumCage(9, 3, 'R5C8', 'R5C9'),
  maximumCage(18, 10, 'R1C6', 'R1C7', 'R2C6', 'R2C7'),
  new AllDifferent('R3C6', 'R3C7', 'R3C8', 'R3C9', 'R4C6', 'R4C7', 'R4C8', 'R4C9'),
  new AllDifferent('R5C6', 'R5C7', 'R6C6', 'R6C7', 'R7C6', 'R7C7'),
  new Given('R6C1', 1, 2, 3, 4, 5, 6, 7, 8),
];
