// Title: Centipede
// Author: Blobz
// Video: https://www.youtube.com/watch?v=2b1WHZm3-f4
// Source: https://sudokupad.app/blobz/centipede

// Normal Sudoku applies. The lime centipede is a difference-at-least-5 line;
// orange mushrooms are self-counting; white dots are consecutive; and the pink
// cannon is a non-repeating consecutive set.
const CENTIPEDE = [
  'R1C6', 'R2C6', 'R2C5', 'R2C4', 'R2C3', 'R3C3', 'R3C4', 'R4C4',
  'R4C3', 'R4C2', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7',
  'R6C7', 'R6C6', 'R6C5', 'R6C4', 'R6C3', 'R7C3', 'R7C4', 'R7C5',
]; // Drawn lime centipede path.

const MUSHROOMS = [
  'R1C9', 'R2C8', 'R3C6', 'R3C5', 'R1C3', 'R2C2', 'R5C8', 'R6C2',
  'R6C1', 'R4C1',
]; // Drawn orange mushroom cells.

const DOTS = [
  ['R7C7', 'R8C7'],
  ['R6C8', 'R7C8'],
  ['R5C8', 'R6C8'],
]; // Drawn white-dot edges.

const CANNON = ['R8C7', 'R9C8', 'R9C7', 'R9C6']; // Drawn pink cannon cells.

return [
  new Shape('9x9'),
  new Given('R9C3', 5),
  new Whisper(5, ...CENTIPEDE),
  new CountingCircles(...MUSHROOMS),
  ...DOTS.map(([a, b]) => new WhiteDot(a, b)),
  new Renban(...CANNON),
];
