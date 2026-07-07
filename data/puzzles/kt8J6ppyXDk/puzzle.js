// Yes And by James Sinclair
// https://sudokupad.app/james-sinclair/yes-and
// https://www.youtube.com/watch?v=kt8J6ppyXDk
//
// Normal sudoku. Standard arrows, renban lines, entropic lines, and odd cells.

const renbans = [
  ['R9C4', 'R9C5', 'R9C6'],
  ['R6C9', 'R5C9', 'R4C9'],
  ['R1C6', 'R1C5', 'R1C4'],
  ['R4C1', 'R5C1', 'R6C1'],
  ['R1C8', 'R2C9'],
  ['R1C1', 'R2C2', 'R3C1'],
  ['R6C5', 'R5C6', 'R4C6'],
];

const entropics = [
  ['R3C4', 'R3C5', 'R3C6', 'R4C7', 'R5C7', 'R6C7'],
  ['R7C6', 'R7C5', 'R7C4', 'R6C3', 'R5C3', 'R4C3'],
];

const arrows = [
  ['R2C3', 'R2C4', 'R2C5', 'R2C6'],
  ['R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C9'],
  ['R3C2', 'R4C2', 'R5C2', 'R6C2'],
  ['R8C3', 'R8C4', 'R8C5', 'R8C6'],
  ['R5C5', 'R4C4', 'R3C3'],
  ['R5C5', 'R6C6', 'R7C7'],
  ['R5C5', 'R6C4', 'R7C3'],
];

const oddCells = ['R7C7', 'R3C7', 'R5C1', 'R9C5', 'R6C2'];

return [
  new Shape('9x9'),
  ...renbans.map(cells => new Renban(...cells)),
  ...entropics.map(cells => new Entropic(...cells)),
  ...arrows.map(([circle, ...arm]) => new Arrow(circle, ...arm)),
  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
];
