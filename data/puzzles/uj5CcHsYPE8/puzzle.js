// Title: Trophy Case
// Author: ifletchr
// Video: https://www.youtube.com/watch?v=uj5CcHsYPE8
// Source: https://app.crackingthecryptic.com/sudoku/8qnQn36NNq

// Normal Sudoku, two distinct-sum cages, black 1:2 dots, an odd orange circle,
// green whispers, bulb-to-tip grey thermometers, and purple renban lines.
return [
  new Shape('9x9'),
  new Cage(15, 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'),
  new Cage(16, 'R8C4', 'R8C5', 'R8C6'),
  new BlackDot('R4C4', 'R5C4'),
  new BlackDot('R4C6', 'R5C6'),
  new BlackDot('R8C6', 'R9C6'),
  new BlackDot('R3C8', 'R3C9'),
  new Given('R8C2', 1, 3, 5, 7, 9),
  new Whisper(5, 'R3C3', 'R3C2', 'R4C2', 'R5C2', 'R6C3'),
  new Whisper(5, 'R3C7', 'R3C8', 'R4C8', 'R5C8', 'R6C7'),
  new Thermo('R3C3', 'R4C3', 'R5C3', 'R6C3'),
  new Thermo('R6C7', 'R5C7', 'R4C7', 'R3C7'),
  new Thermo('R9C5', 'R8C5', 'R7C5'),
  new Thermo('R3C4', 'R3C5', 'R3C6'),
  new Renban('R6C3', 'R7C4', 'R7C5', 'R7C6', 'R6C7'),
  new Renban('R2C4', 'R2C5', 'R2C6'),
];
