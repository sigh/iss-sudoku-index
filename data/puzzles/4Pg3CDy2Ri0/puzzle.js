// Title: Rip City
// Author: Merdock
// Video: https://www.youtube.com/watch?v=4Pg3CDy2Ri0
// Source: https://sudokupad.app/r3n9cwda1t

// Rules encoded here:
//  - Normal sudoku (no given digits).
//  - Parity line: adjacent digits on the red line alternate even/odd.
//  - White kropki dots: a white dot separates consecutive digits on two cells
//    that are adjacent along the red line, and all such dots are given -- so a
//    red-line adjacency with no dot holds non-consecutive digits. Two red-line
//    cells that are grid-adjacent but not adjacent along the line are
//    unconstrained (the rules give r2c6/r2c7 as the worked example).
//  - Killer cages: the four single-cell corner cages act as one combined cage
//    whose four digits sum to 16.
//  - Negative diagonal: digits do not repeat on the marked diagonal.
// Nothing is omitted.

// The red line is drawn as two strokes of the same colour and width that meet
// inside R1C5 and inside R9C5: an open stroke across the middle of the grid,
// and a circle around it. Cell paths transcribed from the drawn strokes; every
// step is between orthogonally adjacent cells.
const redStroke = [
  'R9C5', 'R8C5', 'R8C4', 'R7C4', 'R7C3', 'R6C3', 'R6C4', 'R6C5', 'R5C5',
  'R4C5', 'R4C6', 'R4C7', 'R3C7', 'R3C6', 'R2C6', 'R2C5', 'R1C5',
];
const redCircle = [
  'R9C5', 'R9C6', 'R9C7', 'R8C7', 'R8C8', 'R7C8', 'R7C9', 'R6C9', 'R5C9',
  'R4C9', 'R3C9', 'R3C8', 'R2C8', 'R2C7', 'R1C7', 'R1C6', 'R1C5', 'R1C4',
  'R1C3', 'R2C3', 'R2C2', 'R3C2', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1',
  'R7C2', 'R8C2', 'R8C3', 'R9C3', 'R9C4',
];

// The 33 drawn white dots, each as the pair of cells it sits between.
const whiteDots = [
  ['R8C5', 'R9C5'], ['R7C4', 'R8C4'], ['R7C3', 'R7C4'],
  ['R6C3', 'R7C3'], ['R6C3', 'R6C4'], ['R6C4', 'R6C5'],
  ['R5C5', 'R6C5'], ['R4C5', 'R5C5'], ['R4C5', 'R4C6'],
  ['R4C6', 'R4C7'], ['R3C7', 'R4C7'], ['R3C6', 'R3C7'],
  ['R2C6', 'R3C6'], ['R1C5', 'R2C5'], ['R1C6', 'R1C7'],
  ['R1C7', 'R2C7'], ['R2C8', 'R3C8'], ['R3C9', 'R4C9'],
  ['R5C9', 'R6C9'], ['R6C9', 'R7C9'], ['R7C8', 'R7C9'],
  ['R7C8', 'R8C8'], ['R8C7', 'R9C7'], ['R9C6', 'R9C7'],
  ['R9C3', 'R9C4'], ['R8C3', 'R9C3'], ['R7C1', 'R7C2'],
  ['R6C1', 'R7C1'], ['R4C1', 'R5C1'], ['R3C1', 'R4C1'],
  ['R2C2', 'R3C2'], ['R1C3', 'R2C3'], ['R1C3', 'R1C4'],
];

// Every pair of cells adjacent along the red line: consecutive cells of the
// open stroke, plus consecutive cells of the circle including its wrap-around.
const edgeKey = (a, b) => [a, b].sort().join('|');
const lineEdges = [
  ...redStroke.slice(1).map((cell, i) => [redStroke[i], cell]),
  ...redCircle.map((cell, i) => [cell, redCircle[(i + 1) % redCircle.length]]),
];

// "All dots along the red line are given": the line adjacencies with no drawn
// dot are the ones the negative applies to.
const dotted = new Set(whiteDots.map(([a, b]) => edgeKey(a, b)));
const dotlessEdges = lineEdges.filter(([a, b]) => !dotted.has(edgeKey(a, b)));
const notConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

return [
  new Shape('9x9'),

  // Modular(2) is the alternating odd/even parity line. One call per drawn
  // stroke; the circle repeats its first cell so the wrap-around step is also
  // covered. Together the two calls cover all 48 line adjacencies.
  new Modular(2, ...redStroke),
  new Modular(2, ...redCircle, redCircle[0]),

  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...dotlessEdges.map(([a, b]) => new Pair(notConsecutive, 'no dot', a, b)),

  // Four single-cell corner cages read as one combined cage. The rules state
  // only the total, so this is a plain Sum rather than a Cage; the four cells
  // are in any case pairwise distinct already except for R1C9/R9C1 -- the other
  // five pairs share a row, a column, or the marked diagonal.
  new Sum(16, 'R1C1', 'R1C9', 'R9C1', 'R9C9'),

  // Direction -1 is the "\" diagonal, the one drawn from R1C1 to R9C9.
  new Diagonal(-1),
];
