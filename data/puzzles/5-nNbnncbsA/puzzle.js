// Title: Lavender in the Fog
// Author: gdc
// Video: https://www.youtube.com/watch?v=5-nNbnncbsA
// Source: https://sudokupad.app/sbufo2e9yn

// Normal Sudoku applies. Each lavender 5-cell path is a zipper line: equally
// distant cells sum to its middle digit. White dots mark consecutive digits;
// the black dot marks a 1:2 ratio. Dots are not exhaustive. Fog is UI-only,
// and the stated length, orthogonality, and disjointness describe fixed paths.

// The eight lavender paths are transcribed from the drawn lavender lines.
const zipperLines = [
  ['R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6'],
  ['R6C5', 'R5C5', 'R5C4', 'R6C4', 'R7C4'],
  ['R8C2', 'R9C2', 'R9C3', 'R9C4', 'R8C4'],
  ['R8C5', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],
  ['R8C8', 'R8C9', 'R7C9', 'R7C8', 'R6C8'],
  ['R3C2', 'R2C2', 'R1C2', 'R1C3', 'R1C4'],
  ['R2C9', 'R3C9', 'R3C8', 'R4C8', 'R5C8'],
  ['R1C6', 'R1C5', 'R2C5', 'R2C6', 'R2C7'],
];

// These pairs are transcribed from the four white-dot and one black-dot marks.
const whiteDots = [
  ['R5C6', 'R4C6'],
  ['R4C9', 'R5C9'],
  ['R4C2', 'R5C2'],
  ['R2C9', 'R2C8'],
];
const blackDots = [['R5C5', 'R6C5']];

return [
  new Shape('9x9'),
  ...zipperLines.map((cells) => new Zipper(...cells)),
  ...whiteDots.map((cells) => new WhiteDot(...cells)),
  ...blackDots.map((cells) => new BlackDot(...cells)),
];
