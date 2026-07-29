// Title: Luck
// Author: Chris Napolitano
// Video: https://www.youtube.com/watch?v=By69jVxspCI
// Source: https://sudokupad.app/xlt5uvwad5

// Normal Sudoku rules apply. Arrow shafts sum to their circled cells. Cage digits
// do not repeat; each unlabelled cage may total either 7 or 13.
// Cage coordinates are transcribed from the drawn cage outlines and labels.
const knownCages = [
  new Cage(13, 'R5C1', 'R5C2'),
  new Cage(13, 'R2C7', 'R2C8'),
  new Cage(13, 'R8C5', 'R9C5'),
];
const uncertainCages = [
  ['R5C4', 'R5C5', 'R5C6'],
  ['R2C5', 'R3C5'],
  ['R2C1', 'R2C2'],
  ['R8C7', 'R8C8', 'R9C8', 'R9C9'],
  ['R3C3', 'R3C4'],
].map(cells => new Or([new Cage(7, ...cells), new Cage(13, ...cells)]));

// Arrow paths are transcribed circle first, then along each shaft to its arrowhead.
const arrows = [
  new Arrow('R6C1', 'R6C2', 'R6C3', 'R5C3'),
  new Arrow('R4C1', 'R4C2', 'R4C3', 'R5C3'),
  new Arrow('R9C4', 'R8C4', 'R7C4', 'R7C5'),
  new Arrow('R9C6', 'R8C6', 'R7C6', 'R7C5'),
  new Arrow('R1C7', 'R1C8', 'R1C9', 'R2C9'),
  new Arrow('R3C7', 'R3C8', 'R3C9', 'R2C9'),
  new Arrow('R8C7', 'R9C7', 'R9C8', 'R9C9'),
  new Arrow('R8C3', 'R8C2', 'R7C2'),
];

return [
  new Shape('9x9'),
  new Given('R4C6', 3),
  ...knownCages,
  ...uncertainCages,
  ...arrows,
];
