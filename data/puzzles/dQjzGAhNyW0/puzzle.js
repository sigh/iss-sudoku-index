// Title: Ready By Six
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=dQjzGAhNyW0
// Source: https://sudokupad.app/owxvae01q1

// Normal Sudoku rules apply. Consecutive cells on each drawn green line differ
// by at least 6. The cell lists below transcribe the six drawn lines in order.
const whispers = [
  ['R3C1', 'R2C2', 'R1C3'],
  ['R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5'],
  ['R7C1', 'R6C2', 'R5C3', 'R4C4', 'R3C5', 'R2C6', 'R1C7'],
  ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R9C3', 'R8C4', 'R7C5', 'R6C6', 'R5C7', 'R4C8', 'R3C9'],
  ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9'],
];

return [
  new Shape('9x9'),
  new Given('R2C1', 4),
  new Given('R2C6', 3),
  new Given('R2C7', 7),
  new Given('R6C1', 5),
  ...whispers.map(cells => new Whisper(6, ...cells)),
];
