// Title: 5 Rivers and a Dream
// Author: Cassinii
// Video: https://www.youtube.com/watch?v=3fN2jrb6qHM
// Source: https://sudokupad.app/cwxmctw78y

// 6x6 irregular sudoku: place 1-6 once each in every row, column, and
// irregular region.
//
// Region Sum Lines: region borders divide each blue line into segments.
// Each segment of a given line sums to the same total (different lines
// may use different totals).

const shape = new Shape('6x6');

const regions = [
  new Jigsaw('6x6', 'R1C1', 'R1C2', 'R2C1', 'R3C1', 'R4C1', 'R5C1'),
  new Jigsaw('6x6', 'R1C3', 'R2C2', 'R2C3', 'R3C2', 'R4C2', 'R5C2'),
  new Jigsaw('6x6', 'R1C4', 'R2C4', 'R3C3', 'R3C4', 'R4C3', 'R5C3'),
  new Jigsaw('6x6', 'R5C4', 'R5C5', 'R6C1', 'R6C2', 'R6C3', 'R6C4'),
  new Jigsaw('6x6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C5', 'R6C6'),
  new Jigsaw('6x6', 'R1C5', 'R1C6', 'R2C5', 'R3C5', 'R4C4', 'R4C5'),
];

const regionSumLines = [
  new RegionSumLine('R2C1', 'R2C2', 'R1C3'),
  new RegionSumLine('R2C3', 'R3C3', 'R4C3'),
  new RegionSumLine('R1C6', 'R2C6', 'R3C6'),
  new RegionSumLine('R6C5', 'R6C4', 'R6C3'),
  new RegionSumLine('R6C1', 'R5C1', 'R4C1'),
];

return [
  shape,
  new NoBoxes(),
  ...regions,
  ...regionSumLines,
];
