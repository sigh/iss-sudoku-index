// Title: Williwaw
// Author: Nicolas Duhail
// Video: https://www.youtube.com/watch?v=0cvA-XDiQNQ
// Source: https://sudokupad.app/hn24wxybkz

// Normal sudoku rules apply. The 3x3 box borders divide each blue line into
// segments; each segment along an individual line must have the same sum,
// which is exactly RegionSumLine's semantics for a box-region grid.

return [
  new Shape('9x9'),

  new RegionSumLine(
    'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R8C5', 'R7C4', 'R6C4'),
  new RegionSumLine(
    'R6C5', 'R6C6', 'R7C6', 'R8C6', 'R9C7', 'R9C8', 'R8C9'),
  new RegionSumLine(
    'R4C7', 'R3C8', 'R2C8'),
  new RegionSumLine(
    'R2C1', 'R3C1', 'R4C1'),
  new RegionSumLine(
    'R4C3', 'R3C2', 'R2C2'),
  new RegionSumLine(
    'R2C7', 'R3C7', 'R4C6'),
  new RegionSumLine(
    'R4C8', 'R3C9', 'R2C9'),
  new RegionSumLine(
    'R5C5', 'R4C5', 'R4C4', 'R3C3', 'R2C3', 'R2C4', 'R2C5', 'R3C6'),
  new RegionSumLine(
    'R6C1', 'R6C2', 'R7C3', 'R8C2', 'R7C1'),
  new RegionSumLine(
    'R7C7', 'R8C8', 'R7C9', 'R6C9', 'R6C8'),
];
