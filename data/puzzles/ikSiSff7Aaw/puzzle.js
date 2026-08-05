// Title: Renewal
// Author: Xendari
// Video: https://www.youtube.com/watch?v=ikSiSff7Aaw
// Source: https://app.crackingthecryptic.com/sudoku/FRBjgBDp4G

// Normal Sudoku rules apply. Blue lines have equal sums in each box segment;
// both purple diagonals have no repeats; each drawn V totals 5. Unmarked
// adjacencies are unrestricted because the rules say not all V clues are given.
const regionSumLines = [
  // Blue region-sum lines, transcribed from the drawn paths.
  new RegionSumLine('R1C2', 'R1C3', 'R1C4', 'R1C5'),
  new RegionSumLine('R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7'),
  new RegionSumLine('R3C4', 'R4C4', 'R5C5', 'R6C6', 'R6C7'),
  new RegionSumLine('R5C2', 'R6C2', 'R7C3'),
  new RegionSumLine('R8C7', 'R7C8', 'R6C9', 'R5C9'),
];

const vClues = [
  // Drawn V markers.
  new V('R1C1', 'R2C1'),
  new V('R8C1', 'R9C1'),
  new V('R8C9', 'R9C9'),
  new V('R1C9', 'R2C9'),
];

return [
  new Shape('9x9'),
  new Diagonal(-1),
  new Diagonal(1),
  ...regionSumLines,
  ...vClues,
];
