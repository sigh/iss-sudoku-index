// Title: Symphony
// Author: Playmaker6174
// Video: https://www.youtube.com/watch?v=6dTmQ_rmR5w
// Source: https://sudokupad.app/i7ze05evyv

// Normal Sudoku. X marks sum to 10; unmarked pairs may also sum to 10.
// Arrow arms sum to their circle. The two forked drawings are separate arms
// from a shared circle. Green is a difference-5 whisper; pink is renban.
return [
  new Shape('9x9'),

  // Drawn X marks.
  new X('R5C2', 'R6C2'),
  new X('R5C3', 'R6C3'),
  new X('R6C7', 'R6C8'),
  new X('R5C7', 'R5C8'),

  // Drawn arrows; each listed path from a shared circle is one arm.
  new Arrow('R4C1', 'R5C1', 'R6C1', 'R7C1'),
  new Arrow('R4C9', 'R5C9', 'R6C9', 'R7C9'),
  new Arrow('R8C4', 'R9C3', 'R9C2'),
  new Arrow('R8C4', 'R7C3'),
  new Arrow('R8C6', 'R9C7', 'R9C8'),
  new Arrow('R8C6', 'R7C7'),
  new Arrow('R2C4', 'R3C3'),
  new Arrow('R2C6', 'R3C7'),

  new Whisper(5, 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5'),

  // Pink line paths transcribed from the source.
  new Renban('R5C4', 'R6C5', 'R5C6'),
  new Renban('R1C3', 'R1C4', 'R2C5', 'R1C6', 'R1C7'),
];
