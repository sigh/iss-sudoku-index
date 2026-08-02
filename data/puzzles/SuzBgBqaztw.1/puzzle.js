// Title: Inner Frame Sum Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=SuzBgBqaztw
// Source: https://tinyurl.com/yc3dhdwb

// Normal Sudoku with the five drawn givens. Each outside number totals the
// second through fourth cells seen from its side; the table below transcribes
// the 18 numbered border clues.
return [
  new Shape('9x9'),
  new Given('R3C3', 2),
  new Given('R3C7', 6),
  new Given('R5C5', 5),
  new Given('R7C3', 4),
  new Given('R7C7', 8),

  // Top: C2=23, C3=19, C7=14, C8=21.
  new Sum(23, 'R2C2', 'R3C2', 'R4C2'),
  new Sum(19, 'R2C3', 'R3C3', 'R4C3'),
  new Sum(14, 'R2C7', 'R3C7', 'R4C7'),
  new Sum(21, 'R2C8', 'R3C8', 'R4C8'),

  // Bottom: C2=10, C3=16, C7=11, C8=7.
  new Sum(10, 'R8C2', 'R7C2', 'R6C2'),
  new Sum(16, 'R8C3', 'R7C3', 'R6C3'),
  new Sum(11, 'R8C7', 'R7C7', 'R6C7'),
  new Sum(7, 'R8C8', 'R7C8', 'R6C8'),

  // Left: R2=17, R3=18, R4=19, R7=11, R8=9.
  new Sum(17, 'R2C2', 'R2C3', 'R2C4'),
  new Sum(18, 'R3C2', 'R3C3', 'R3C4'),
  new Sum(19, 'R4C2', 'R4C3', 'R4C4'),
  new Sum(11, 'R7C2', 'R7C3', 'R7C4'),
  new Sum(9, 'R8C2', 'R8C3', 'R8C4'),

  // Right: R2=14, R3=19, R6=12, R7=12, R8=13.
  new Sum(14, 'R2C8', 'R2C7', 'R2C6'),
  new Sum(19, 'R3C8', 'R3C7', 'R3C6'),
  new Sum(12, 'R6C8', 'R6C7', 'R6C6'),
  new Sum(12, 'R7C8', 'R7C7', 'R7C6'),
  new Sum(13, 'R8C8', 'R8C7', 'R8C6'),
];
