// Title: 1 Last Dream
// Author: Cassinii
// Video: https://www.youtube.com/watch?v=XS4c1OoSmEg
// Source: https://sudokupad.app/dq0yiosab8

// 6x6 irregular Sudoku with two equal-position clone regions.
// The little killer clue is drawn above the top edge and points to the
// down-left diagonal starting at R1C5.

const regions = [
  ['R1C1', 'R1C2', 'R2C1', 'R3C1', 'R4C1', 'R5C1'],
  ['R1C3', 'R1C4', 'R1C5', 'R2C2', 'R2C3', 'R3C2'],
  ['R2C4', 'R2C5', 'R3C3', 'R3C4', 'R4C3', 'R5C3'],
  ['R4C2', 'R5C2', 'R6C1', 'R6C2', 'R6C3', 'R6C4'],
  ['R1C6', 'R2C6', 'R3C5', 'R3C6', 'R4C4', 'R4C5'],
  ['R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C5', 'R6C6'],
];

const graph = cellGraph('6x6');
return [
  new Shape('6x6'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('6x6', ...cells)),

  new SameValues(2, 'R5C1', 'R4C6'),
  new SameValues(2, 'R6C1', 'R5C6'),

  new Whisper(3, 'R5C1', 'R6C1'),
  new Renban('R1C6', 'R2C6'),
  new Thermo('R2C3', 'R2C4'),

  new Cage(7, 'R4C3', 'R4C4'),
  LittleKiller.fromCells(25, graph.ray('R1C5', 1, -1), cellGeometry('6x6')),

  new WhiteDot('R1C1', 'R1C2'),
  new BlackDot('R6C5', 'R6C6'),
];
