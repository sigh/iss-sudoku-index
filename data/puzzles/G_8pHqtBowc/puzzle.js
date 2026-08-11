// Title: Equals X
// Author: SSG
// Video: https://www.youtube.com/watch?v=G_8pHqtBowc
// Source: https://app.crackingthecryptic.com/sudoku/JpFrnGBRbd

// Standard 9x9 sudoku (rows, columns, boxes all-different by default).
// Blue diagonals: both main diagonals have no repeated digit -- Diagonal(-1)
// for R1C1..R9C9, Diagonal(1) for R1C9..R9C1 (ISS's own direction convention).
// Purple lines: each is a set of non-repeating consecutive digits in any
// order -- Renban (set-based, so no wrap-around/order concern).
// Orange lines: the sum of the digits on the line within a single box is the
// same for every box the line passes through, each box segment summing
// separately -- this is exactly RegionSumLine's own semantics.

const diagonals = [
  new Diagonal(-1),
  new Diagonal(1),
];

const renbans = [
  new Renban('R3C7', 'R2C8', 'R1C9'),
  new Renban('R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9'),
  new Renban('R2C1', 'R3C1', 'R4C1', 'R5C1'),
  new Renban('R9C1', 'R9C2', 'R9C3', 'R9C4'),
];

const regionSumLines = [
  new RegionSumLine('R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'),
  new RegionSumLine('R2C5', 'R2C6', 'R3C7', 'R4C8', 'R5C8', 'R6C8'),
  new RegionSumLine(
    'R5C2', 'R4C3', 'R3C4', 'R3C5', 'R4C5', 'R5C6', 'R6C5', 'R7C5', 'R8C4',
    'R7C3', 'R8C2'),
  new RegionSumLine('R6C1', 'R7C1', 'R8C1', 'R9C1'),
  new RegionSumLine('R9C5', 'R9C6', 'R9C7', 'R9C8'),
];

return [
  new Shape('9x9'),
  ...diagonals,
  ...renbans,
  ...regionSumLines,
];
