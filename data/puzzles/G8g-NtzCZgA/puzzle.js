// Title: Vortex
// Author: Donatello_86
// Video: https://www.youtube.com/watch?v=G8g-NtzCZgA
// Source: https://sudokupad.app/6o5zvf29rt

// Normal Sudoku rules apply. Killer cages are distinct and sum to their displayed totals.
// The green lines are German whispers (adjacent digits differ by at least 5).
// White dots are consecutive; black dots have a 2:1 ratio. Each corner circle is an arrow bulb.

return [
  new Shape('9x9'),

  // Cages transcribed from the drawn cage totals and cells.
  new Cage(15, 'R4C1', 'R5C1', 'R6C1'),
  new Cage(15, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(15, 'R4C9', 'R5C9', 'R6C9'),
  new Cage(15, 'R1C4', 'R1C5', 'R1C6'),
  new Cage(31, 'R6C5', 'R7C5', 'R7C6', 'R8C6', 'R8C7'),
  new Cage(28, 'R3C8', 'R4C7', 'R4C8', 'R5C6', 'R5C7'),
  new Cage(35, 'R2C3', 'R2C4', 'R3C4', 'R3C5', 'R4C5'),
  new Cage(31, 'R5C3', 'R5C4', 'R6C2', 'R6C3', 'R7C2'),

  new Whisper(5, 'R3C3', 'R4C4', 'R5C5', 'R6C4', 'R7C3'),
  new Whisper(5, 'R7C7', 'R6C6', 'R5C5', 'R4C6', 'R3C7'),

  // Dot locations transcribed from the drawn black and white dots.
  new BlackDot('R2C4', 'R2C5'),
  new BlackDot('R8C5', 'R8C6'),
  new WhiteDot('R4C1', 'R4C2'),
  new WhiteDot('R6C8', 'R6C9'),
  new WhiteDot('R2C4', 'R3C4'),
  new WhiteDot('R8C6', 'R9C6'),

  // The twelve shafts are transcribed from the three arrows radiating from each corner bulb.
  new Arrow('R1C1', 'R2C1', 'R3C1'),
  new Arrow('R1C1', 'R1C2', 'R1C3'),
  new Arrow('R1C1', 'R2C2', 'R3C3'),
  new Arrow('R1C9', 'R1C8', 'R1C7'),
  new Arrow('R1C9', 'R2C9', 'R3C9'),
  new Arrow('R1C9', 'R2C8', 'R3C7'),
  new Arrow('R9C1', 'R8C1', 'R7C1'),
  new Arrow('R9C1', 'R8C2', 'R7C3'),
  new Arrow('R9C1', 'R9C2', 'R9C3'),
  new Arrow('R9C9', 'R8C9', 'R7C9'),
  new Arrow('R9C9', 'R9C8', 'R9C7'),
  new Arrow('R9C9', 'R8C8', 'R7C7'),
];
