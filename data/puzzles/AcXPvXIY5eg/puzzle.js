// Title: Castle Keep
// Author: ZegreS
// Video: https://www.youtube.com/watch?v=AcXPvXIY5eg
// Source: https://app.crackingthecryptic.com/sudoku/rPgh724D6H

// Normal Sudoku. Each blue line has equal sums in its separate 3x3-box segments.
// The grey square is even; the white dot joins consecutive digits.
return [
  new Shape('9x9'),
  new RegionSumLine('R2C1', 'R3C1', 'R4C1', 'R4C2', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R7C2'),
  new RegionSumLine('R2C9', 'R3C9', 'R4C9', 'R4C8', 'R4C7', 'R5C7', 'R6C7'),
  new RegionSumLine('R9C2', 'R9C3', 'R8C4', 'R8C5', 'R8C6', 'R7C7', 'R7C8'),
  new RegionSumLine('R1C7', 'R1C6', 'R1C5'),
  new RegionSumLine('R2C7', 'R3C7', 'R4C6', 'R5C6'),
  new RegionSumLine('R1C3', 'R1C4', 'R2C5', 'R3C6'),
  new RegionSumLine('R2C3', 'R3C3', 'R4C4', 'R5C4'),
  new Given('R6C5', 2, 4, 6, 8),
  new WhiteDot('R3C3', 'R4C3'),
];
