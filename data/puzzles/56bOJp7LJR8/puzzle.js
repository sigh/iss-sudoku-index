// Title: Highball
// Author: Matt Tressel
// Video: https://www.youtube.com/watch?v=56bOJp7LJR8
// Source: https://sudokupad.app/v3f32yjc6a

// Standard 9x9 Sudoku with killer cages and German whispers.
const cageData = [
  [10, 'R1C1', 'R2C1'],
  [15, 'R1C3', 'R2C3'],
  [15, 'R1C7', 'R2C7'],
  [10, 'R1C9', 'R2C9'],
  [10, 'R3C5', 'R4C5'],
  [10, 'R5C3', 'R5C4'],
  [10, 'R5C6', 'R5C7'],
  [10, 'R6C5', 'R7C5'],
  [15, 'R8C1', 'R9C1'],
  [10, 'R8C3', 'R9C3'],
  [10, 'R8C7', 'R9C7'],
  [15, 'R8C9', 'R9C9'],
];

const whisperPaths = [
  ['R7C1', 'R6C2', 'R5C2', 'R4C2', 'R3C3'],
  ['R7C7', 'R6C8', 'R5C8', 'R4C8', 'R3C9'],
  ['R3C4', 'R2C4', 'R2C5', 'R2C6', 'R3C6', 'R4C6'],
  ['R8C6', 'R8C5', 'R8C4', 'R7C4', 'R6C4'],
  ['R4C5', 'R5C5', 'R6C5'],
];

const cages = cageData.map(([sum, ...cells]) => new Cage(sum, ...cells));
const whispers = whisperPaths.map(cells => new Whisper(5, ...cells));

return [
  new Shape('9x9'),
  ...cages,
  ...whispers,
];
