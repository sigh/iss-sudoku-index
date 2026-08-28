// Title: Whispers all around
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=kbNmo0jVZ_k
// Source: https://tinyurl.com/535evc2x

// Normal Sudoku rules: rows, columns and boxes each contain 1-9 once
// (the default Shape constraints). Digits in a cage do not repeat and sum
// to the cage's printed total. Neighbouring digits on a green line differ
// by at least 5. There are no given digits.

// Killer cages, from the payload's `killercage` array (cells, total).
const cages = [
  new Cage(14, 'R2C3', 'R3C2', 'R3C3'),
  new Cage(11, 'R2C5', 'R3C5'),
  new Cage(9, 'R2C7', 'R3C7', 'R3C8'),
  new Cage(10, 'R7C5', 'R8C5'),
  new Cage(17, 'R7C2', 'R7C3', 'R8C3'),
  new Cage(16, 'R7C7', 'R7C8', 'R8C7'),
  new Cage(7, 'R5C2', 'R5C3'),
  new Cage(9, 'R5C7', 'R5C8'),
  new Cage(15, 'R3C4', 'R4C3', 'R4C4'),
];

// German Whisper lines, from the payload's `whispers` array (also mirrored
// in the generic `line` array as the same green-line coordinates).
const whispers = [
  new Whisper(5, 'R1C1', 'R2C2', 'R3C3'),
  new Whisper(5, 'R1C4', 'R2C5', 'R1C6'),
  new Whisper(5, 'R3C7', 'R2C8', 'R1C9'),
  new Whisper(5, 'R4C4', 'R5C5', 'R6C6'),
  new Whisper(5, 'R4C6', 'R5C5', 'R6C4'),
  new Whisper(5, 'R4C1', 'R5C2', 'R6C1'),
  new Whisper(5, 'R4C9', 'R5C8', 'R6C9'),
  new Whisper(5, 'R8C9', 'R9C9', 'R9C8'),
  new Whisper(5, 'R9C6', 'R8C5', 'R9C4'),
  new Whisper(5, 'R7C3', 'R8C2', 'R9C1'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...whispers,
];
