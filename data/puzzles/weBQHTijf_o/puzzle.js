// Title: 3D Illusions
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=weBQHTijf_o
// Source: https://sudokupad.app/2ba20kauml

// Normal sudoku rules apply. Neighbouring digits on a line must have a
// difference of at least 4.

// The orange strokes are drawn as five stylised "3D cube" figures (a hexagon
// outline plus internal chords through a shared centre cell, one extra
// figure spanning two boxes in the middle of the grid), so each figure
// branches at its centre cell. Whisper only binds consecutive pairs in one
// ordered list, so a branching figure cannot be a single Whisper; each raw
// drawn stroke (payload `lines` entry) is kept as its own Whisper, together
// covering every edge of every figure exactly once.
const whiskerLines = [
  ['R2C1', 'R1C2', 'R1C3', 'R2C3', 'R3C2', 'R2C2', 'R2C1'],
  ['R2C1', 'R3C1', 'R3C2'],
  ['R2C2', 'R1C3'],
  ['R2C7', 'R1C7', 'R1C8', 'R2C9', 'R3C9', 'R3C8', 'R2C7'],
  ['R2C7', 'R2C8', 'R1C8'],
  ['R2C8', 'R3C9'],
  ['R4C3', 'R3C4', 'R3C5', 'R3C6', 'R4C5', 'R5C5', 'R6C5', 'R6C4', 'R6C3', 'R5C3', 'R4C3', 'R4C4', 'R4C5'],
  ['R3C6', 'R4C6', 'R5C6', 'R6C5'],
  ['R9C7', 'R8C7', 'R7C8', 'R8C8', 'R8C9', 'R9C8', 'R9C7', 'R8C8'],
  ['R7C8', 'R7C9', 'R8C9'],
  ['R8C3', 'R7C2', 'R7C1', 'R8C2', 'R8C3', 'R9C3', 'R9C2', 'R8C2'],
  ['R7C1', 'R8C1', 'R9C2'],
];

return [
  new Shape('9x9'),
  new Given('R2C1', 7),
  new Given('R6C7', 2),
  new Given('R8C3', 9),
  new Given('R8C7', 8),
  ...whiskerLines.map(cells => new Whisper(4, ...cells)),
];
