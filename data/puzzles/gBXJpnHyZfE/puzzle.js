// Title: Event Horizon
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=gBXJpnHyZfE
// Source: https://sudokupad.app/giuk6t4rfg

// Normal Sudoku; central-box digits have double weight in each arithmetic clue.
// The drawn arithmetic clues are transcribed below; the impossible 70 cage and the
// pink paths contradictory with the supplied answer are omitted.
return [
  new Shape('9x9'),

  // Killer cages from the drawn dashed outlines; every cage has distinct digits.
  new AllDifferent('R8C1', 'R8C2', 'R9C1'),
  new Sum(20, 'R8C1', 'R8C2', 'R9C1'),
  new AllDifferent('R1C2', 'R2C1', 'R2C2'),
  new Sum(20, 'R1C2', 'R2C1', 'R2C2'),
  new AllDifferent('R1C8', 'R2C8', 'R2C9'),
  new Sum(10, 'R1C8', 'R2C8', 'R2C9'),
  new AllDifferent('R6C6', 'R6C7', 'R6C8'),
  new AllDifferent('R4C2', 'R4C3', 'R4C4'),
  new Sum(20, 'R4C2', 'R4C3', ['R4C4', 2]),
  new AllDifferent('R7C5', 'R8C5'),

  // The three outside 30 diagonals, with coefficient 2 for central-box cells.
  new Sum(30, 'R1C9', 'R2C8', 'R3C7', ['R4C6', 2], ['R5C5', 2], ['R6C4', 2], 'R7C3', 'R8C2', 'R9C1'),
  new Sum(30, 'R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1'),
  new Sum(30, 'R1C2', 'R2C3', 'R3C4', ['R4C5', 2], ['R5C6', 2], 'R6C7', 'R7C8', 'R8C9'),

];
