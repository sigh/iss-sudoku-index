// Title: Episode 16- whisper- The lonely X
// Author: Chip Sounder
// Video: https://www.youtube.com/watch?v=DUQO4xkTojc
// Source: https://sudokupad.app/czl46gmq8l

// Normal sudoku rules apply. Adjacent digits along a green line must differ
// by at least 5. Cells separated by an X sum to 10. Not all Xs are given
// (so the single drawn X is the only sum-to-10 pair we may assume; absence
// of an X elsewhere carries no information).

const whispers = [
  ['R7C1', 'R8C1', 'R9C2', 'R9C3', 'R9C4'],
  ['R6C4', 'R6C3', 'R6C2', 'R5C1', 'R4C1'],
  ['R4C3', 'R3C4', 'R3C3', 'R3C2', 'R2C1', 'R1C1'],
  ['R3C7', 'R3C8', 'R2C9', 'R1C9'],
  ['R5C7', 'R5C8', 'R4C9', 'R3C9'],
  ['R8C7', 'R8C8', 'R7C9', 'R6C9'],
  ['R2C5', 'R3C6', 'R4C5', 'R5C6', 'R6C5', 'R7C6', 'R8C5'],
  ['R8C9', 'R9C8'],
  ['R8C3', 'R8C4'],
].map((cells) => new Whisper(5, ...cells));

return [
  new Shape('9x9'),

  new Given('R1C4', 6),
  new Given('R2C7', 2),
  new Given('R5C2', 2),
  new Given('R9C6', 2),

  ...whispers,

  // The single drawn X marker, between R3C1 and R3C2.
  new Sum(10, 'R3C1', 'R3C2'),
];
