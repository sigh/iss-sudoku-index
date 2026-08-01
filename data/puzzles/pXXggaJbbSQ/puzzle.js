// Title: Exclusivity
// Author: zetamath
// Video: https://www.youtube.com/watch?v=pXXggaJbbSQ
// Source: https://sudokupad.app/2sly4fnrqh

// Normal Sudoku; the given; purple renban lines; green whisper lines; black 1:2 dots;
// grey thermometers from their bulbs; and arrows whose arms sum to their circles.
return [
  new Shape('9x9'),
  new Given('R5C7', 6),

  // Purple line paths from the drawing.
  new Renban('R3C4', 'R3C5', 'R3C6'),
  new Renban('R4C2', 'R5C2', 'R6C2'),
  new Renban('R6C8', 'R6C9'),

  new Whisper(5, 'R2C3', 'R1C3', 'R1C4', 'R1C5'),
  new Whisper(5, 'R3C2', 'R3C1', 'R4C1', 'R5C1'),

  // Black edge dots in the drawing.
  new BlackDot('R7C9', 'R8C9'),
  new BlackDot('R4C5', 'R5C5'),

  // Grey bulb-first paths from the drawing.
  new Thermo('R2C6', 'R2C7', 'R3C7'),
  new Thermo('R4C4', 'R5C4'),
  new Thermo('R9C6', 'R9C5', 'R9C4'),

  // Circle followed by each arrow arm, from the drawing.
  new Arrow('R2C9', 'R3C9', 'R4C9', 'R5C9'),
  new Arrow('R6C3', 'R7C4', 'R7C5'),
];
