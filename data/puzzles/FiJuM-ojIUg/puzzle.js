// Title: Forgiven
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=FiJuM-ojIUg
// Source: https://app.crackingthecryptic.com/sudoku/MF82TJGnB3

// Normal Sudoku; the purple main diagonal has no repeated digit. Blue lines
// have equal digit sums in each 3x3 box they enter. The drawn square is even;
// the drawn circles are odd.
return [
  new Shape('9x9'),
  new Given('R1C1', 4),
  new Diagonal(-1),
  new RegionSumLine('R4C1', 'R3C2', 'R3C3', 'R2C3', 'R1C4'),
  new RegionSumLine('R9C6', 'R8C7', 'R7C7', 'R7C8', 'R6C9'),
  new RegionSumLine('R6C3', 'R7C2', 'R8C2', 'R8C3', 'R7C4', 'R6C4', 'R5C5'),
  new RegionSumLine('R3C6', 'R2C7', 'R3C7', 'R3C8', 'R4C7'),
  new RegionSumLine('R3C5', 'R4C5', 'R5C4'),
  new Given('R2C2', 2, 4, 6, 8),
  new Given('R7C3', 1, 3, 5, 7, 9),
  new Given('R9C7', 1, 3, 5, 7, 9),
];
