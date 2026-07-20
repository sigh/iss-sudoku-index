// Title: One (king) to Nine (knights)
// Author: HDev
// Video: https://www.youtube.com/watch?v=h_ciilURoM8
// Source: https://tinyurl.com/HDevSudoku

// Normal Sudoku rules are supplied by Shape. Equal digits are also forbidden
// at knight's and king's moves. Thermometer cell lists run from bulb to tip.
const thermos = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5'],
  ['R2C1', 'R2C2', 'R2C3', 'R2C4'],
  ['R3C1', 'R3C2'],
  ['R6C1', 'R6C2'],
  ['R8C1', 'R8C2', 'R8C3'],
];

const blackDots = [
  ['R2C7', 'R2C8'],
  ['R5C8', 'R6C8'],
  ['R8C5', 'R8C6'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  new AntiKing(),
  ...thermos.map(cells => new Thermo(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
