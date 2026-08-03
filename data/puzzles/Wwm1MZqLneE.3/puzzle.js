// Title: Waiting Room
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=Wwm1MZqLneE
// Source: https://tinyurl.com/yc6xzh2r

// Normal sudoku rules apply (standard rows/columns/boxes, the ISS default).
// No other clue types are present in the source payload.
return [
  new Shape('9x9'),
  new Given('R1C2', 1), new Given('R1C3', 2), new Given('R1C6', 9), new Given('R1C9', 3),
  new Given('R2C1', 8), new Given('R2C4', 3), new Given('R2C9', 1),
  new Given('R3C1', 7), new Given('R3C4', 4),
  new Given('R4C2', 6), new Given('R4C3', 5),
  new Given('R6C7', 8), new Given('R6C8', 7),
  new Given('R7C6', 1), new Given('R7C9', 6),
  new Given('R8C1', 3), new Given('R8C6', 2), new Given('R8C9', 5),
  new Given('R9C1', 2), new Given('R9C4', 5), new Given('R9C7', 3), new Given('R9C8', 4),
];
