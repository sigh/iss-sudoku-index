// Title: Drop
// Author: zetamath & friends
// Video: https://www.youtube.com/watch?v=NjpUueqFEHY
// Source: https://sudokupad.app/cbux5i6zv0

// Normal 9x9 Sudoku. Killer cages are distinct and have their printed totals;
// green lines are German whispers, purple lines are renbans, blue lines are
// region-sum lines, and peach lines are entropic. Coordinate lists below come
// from the source's drawn cages and line paths.
return [
  new Shape('9x9'),

  new Cage(12, 'R1C1', 'R1C2', 'R1C3', 'R2C1'),
  new Cage(12, 'R1C8', 'R2C8', 'R2C9', 'R3C9'),
  new Cage(21, 'R6C8', 'R7C8', 'R7C9', 'R8C8'),
  new Cage(22, 'R7C1', 'R7C2', 'R8C1', 'R8C2'),

  new Whisper(5, 'R4C9', 'R5C9', 'R6C9'),
  new Whisper(5, 'R4C1', 'R5C1', 'R6C1'),
  new Whisper(5, 'R7C4', 'R8C5', 'R7C6'),

  new Renban('R7C3', 'R8C3', 'R9C3'),
  new Renban('R7C7', 'R8C7', 'R9C7'),

  new RegionSumLine('R7C5', 'R6C5', 'R5C5', 'R4C5'),
  new RegionSumLine('R5C6', 'R6C6', 'R6C7'),

  new Entropic('R2C2', 'R3C3', 'R4C4'),
  new Entropic('R2C7', 'R3C7', 'R4C6'),
  new Entropic('R3C4', 'R3C5', 'R3C6'),
];
