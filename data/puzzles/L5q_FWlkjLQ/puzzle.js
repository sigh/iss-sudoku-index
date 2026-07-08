// Title: Coral Corridor
// Author: Sotehr
// Video: https://www.youtube.com/watch?v=L5q_FWlkjLQ
// Source: https://sudokupad.app/9pbfrrmznf

// Source provenance: SudokuMaker v2026.02.22-5b9808d.
// Closed SudokuPad line waypoints repeat the first cell; encode each cell once.

return [
  new Renban('R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R4C2', 'R5C2'),
  new Renban('R2C3', 'R3C4', 'R4C5', 'R4C6', 'R4C7'),
  new Renban('R8C8', 'R7C8', 'R6C7', 'R5C6'),
  new Renban('R7C4', 'R8C4', 'R8C3', 'R8C2', 'R8C1', 'R7C2', 'R7C3'),

  new RegionSumLine('R5C8', 'R6C8', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7'),
  new RegionSumLine('R8C7', 'R7C6', 'R6C5', 'R6C4', 'R6C3'),
  new RegionSumLine('R2C2', 'R3C2', 'R4C3', 'R5C4'),
  new RegionSumLine('R2C6', 'R3C6', 'R3C7', 'R3C8', 'R2C9', 'R2C8', 'R2C7'),

  new BlackDot('R1C6', 'R2C6'),
  new BlackDot('R3C1', 'R4C1'),
  new BlackDot('R3C8', 'R4C8'),

  new WhiteDot('R8C4', 'R9C4'),
  new WhiteDot('R6C9', 'R7C9'),
  new WhiteDot('R6C2', 'R7C2'),
];
