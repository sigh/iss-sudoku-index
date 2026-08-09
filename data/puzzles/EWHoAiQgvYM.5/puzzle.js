// Title: August 11, 2022: Killer
// Author: clover!
// Video: https://www.youtube.com/watch?v=EWHoAiQgvYM
// Source: https://tinyurl.com/4v4e3t6f

// Normal sudoku rules apply. Digits in a cage may not repeat and must sum to
// the indicated total: Cage(total, ...cells) encodes both the distinctness
// and the sum. Cages transcribed from the drawn dashed outlines and printed
// totals.
const cages = [
  new Cage(10, 'R1C1', 'R1C2', 'R1C3', 'R1C4'),
  new Cage(11, 'R1C9', 'R2C9', 'R3C9', 'R4C9'),
  new Cage(11, 'R6C1', 'R7C1', 'R8C1', 'R9C1'),
  new Cage(10, 'R9C6', 'R9C7', 'R9C8', 'R9C9'),
  new Cage(6, 'R2C2', 'R2C3'),
  new Cage(6, 'R7C2', 'R8C2'),
  new Cage(13, 'R2C1', 'R3C1'),
  new Cage(14, 'R9C2', 'R9C3'),
  new Cage(17, 'R7C9', 'R8C9'),
  new Cage(16, 'R1C7', 'R1C8'),
  new Cage(8, 'R8C4', 'R8C5'),
  new Cage(7, 'R4C2', 'R5C2'),
  new Cage(9, 'R2C5', 'R2C6'),
  new Cage(9, 'R5C8', 'R6C8'),
  new Cage(7, 'R5C3', 'R6C3'),
  new Cage(8, 'R4C7', 'R5C7'),
  new Cage(9, 'R3C4', 'R3C5'),
  new Cage(8, 'R7C5', 'R7C6'),
  new Cage(6, 'R2C8', 'R3C8'),
  new Cage(6, 'R8C7', 'R8C8'),
];

return [
  new Shape('9x9'),
  ...cages,
];
