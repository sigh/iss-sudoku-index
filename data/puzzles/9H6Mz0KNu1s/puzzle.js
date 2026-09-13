// Title: Azul
// Author: Blobz
// Video: https://www.youtube.com/watch?v=9H6Mz0KNu1s
// Source: https://sudokupad.app/blobz/azul

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9'); the drawn regions match the default 3x3 boxes, so no
// explicit Regions constraint is needed).
//
// Pink lines: each is a closed ring hugging the 8 border cells of one 3x3
// box, skipping the box's centre cell -- a set of consecutive digits in any
// order, i.e. Renban.
//
// Green lines: each traces 7 of the 8 border cells of a different 3x3 box
// (one border edge is left undrawn, so that adjacency is not part of the
// line) -- adjacent digits differ by 5 or more, i.e. Whisper(5).
//
// Thermometers: bulb cell marked with a filled circle; digits increase
// away from the bulb, i.e. Thermo(bulb, ...arm).

const pinkRings = [
  ['R1C1', 'R2C1', 'R3C1', 'R3C2', 'R3C3', 'R2C3', 'R1C3', 'R1C2'],
  ['R4C7', 'R5C7', 'R6C7', 'R6C8', 'R6C9', 'R5C9', 'R4C9', 'R4C8'],
  ['R7C6', 'R8C6', 'R9C6', 'R9C5', 'R9C4', 'R8C4', 'R7C4', 'R7C5'],
];

const greenPaths = [
  ['R8C1', 'R9C1', 'R9C2', 'R9C3', 'R8C3', 'R7C3', 'R7C2', 'R7C1'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R3C8', 'R3C7', 'R2C7'],
  ['R4C5', 'R4C6', 'R5C6', 'R6C6', 'R6C5', 'R6C4', 'R5C4', 'R4C4'],
];

const thermos = [
  ['R4C3', 'R4C2', 'R4C1', 'R5C1'],
  ['R7C9', 'R7C8', 'R7C7', 'R8C7'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C6'],
];

return [
  new Shape('9x9'),

  // Pink lines: consecutive set, any order. A closed loop needs its first
  // cell repeated at the end for a sequential-pair class, but Renban is
  // set-based -- it constrains the cells jointly and needs no wrap-around
  // repeat.
  ...pinkRings.map((cells) => new Renban(...cells)),

  // Green lines: adjacent digits differ by >= 5.
  ...greenPaths.map((cells) => new Whisper(5, ...cells)),

  // Thermometers: strictly increasing from the bulb (first cell).
  ...thermos.map((cells) => new Thermo(...cells)),
];
