// Title: Off The Record
// Author: Ambivalent
// Video: https://www.youtube.com/watch?v=CVgiSVKHcMY
// Source: https://sudokupad.app/8sl6tj1bdu

// Normal sudoku, German whispers, and quadruples. "Good evening" is a greeting.
// Paths transcribed from the eight green strokes.
const paths = [
  ['R3C4', 'R3C5', 'R3C6'],
  ['R7C4', 'R7C5', 'R7C6'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
  ['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'],
  ['R1C7', 'R1C6', 'R1C5', 'R2C5', 'R2C6'],
  ['R8C3', 'R8C4', 'R8C5', 'R9C5', 'R9C4'],
  ['R6C4', 'R6C5'],
  ['R4C5', 'R4C6'],
];
// Each drawn circle and its three enclosed numerals, anchored at its top-left cell.
const quads = [
  ['R1C7', 4, 6, 3],
  ['R1C2', 8, 3, 2],
  ['R8C2', 4, 6, 7],
  ['R8C7', 7, 8, 2],
];
return [
  new Shape('9x9'),
  ...paths.map(cells => new Whisper(5, ...cells)),
  ...quads.map(([cell, ...digits]) => new Quad(cell, ...digits)),
];
