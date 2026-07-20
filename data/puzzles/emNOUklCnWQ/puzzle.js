// Title: Tasting menu
// Author: Niclas Kupper
// Video: https://www.youtube.com/watch?v=emNOUklCnWQ
// Source: https://sudokupad.app/ydtwtpul8o

// Normal sudoku. Blue cells are smaller than every orthogonal neighbour;
// green cells are larger than every orthogonal neighbour. The remaining
// constraints are the drawn Kropki dots, XV marks, thermometer, closed
// Dutch-whispers loop, and arrows.

const grid = cellGraph('9x9');

const minima = ['R2C2', 'R1C3'];
const maxima = ['R8C8', 'R7C9'];

const extrema = [
  ...minima.flatMap(cell => grid.neighbours(cell).map(
    neighbour => new GreaterThan(neighbour, cell))),
  ...maxima.flatMap(cell => grid.neighbours(cell).map(
    neighbour => new GreaterThan(cell, neighbour))),
];

const whiteDots = [
  new WhiteDot('R2C4', 'R2C5'),
  new WhiteDot('R1C5', 'R1C6'),
];

const blackDots = [
  new BlackDot('R8C1', 'R8C2'),
  new BlackDot('R7C2', 'R7C3'),
  new BlackDot('R8C3', 'R9C3'),
];

const xvMarks = [
  new X('R8C4', 'R8C5'),
  new X('R7C5', 'R7C6'),
  new X('R5C5', 'R6C5'),
  new V('R2C7', 'R2C8'),
  new V('R1C8', 'R1C9'),
];

const thermo = new Thermo(
  'R5C1', 'R4C1', 'R4C2', 'R4C3', 'R5C3', 'R6C3', 'R6C2', 'R5C2');

// The repeated first cell enforces the closing edge of the drawn loop.
const dutchWhisper = new Whisper(
  4,
  'R4C5', 'R5C5', 'R4C6', 'R5C6', 'R6C6',
  'R6C5', 'R6C4', 'R5C4', 'R4C4', 'R4C5');

const arrows = [
  new Arrow('R6C7', 'R5C7', 'R4C8'),
  new Arrow('R4C9', 'R5C9', 'R6C8'),
];

return [
  new Shape('9x9'),
  ...extrema,
  ...whiteDots,
  ...blackDots,
  ...xvMarks,
  thermo,
  dutchWhisper,
  ...arrows,
];
