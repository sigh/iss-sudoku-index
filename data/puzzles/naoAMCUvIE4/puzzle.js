// Title: Tee Time
// Author: Brinel
// Video: https://www.youtube.com/watch?v=naoAMCUvIE4
// Source: https://sudokupad.app/9kcdw4kdjl

// Normal sudoku rules apply (default row/column/box all-different from
// Shape). No given digits.
//
// Cages: digits do not repeat in a cage and sum to the clue total.
// Green lines: neighbouring digits differ by at least five (Whisper(5)).
// Blue lines: box borders divide the line into equal-sum segments
// (RegionSumLine).
// White dot: the two joined cells hold consecutive digits (WhiteDot).
//
// Drawn-but-not-a-clue: ~630 small grey circular marks (10 overlays, 620
// underlays) form decorative shading across the middle of the grid (a
// golf-green texture fitting the "Tee Time" title). The rules text gives
// them no meaning, so they are not encoded.

// Cages, from the payload's `cages` array (each `unique: true`).
const cages = [
  [24, 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],
  [12, 'R7C1', 'R7C2'],
  [12, 'R6C6', 'R6C7', 'R6C8'],
  [12, 'R5C1', 'R5C2'],
  // Diagonal staircase of 9 cells summing to 45 -- every digit once.
  [45, 'R1C5', 'R2C4', 'R2C5', 'R3C3', 'R3C4', 'R4C3', 'R5C3', 'R6C3', 'R7C3'],
];

// Green (springgreen) whisper lines, one per drawn stroke in `lines`. Two
// pairs of strokes share endpoints and branch (R5C2-R6C1-R6C2/R7C1... and
// R5C5...R6C8-R6C7-R6C6-R6C5), so each drawn stroke is kept as its own
// Whisper call rather than concatenated into one path -- that reproduces
// every adjacent pair the art actually draws without inventing an edge
// across the branch point.
const whisperLines = [
  ['R5C2', 'R6C1', 'R6C2'],
  ['R6C1', 'R7C1', 'R7C2'],
  ['R7C1', 'R8C1', 'R8C2'],
  ['R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],
  ['R5C5', 'R5C6', 'R5C7', 'R6C8', 'R7C9', 'R8C9', 'R9C9', 'R9C8'],
  ['R6C8', 'R6C7', 'R6C6', 'R6C5'],
  ['R7C9', 'R7C8', 'R7C7'],
  ['R8C9', 'R8C8'],
  ['R7C5', 'R7C6'],
  ['R8C5', 'R8C6'],
];

// Blue (deepskyblue) region sum lines, from `lines`.
const regionSumLines = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4'],
  ['R1C6', 'R1C7', 'R1C8'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...whisperLines.map(cells => new Whisper(5, ...cells)),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
  // White dot overlay: edge(R7C7, R8C7).
  new WhiteDot('R7C7', 'R8C7'),
];
