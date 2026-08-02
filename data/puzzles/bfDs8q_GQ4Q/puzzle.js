// Title: The Positive Diagonal
// Author: 99% Sneaky
// Video: https://www.youtube.com/watch?v=bfDs8q_GQ4Q
// Source: https://sudokupad.app/mvuj15iimm

// Normal Sudoku; three arrows; green whisper lines; marked Kropki dots;
// the rising diagonal; and clone boxes 1 and 9. Fog/reveal UI is omitted.
const clonePairs = [
  ['R1C1', 'R7C7'], ['R1C2', 'R7C8'], ['R1C3', 'R7C9'],
  ['R2C1', 'R8C7'], ['R2C2', 'R8C8'], ['R2C3', 'R8C9'],
  ['R3C1', 'R9C7'], ['R3C2', 'R9C8'], ['R3C3', 'R9C9'],
]; // Corresponding positions in the drawn clone boxes.

return [
  new Shape('9x9'),

  new Arrow('R2C1', 'R1C1', 'R1C2'),
  new Arrow('R8C4', 'R9C5', 'R8C5', 'R8C6'),
  new Arrow('R4C4', 'R5C5', 'R6C5'),

  new Whisper(5, 'R8C8', 'R9C9'),
  new Whisper(5, 'R1C4', 'R2C4', 'R3C4'),

  new BlackDot('R7C9', 'R8C9'),
  new BlackDot('R9C7', 'R9C8'),
  new BlackDot('R9C6', 'R9C7'),
  new BlackDot('R6C2', 'R6C3'),
  new WhiteDot('R7C6', 'R8C6'),
  new WhiteDot('R4C2', 'R5C2'),
  new WhiteDot('R4C9', 'R5C9'),

  new Diagonal(1),
  ...clonePairs.map(([a, b]) => new SameValues(2, a, b)),
];
