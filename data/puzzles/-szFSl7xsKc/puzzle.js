// Title: Junk Drawer
// Author: Sotehr
// Video: https://www.youtube.com/watch?v=-szFSl7xsKc
// Source: https://sudokupad.app/pdnc0ckv87

// Squishdoku uses digits 1-9 on a 7x7 grid. Its nine 3x3 boxes overlap
// by one row or column. The four cross regions in the source are the
// all-different consequences at the intersections of four boxes.

const graph = cellGraph('7x7');

const boxTopLefts = [
  'R1C1', 'R1C3', 'R1C5',
  'R3C1', 'R3C3', 'R3C5',
  'R5C1', 'R5C3', 'R5C5',
];
const boxes = boxTopLefts.map(topLeft => graph.block(topLeft, 3, 3));

const crosses = [
  ['R3C1', 'R3C2', 'R2C3', 'R1C3', 'R3C3', 'R3C4', 'R3C5', 'R4C3', 'R5C3'],
  ['R3C3', 'R3C4', 'R3C5', 'R2C5', 'R1C5', 'R3C6', 'R3C7', 'R4C5', 'R5C5'],
  ['R5C1', 'R5C2', 'R5C3', 'R4C3', 'R3C3', 'R5C4', 'R5C5', 'R6C3', 'R7C3'],
  ['R5C3', 'R5C4', 'R5C5', 'R4C5', 'R3C5', 'R5C6', 'R5C7', 'R6C5', 'R7C5'],
];

const germanWhisper = [
  'R3C4', 'R3C5', 'R2C5', 'R1C4', 'R1C3', 'R2C3', 'R3C4',
];
const modularLoop = [
  'R4C1', 'R5C1', 'R5C2', 'R4C3', 'R3C3', 'R3C2', 'R4C1', 'R5C1',
];
const entropicLoop = [
  'R4C5', 'R5C5', 'R5C6', 'R4C7', 'R3C7', 'R3C6', 'R4C5', 'R5C5',
];
const dutchWhisper = [
  'R5C4', 'R6C5', 'R7C5', 'R7C4', 'R6C3', 'R5C3', 'R5C4',
];

return [
  new Shape('7x7', 9),
  new NoBoxes(),
  ...boxes.map(cells => new AllDifferent(...cells)),
  ...crosses.map(cells => new AllDifferent(...cells)),

  new Whisper(5, ...germanWhisper),
  new Modular(3, ...modularLoop),
  new Entropic(...entropicLoop),
  new Whisper(4, ...dutchWhisper),

  new BlackDot('R4C5', 'R5C5'),
  new WhiteDot('R3C3', 'R4C3'),
  new V('R2C2', 'R2C3'),
  new X('R6C5', 'R6C6'),
];
