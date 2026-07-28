// Title: Kill Or Quads
// Author: Matt Tressel
// Video: https://www.youtube.com/watch?v=1T8O4LUXGmE
// Source: https://sudokupad.app/qzcc0tx1yd

// Normal Sudoku rules apply. Each labelled circle is independently either a
// Killer Quad (its surrounding 2x2 sums to the label) or a Quadruple (both
// digits of its label occur in that 2x2); the solver determines the choice.
// Every [top-left cell, label] pair is transcribed from a drawn circle.
const circles = [
  ['R1C1', 27], ['R1C4', 27], ['R1C7', 27],
  ['R2C2', 14], ['R2C5', 24], ['R2C8', 14],
  ['R4C1', 12], ['R4C4', 26], ['R4C7', 12],
  ['R5C2', 14], ['R5C5', 15], ['R5C8', 23],
  ['R7C1', 12], ['R7C4', 27], ['R7C7', 12],
  ['R8C2', 14], ['R8C5', 13], ['R8C8', 13],
];

const cellsAround = topLeft => {
  const {row, col} = parseCellId(topLeft);
  return [
    topLeft,
    makeCellId(row, col + 1),
    makeCellId(row + 1, col),
    makeCellId(row + 1, col + 1),
  ];
};

// Or retains both rule readings rather than deciding a circle's type outside
// the puzzle. The standard 3x3 box rule already makes the four cells distinct.
const killOrQuads = circles.map(([topLeft, label]) => new Or([
  new Cage(label, ...cellsAround(topLeft)),
  new Quad(topLeft, ...String(label).split('').map(Number)),
]));

return [
  new Shape('9x9'),
  ...killOrQuads,
];
