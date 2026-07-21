// Title: Trilobite
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=17CJvs36_3U
// Source: https://sudokupad.app/ssgc4hr639

// Digits in a cage are distinct and sum to its given total.
const cages = [
  new Cage(22, 'R6C1', 'R7C1', 'R8C1'),
  new Cage(14, 'R7C6', 'R7C7'),
  new Cage(13, 'R8C7', 'R8C8'),
  new Cage(5, 'R2C9', 'R3C9'),
  new Cage(15, 'R1C7', 'R1C8'),
  new Cage(16, 'R5C7', 'R6C7', 'R6C8', 'R7C8'),
  new Cage(15, 'R2C3', 'R2C4', 'R3C4', 'R3C5'),
  new Cage(7, 'R2C2', 'R3C2'),
  new Cage(6, 'R3C3', 'R4C3'),
  new Cage(8, 'R9C3', 'R9C4', 'R9C5'),
  new Cage(14, 'R7C4', 'R8C3', 'R8C4'),
  new Cage(14, 'R6C2', 'R6C3', 'R7C2'),
  new Cage(16, 'R4C5', 'R4C6', 'R5C6'),
  new Cage(16, 'R3C6', 'R3C7', 'R4C7'),
];

return [
  new Shape('9x9'),
  ...cages,
];
