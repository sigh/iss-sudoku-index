// Title: Framed
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=40rkLxJSHaQ
// Source: https://sudokupad.app/upl9la4vp8

// Normal sudoku: 9x9, standard rows/columns/3x3 boxes (default Shape).
//
// Between Lines: values on each line must be strictly between the values in
// its two circle endpoints -- exactly `Between`'s semantics, endpoints first
// and last. The six lines below are transcribed from the "betweenline"
// entries in the source payload.
const BETWEEN_LINES = [
  ['R2C7', 'R1C6', 'R1C5', 'R1C4', 'R2C3'],
  ['R2C3', 'R2C2', 'R3C2', 'R4C2', 'R5C1'],
  ['R2C7', 'R2C8', 'R3C8', 'R4C8', 'R5C9'],
  ['R5C9', 'R6C8', 'R7C8', 'R8C8', 'R8C7'],
  ['R5C1', 'R6C2', 'R7C2', 'R8C2', 'R8C3'],
  ['R8C3', 'R9C4', 'R9C5', 'R9C6', 'R8C7'],
];

// Quadruples: each value must appear at least once among the 2x2's four
// cells -- exactly `Quad`'s semantics. Transcribed from the "quadruple"
// entries in the source payload, keyed by each clue's top-left cell.
const QUADS = {
  R2C1: [1],
  R2C8: [9],
  R2C4: [5],
  R1C5: [7],
  R5C7: [8],
  R7C8: [2],
  R8C1: [6],
  R6C3: [2, 8],
  R3C6: [3, 4],
  R6C6: [7, 9],
  R3C3: [5, 6],
};

return [
  new Shape('9x9'),
  new Given('R6C5', 4),
  ...BETWEEN_LINES.map(cells => new Between(...cells)),
  ...Object.entries(QUADS).map(
    ([topLeft, values]) => new Quad(topLeft, ...values)),
];
