// Title: Up to Something
// Author: sujoyku
// Video: https://www.youtube.com/watch?v=P8N2QmJifnU
// Source: https://sudokupad.app/zbgub1jtmx

// Each outside clue sums the cells before the given in that row or column.
const upToGivenSums = [
  new Sum(6, 'R2C1', 'R2C2', 'R2C3'),
  new Sum(9, 'R4C1'),
  new Sum(12, 'R6C1', 'R6C2', 'R6C3', 'R6C4'),
  new Sum(15, 'R8C1', 'R8C2'),
  new Sum(20, 'R1C2', 'R2C2', 'R3C2'),
  new Sum(20, 'R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5'),
  new Sum(30, 'R1C8', 'R2C8', 'R3C8', 'R4C8'),
  new Sum(30, 'R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1'),
  new Sum(10, 'R9C6', 'R8C6'),
];

return [
  new Shape('9x9'),
  new Given('R1C7', 1),
  new Given('R2C4', 6),
  new Given('R3C1', 7),
  new Given('R4C2', 2),
  new Given('R5C8', 3),
  new Given('R6C5', 8),
  new Given('R7C6', 5),
  new Given('R8C3', 9),
  new Given('R9C9', 4),
  ...upToGivenSums,
  new Arrow('R3C5', 'R3C6', 'R3C7', 'R3C8'),
  new BlackDot('R1C3', 'R1C4'),
  new BlackDot('R6C8', 'R7C8'),
  new WhiteDot('R6C4', 'R7C4'),
];
