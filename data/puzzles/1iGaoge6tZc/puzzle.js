// Title: Windmill
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=1iGaoge6tZc
// Source: https://sudokupad.app/t9hgy6k213

// Normal sudoku rules apply. The 3x3 box borders divide each of the 8 blue
// lines into segments with the same sum (this sum may be different for
// different lines). RegionSumLine is exactly this: equal sum per box segment,
// independently per line.
//
// Two of the lines were drawn with a rounded (quadratic-Bezier) corner in the
// source SVG; their cell path was recovered by arc-length occupancy rather
// than the raw endpoints. One of the four short "blade" connectors near the
// centre (R7C3-R6C4) is only 2 cells even though the other three are 4-cell
// bent shapes related by 90-degree rotation -- that asymmetry is in the
// drawn art itself, not a decode simplification.
const lines = [
  ['R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7'],
  ['R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7', 'R3C8'],
  ['R7C3', 'R6C4'],
  ['R4C6', 'R3C7', 'R2C8', 'R1C7'],
  ['R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7'],
  ['R7C8', 'R6C7', 'R5C6', 'R4C5', 'R3C4', 'R2C3'],
  ['R6C6', 'R7C7', 'R8C8', 'R7C9'],
  ['R4C4', 'R3C3', 'R2C2', 'R3C1'],
];

return [
  new Shape('9x9'),
  ...lines.map(cells => new RegionSumLine(...cells)),
];
