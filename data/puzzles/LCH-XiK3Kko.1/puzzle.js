// Title: It's Alive!
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=LCH-XiK3Kko
// Source: https://tinyurl.com/mryjh2dk

// Normal Sudoku with the given R5C5=9. Each drawn killer cage has distinct
// digits and the displayed total; the tables below transcribe the 18 cages.
return [
  new Shape('9x9'),
  new Given('R5C5', 9),
  new Cage(3, 'R3C3', 'R3C4'),
  new Cage(7, 'R3C5', 'R3C6'),
  new Cage(17, 'R7C6', 'R7C7'),
  new Cage(13, 'R7C4', 'R7C5'),
  new Cage(14, 'R6C3', 'R7C3'),
  new Cage(6, 'R3C7', 'R4C7'),
  new Cage(5, 'R5C7', 'R6C7'),
  new Cage(15, 'R4C3', 'R5C3'),
  new Cage(5, 'R8C7', 'R8C8'),
  new Cage(15, 'R2C2', 'R2C3'),
  new Cage(11, 'R6C8', 'R7C8'),
  new Cage(9, 'R3C2', 'R4C2'),
  new Cage(7, 'R5C2', 'R6C2'),
  new Cage(13, 'R4C8', 'R5C8'),
  new Cage(8, 'R8C5', 'R8C6'),
  new Cage(12, 'R2C4', 'R2C5'),
  new Cage(13, 'R5C6', 'R6C6'),
  new Cage(8, 'R4C4', 'R5C4'),
];
