// Title: Time Killer
// Author: Serkan Yurekli
// Video: https://www.youtube.com/watch?v=ECFbQQheWz4
// Source: https://app.crackingthecryptic.com/webapp/TJqMbbFTgJ

// Normal Sudoku rules apply. Digits in each cage sum to the small clue in its
// top-left cell and cannot repeat within the cage. No given digits. Cage
// cell lists transcribed from the payload's cage array.
const cages = [
  new Cage(24, 'R1C2', 'R1C3', 'R1C4', 'R2C3'),
  new Cage(23, 'R2C1', 'R3C1', 'R4C1', 'R3C2'),
  new Cage(28, 'R5C1', 'R4C2', 'R5C2', 'R6C2'),
  new Cage(12, 'R6C1', 'R7C1', 'R8C1', 'R7C2'),
  new Cage(13, 'R9C2', 'R8C3', 'R9C3', 'R9C4'),
  new Cage(23, 'R6C5', 'R7C5', 'R8C5', 'R7C6'),
  new Cage(16, 'R9C6', 'R9C7', 'R9C8', 'R8C7'),
  new Cage(11, 'R7C8', 'R7C9', 'R8C9', 'R6C9'),
  new Cage(11, 'R4C7', 'R5C7', 'R6C7', 'R5C6'),
  new Cage(30, 'R4C8', 'R5C8', 'R6C8', 'R5C9'),
  new Cage(19, 'R3C8', 'R3C9', 'R2C9', 'R4C9'),
  new Cage(10, 'R1C8', 'R2C7', 'R1C7', 'R1C6'),
  new Cage(11, 'R2C5', 'R3C5', 'R4C5', 'R3C4'),
  new Cage(10, 'R4C3', 'R5C3', 'R6C3', 'R5C4'),
];

return [
  new Shape('9x9'),
  ...cages,
];
