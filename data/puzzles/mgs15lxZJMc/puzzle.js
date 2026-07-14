// Title: Tracking The Triptych
// Author: pb45
// Video: https://www.youtube.com/watch?v=mgs15lxZJMc
// Source: https://sudokupad.app/vldribkmqp

// Normal sudoku rules apply. The peach line is entropic; boxes 5 and 9 are
// magic squares. The remaining clues are arrows, killer cages, little-killer
// diagonals, and two small arrows pointing to the lesser domino digit.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const peachLine = [
  'R2C2', 'R3C3', 'R2C3', 'R2C4', 'R3C5', 'R2C6', 'R1C7', 'R2C8',
  'R3C9', 'R4C8', 'R5C8', 'R5C7', 'R6C6', 'R6C5', 'R6C4', 'R5C3',
  'R6C3', 'R7C3', 'R7C4', 'R7C5', 'R8C5', 'R9C6', 'R8C7', 'R8C8',
];

// Equalize the three rows, three columns, and two long diagonals of a 3x3 box.
function magicSquare(boxNumber) {
  const cells = graph.box(boxNumber);
  const rows = [cells.slice(0, 3), cells.slice(3, 6), cells.slice(6, 9)];
  const columns = [0, 1, 2].map(col => [cells[col], cells[col + 3], cells[col + 6]]);
  const diagonals = [
    [cells[0], cells[4], cells[8]],
    [cells[2], cells[4], cells[6]],
  ];
  return new EqualSum(...rows, ...columns, ...diagonals);
}

const arrows = [
  new Arrow('R4C5', 'R4C4', 'R4C3'),
  new Arrow('R4C5', 'R4C6', 'R4C7'),
  new Arrow('R4C5', 'R5C5', 'R6C5', 'R7C5'),
];

const cages = [
  new Cage(28, 'R1C1', 'R1C2', 'R1C3', 'R2C2', 'R3C2'),
  new Cage(23, 'R7C7', 'R7C8', 'R7C9', 'R8C8', 'R9C8'),
];

const littleKillers = [
  LittleKiller.fromCells(23, graph.ray('R9C3', -1, -1), geometry),
  LittleKiller.fromCells(25, graph.ray('R9C5', -1, -1), geometry),
  LittleKiller.fromCells(13, graph.ray('R3C9', -1, -1), geometry),
];

const lesserDigitArrows = [
  new GreaterThan('R4C9', 'R5C9'),
  new GreaterThan('R7C6', 'R8C6'),
];

return [
  new Shape('9x9'),
  new Entropic(...peachLine),
  magicSquare(5),
  magicSquare(9),
  ...arrows,
  ...cages,
  ...littleKillers,
  ...lesserDigitArrows,
];
