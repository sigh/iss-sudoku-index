// Title: Hidden German Whisper: Follow Up
// Author: 72kchunshuai
// Video: https://www.youtube.com/watch?v=hqollSPTd60
// Source: https://sudokupad.app/g13003prr5

// Normal Sudoku, the marked V, purple renbans, and at least one hidden
// German Whisper of length at least two beneath each renban are encoded.
// Unmarked V relations are unrestricted.
// Purple strokes, listed in their drawn traversal order.
const lines = [
  ['R2C4','R3C4','R4C5','R5C5','R6C5','R7C4'],
  ['R2C5','R3C5','R4C6','R5C6','R6C6','R7C5'],
  ['R1C6','R1C7','R2C7','R3C7','R3C6','R2C6'],
  ['R7C6','R8C7','R8C8','R8C9','R7C9','R7C8'],
  ['R4C4','R5C4','R6C4','R6C3','R7C2','R6C1'],
  ['R3C8','R4C8','R5C7','R6C7','R5C8','R5C9'],
  ['R3C3','R4C3','R4C2','R3C2','R2C2','R2C3'],
];
// A qualifying adjacent pair is itself a two-cell hidden line; every longer
// qualifying hidden line contains such a pair. Thus existence needs no route choice.
const hiddenWhispers = lines.map(cells => new Or(
  cells.slice(1).map((cell, i) => new Whisper(5, cells[i], cell))
));
return [
  new Shape('9x9'),
  // The single V printed on the border between these cells.
  new V('R7C3', 'R8C3'),
  ...lines.map(cells => new Renban(...cells)),
  ...hiddenWhispers,
];
