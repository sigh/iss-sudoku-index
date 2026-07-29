// Title: The Lizard Baby Disambiguation
// Author: olima
// Video: https://www.youtube.com/watch?v=7EFoLh-Pjh8
// Source: https://sudokupad.app/8c67u7k14l

// Normal Sudoku applies. Green paths are whispers of difference at least 5.
// White dots are consecutive, black dots are 1:2, and only drawn dots constrain.
// Red squares use column indexing: a marked cell in column C with value V puts C in column V of its row.
// Green paths, dots, and red-square positions are transcribed from the drawn clues.
return [
  new Shape('9x9'),
  new Whisper(5, 'R3C8', 'R4C7', 'R5C7', 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R7C7', 'R8C7'),
  new Whisper(5, 'R7C7', 'R8C8'),
  new Whisper(5, 'R3C7', 'R4C7', 'R3C6'),
  new Whisper(5, 'R3C2', 'R4C3', 'R5C3', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R7C3', 'R8C3'),
  new Whisper(5, 'R7C3', 'R8C2'),
  new Whisper(5, 'R3C4', 'R4C3', 'R3C3'),
  new Whisper(5, 'R4C5', 'R3C5', 'R2C4', 'R1C5', 'R2C6', 'R3C5'),
  new WhiteDot('R2C4', 'R2C5'),
  new WhiteDot('R2C5', 'R2C6'),
  new BlackDot('R5C5', 'R6C5'),
  new Indexing('C',
    'R1C1', 'R1C9', 'R2C1', 'R2C9', 'R3C1',
    'R3C9', 'R4C1', 'R4C9', 'R5C1', 'R5C9'),
];
