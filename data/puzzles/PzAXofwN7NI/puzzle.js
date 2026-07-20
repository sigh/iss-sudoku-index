// Title: Counting Foggy Whispers
// Author: Eric Bader
// Video: https://www.youtube.com/watch?v=PzAXofwN7NI
// Source: https://sudokupad.app/3ahh9s2agf

// Normal Sudoku with distinct-digit killer cages and German Whisper lines.
// Dynamic fog controls clue visibility and adds no completed-grid constraint.
const cages = [
  new Cage(15, 'R5C1', 'R5C2', 'R5C3'),
  new Cage(15, 'R5C7', 'R5C8', 'R5C9'),
  new Cage(20, 'R4C5', 'R5C5', 'R6C4', 'R6C5'),
  new Cage(22, 'R2C4', 'R2C5', 'R3C5'),
  new Cage(15, 'R7C5', 'R8C5', 'R9C5'),
  new Cage(10, 'R7C9', 'R8C9'),
  new Cage(15, 'R1C2', 'R2C2', 'R3C2'),
  new Cage(5, 'R9C8', 'R9C9'),
  new Cage(15, 'R7C2', 'R8C2', 'R8C3'),
  new Cage(11, 'R6C1', 'R6C2', 'R6C3'),
  new Cage(14, 'R2C8', 'R3C7', 'R3C8'),
  new Cage(16, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(20, 'R1C8', 'R1C9', 'R2C9'),
];

const whispers = [
  new Whisper(5, 'R5C1', 'R5C2', 'R5C3', 'R6C4', 'R6C3'),
  new Whisper(5, 'R5C9', 'R5C8', 'R5C7', 'R4C6', 'R5C5', 'R4C5'),
  new Whisper(5, 'R1C2', 'R2C2', 'R3C2'),
  new Whisper(5, 'R3C7', 'R3C8', 'R3C9'),
  new Whisper(5, 'R7C9', 'R8C9'),
  new Whisper(5, 'R1C9', 'R2C9'),
  new Whisper(5, 'R7C4', 'R8C4'),
  new Whisper(5, 'R7C2', 'R8C3', 'R8C2'),
];

return [
  new Shape('9x9'),
  new Given('R6C8', 2),
  new Given('R7C3', 5),
  ...cages,
  ...whispers,
];
