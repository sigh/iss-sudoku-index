// Title: Modular Zipper
// Author: gdc
// Video: https://www.youtube.com/watch?v=zakX4D21UVw
// Source: https://sudokupad.app/5yfegmxam3

// Normal Sudoku applies. Every three consecutive cells on a teal path contain
// residues 1, 2, and 0 modulo 3 once each. Lavender paths are zipper lines;
// their marked middle cell equals the sum of each equally distant pair.

const tealModularLines = [
  ['R4C4', 'R5C4', 'R6C4'],
  ['R4C6', 'R5C6', 'R6C6'],
  ['R5C2', 'R6C3', 'R7C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8'],
  ['R6C2', 'R6C1', 'R5C1', 'R4C1', 'R4C2', 'R4C3', 'R5C3'],
  ['R1C1', 'R2C1', 'R3C1', 'R3C2', 'R2C2'],
  ['R7C2', 'R8C2', 'R8C3'],
  ['R7C8', 'R8C8', 'R8C7'],
];

// Paths are transcribed from the teal and lavender strokes in the drawing.
const lavenderZipperLines = [
  ['R1C2', 'R1C3', 'R2C3'],
  ['R2C5', 'R2C6', 'R1C7'],
  ['R2C8', 'R1C8', 'R2C7', 'R3C8', 'R2C9'],
  ['R5C7', 'R4C7', 'R4C8', 'R4C9', 'R5C9', 'R6C9', 'R6C8'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R7C3', 'R8C4', 'R9C5', 'R8C6', 'R7C7'],
  ['R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5'],
];

return [
  new Shape('9x9'),
  ...tealModularLines.map((cells) => new Modular(3, ...cells)),
  ...lavenderZipperLines.map((cells) => new Zipper(...cells)),
];
