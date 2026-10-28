// Title: Simon's Cat(astrophy)
// Author: olima
// Video: https://www.youtube.com/watch?v=1G0GmJ1voNA
// Source: https://sudokupad.app/fpjaedqgva

// Normal Sudoku; green whispers, purple renbans, marked Kropki dots and X.
// Dots and X clues are not exhaustive.
return [
  new Shape('9x9'),
  // Green strokes, including the return to the junction R8C4.
  new Whisper(5, 'R8C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R8C4', 'R8C5', 'R8C6', 'R7C7', 'R6C7', 'R5C7', 'R5C6', 'R5C5', 'R5C4', 'R5C3', 'R6C3', 'R7C3', 'R8C4'),
  new Whisper(5, 'R2C7', 'R3C7', 'R4C6', 'R4C5', 'R3C4', 'R2C4'),
  new Whisper(5, 'R6C1', 'R7C2'),
  new Whisper(5, 'R6C9', 'R7C8'),
  // Purple strokes.
  new Renban('R3C9', 'R4C8', 'R4C9', 'R5C8'),
  new Renban('R1C4', 'R1C5', 'R1C6', 'R1C7'),
  new Renban('R3C1', 'R4C2', 'R4C1', 'R5C2'),
  new Renban('R7C6', 'R7C5', 'R7C4'),
  // Filled black and outlined white dots, and printed X.
  new BlackDot('R5C7', 'R5C8'),
  new WhiteDot('R2C5', 'R3C5'),
  new WhiteDot('R2C6', 'R3C6'),
  new WhiteDot('R5C2', 'R5C3'),
  new X('R3C5', 'R3C6'),
];
