// Title: DDR
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=0_EyZiPiSJI
// Source: https://tinyurl.com/8p3fvxba

// Normal sudoku rules apply. Digits in a circle appear at least once each in
// the four surrounding cells (encoded as Quad; a circle listing a value twice
// requires that digit twice among the four cells, standard quadruple
// semantics). Adjacent digits on a green line differ by at least 5 (Whisper).
// Any set of three sequential cells on an orange line contains a low digit
// (1-3), a middle digit (4-6), and a high digit (7-9) (Entropic). Digits on a
// purple line form a set of non-repeating consecutive digits, in any order
// (Renban).
//
// Every line is a closed 6-cell loop (drawn as a 6-cell path plus a 2-cell
// segment back to the start). Whisper and Entropic bind consecutive cells in
// list order, so each loop's cell list is extended to cover the wrap-around
// edge(s): Whisper needs the first cell repeated at the end (one extra
// edge); Entropic reads sliding windows of 3, so it needs the first *two*
// cells repeated at the end to also cover the two wrap-around triples.
// Renban constrains the whole cell set jointly and needs no such repeat.

// Quadruple circles. Provenance: the source payload's quadruple clue data.
const quads = [
  new Quad('R3C3', 2),
  new Quad('R6C3', 4),
  new Quad('R6C6', 6, 7, 7),
  new Quad('R3C6', 8),
  new Quad('R6C1', 5),
  new Quad('R1C6', 6),
];

// Orange loops (Entropic). Provenance: the source payload's line data with
// outlineC #FFCC00.
const orangeLoops = [
  ['R4C2', 'R5C1', 'R6C1', 'R5C2', 'R6C3', 'R5C3'],
  ['R7C7', 'R8C7', 'R9C8', 'R8C9', 'R7C9', 'R8C8'],
  ['R1C4', 'R2C4', 'R3C5', 'R2C6', 'R1C6', 'R2C5'],
];
const entropics = orangeLoops.map(
  cells => new Entropic(...cells, cells[0], cells[1]));

// Purple loops (Renban). Provenance: the source payload's line data with
// outlineC #F067F0.
const purpleLoops = [
  ['R5C5', 'R6C4', 'R6C5', 'R5C6', 'R4C5', 'R4C4'],
  ['R7C2', 'R8C1', 'R9C1', 'R8C2', 'R9C3', 'R8C3'],
  ['R3C7', 'R2C7', 'R1C8', 'R2C9', 'R3C9', 'R2C8'],
];
const renbans = purpleLoops.map(cells => new Renban(...cells));

// Green loops (Whisper, difference >= 5). Provenance: the source payload's
// line data with outlineC #67F067.
const greenLoops = [
  ['R1C3', 'R1C2', 'R2C1', 'R3C2', 'R3C3', 'R2C2'],
  ['R4C7', 'R4C8', 'R5C9', 'R6C8', 'R6C7', 'R5C8'],
  ['R7C6', 'R7C5', 'R8C4', 'R9C5', 'R9C6', 'R8C5'],
];
const whispers = greenLoops.map(
  cells => new Whisper(5, ...cells, cells[0]));

return [
  new Shape('9x9'),
  ...quads,
  ...entropics,
  ...renbans,
  ...whispers,
];
