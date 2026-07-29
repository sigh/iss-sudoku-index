// Title: Tic-Tac-Torque
// Author: Skeptical Mario
// Video: https://www.youtube.com/watch?v=Oz6BGBambsM
// Source: https://sudokupad.app/x9qn7ktsg1

// Normal Sudoku. Each drawn green line is a German whisper line and has total
// five times its cell count. The X is a 10-sum domino; `>` reads left to right.
// The line table is transcribed from the seven drawn green lines.
const whisperLines = [
  ['R7C1', 'R6C1', 'R5C2', 'R4C3', 'R3C4'],
  ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R1C1', 'R2C1'],
  ['R1C4', 'R2C4', 'R2C5', 'R1C5'],
  ['R5C7', 'R5C8', 'R6C9'],
  ['R9C8', 'R8C8', 'R8C9'],
  ['R8C6', 'R8C5', 'R9C6'],
];

return [
  new Shape('9x9'),
  new Given('R2C2', 5),
  ...whisperLines.flatMap((cells) => [
    new Whisper(5, ...cells),
    new Sum(cells.length * 5, ...cells),
  ]),
  new X('R1C4', 'R1C5'),
  new GreaterThan('R6C5', 'R6C6'),
];
