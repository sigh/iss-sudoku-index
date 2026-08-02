// Title: Stardoku Wars
// Author: Erik Borker
// Video: https://www.youtube.com/watch?v=GuJdAmwSonI
// Source: https://app.crackingthecryptic.com/ghrPGLLpRH

// Normal Sudoku, five arrows, two thermometers, and the drawn Kropki dots.
// Arrow arms and thermometers are transcribed from their drawn paths; dot pairs are transcribed from the drawn edge marks.
return [
  new Shape('9x9'),
  new Given('R3C6', 6),
  new Given('R4C7', 6),

  new Arrow('R1C1', 'R1C2', 'R2C3', 'R3C3'),
  new Arrow('R1C1', 'R2C2', 'R3C3'),
  new Arrow('R1C1', 'R2C1', 'R3C2', 'R3C3'),
  new Arrow('R9C3', 'R8C2', 'R7C3', 'R6C4', 'R5C5'),
  new Arrow('R8C3', 'R7C4', 'R6C4'),

  new Thermo('R3C7', 'R2C8', 'R1C9'),
  new Thermo('R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9'),

  new WhiteDot('R3C4', 'R3C5'),
  new WhiteDot('R5C3', 'R6C3'),

  new BlackDot('R8C6', 'R9C6'),
  new BlackDot('R8C4', 'R8C5'),
  new BlackDot('R5C6', 'R6C6'),
  new BlackDot('R6C1', 'R7C1'),
  new BlackDot('R5C1', 'R6C1'),
  new BlackDot('R2C3', 'R3C3'),
  new BlackDot('R3C2', 'R3C3'),
  new BlackDot('R3C3', 'R4C3'),
  new BlackDot('R3C3', 'R3C4'),
  new BlackDot('R2C6', 'R3C6'),
];
