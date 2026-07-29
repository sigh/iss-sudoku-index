// Title: Doggie Bag
// Author: BraveDenn
// Video: https://www.youtube.com/watch?v=s3CS4Lce-aE
// Source: https://sudokupad.app/8LPdQB8PbG

// Normal Sudoku, seven coloured all-different areas, green whispers of 5,
// orange whispers of 4, and grey-circle odd cells.
const orange = ['R1C1', 'R1C2', 'R1C3', 'R2C3', 'R2C2', 'R3C2', 'R3C3', 'R3C4', 'R4C4'];
const blueLeft = ['R4C2', 'R4C3', 'R5C1', 'R5C2', 'R5C3', 'R5C4', 'R6C3', 'R6C2', 'R6C1'];
const blueUpperRight = ['R4C6', 'R3C6', 'R3C7', 'R3C8', 'R2C8', 'R2C7', 'R1C7', 'R1C8', 'R1C9'];
const yellow = ['R7C2', 'R7C3', 'R7C4', 'R6C4', 'R8C3', 'R9C3', 'R8C2', 'R9C2', 'R9C1'];
const red = ['R5C5', 'R6C5', 'R7C5', 'R8C4', 'R8C5', 'R8C6', 'R9C6', 'R9C5', 'R9C4'];
const purple = ['R6C6', 'R7C6', 'R7C7', 'R7C8', 'R8C8', 'R8C7', 'R9C7', 'R9C8', 'R9C9'];
const greenArea = ['R5C6', 'R5C7', 'R4C7', 'R4C8', 'R4C9', 'R5C9', 'R5C8', 'R6C8', 'R6C7'];

// The coordinate tables transcribe the coloured cells and lines drawn in the grid.
return [
  new Shape('9x9'),
  new Given('R4C4', 1), new Given('R4C6', 2), new Given('R6C4', 4), new Given('R7C6', 8),
  new AllDifferent(...orange), new AllDifferent(...blueLeft), new AllDifferent(...blueUpperRight), new AllDifferent(...yellow),
  new AllDifferent(...red), new AllDifferent(...purple), new AllDifferent(...greenArea),
  new Whisper(5, 'R4C6', 'R3C7', 'R2C8', 'R1C9'),
  new Whisper(5, 'R2C5', 'R2C4'),
  new Whisper(5, 'R4C2', 'R5C2'),
  new Whisper(5, 'R7C2', 'R8C2'),
  new Whisper(5, 'R9C5', 'R9C6'),
  new Whisper(5, 'R6C6', 'R7C7', 'R8C8', 'R9C9'),
  new Whisper(4, 'R6C6', 'R6C5', 'R6C4'),
  new Given('R1C1', 1, 3, 5, 7, 9), new Given('R2C1', 1, 3, 5, 7, 9),
  new Given('R2C2', 1, 3, 5, 7, 9), new Given('R2C5', 1, 3, 5, 7, 9),
  new Given('R5C8', 1, 3, 5, 7, 9), new Given('R6C9', 1, 3, 5, 7, 9),
  new Given('R7C4', 1, 3, 5, 7, 9), new Given('R8C8', 1, 3, 5, 7, 9),
  new Given('R9C9', 1, 3, 5, 7, 9),
];
