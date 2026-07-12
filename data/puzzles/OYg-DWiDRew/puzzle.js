// Title: Dutch Summer
// Author: Tim Hasselaar
// Video: https://www.youtube.com/watch?v=OYg-DWiDRew
// Source: https://sudokupad.app/hrsm0gqb5o

// Normal sudoku rules apply (default row/column/box all-different).
// Fog of war is solving UI only, not a final-grid rule; not encoded.
//
// Orange lines are Dutch whisper lines (adjacent digits differ by >= 4) that
// are also region sum lines (3x3-box-boundary segments share an equal sum).
// RegionSumLine handles the box segmentation automatically, so each line
// below gets both a Whisper(4, ...) and a RegionSumLine(...) over the same
// cell path.
//
// Every 2x2 square must contain a low (1-3), middle (4-6), and high (7-9)
// digit: the built-in GlobalEntropy constraint is exactly this 9x9 rule.

const dutchWhisperRegionSumLines = [
  ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R8C9', 'R8C8', 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2', 'R8C1'],
  ['R7C6', 'R7C7', 'R7C8'],
  ['R7C5', 'R6C5', 'R5C5'],
  ['R5C6', 'R5C7', 'R4C7'],
  ['R6C2', 'R5C3', 'R4C3', 'R4C4', 'R4C5'],
  ['R5C1', 'R5C2', 'R4C2', 'R3C3', 'R2C2', 'R1C2', 'R1C3'],
];

return [
  new Shape('9x9'),

  ...dutchWhisperRegionSumLines.flatMap(cells => [
    new Whisper(4, ...cells),
    new RegionSumLine(...cells),
  ]),

  new GlobalEntropy(),
];
