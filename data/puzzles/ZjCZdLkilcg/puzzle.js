// Title: Offset Circles
// Author: Blobz
// Video: https://www.youtube.com/watch?v=ZjCZdLkilcg
// Source: https://sudokupad.app/blobz/offset-circles

// Normal sudoku rules apply.
//
// Each numbered black circle requires its digit to occur among the four cells
// touching it. A blue circle's digit counts its occurrences among all blue
// circles. The four cells along each pink circle form a non-repeating
// consecutive set. Cells separated by a white dot are consecutive.

const blackCircleConstraints = [
  new Quad('R2C2', 1), new Quad('R2C5', 2), new Quad('R2C8', 3),
  new Quad('R5C2', 4), new Quad('R5C5', 5), new Quad('R5C8', 6),
  new Quad('R8C2', 7), new Quad('R8C5', 8), new Quad('R8C8', 9),
];

const blueCircles = [
  'R1C1', 'R4C1', 'R1C4',
  'R4C4', 'R1C7', 'R4C7',
  'R7C4', 'R7C7', 'R8C2',
];

const pinkCircles = [
  ['R3C2', 'R3C3', 'R4C2', 'R4C3'],
  ['R3C6', 'R3C7', 'R4C6', 'R4C7'],
  ['R6C3', 'R6C4', 'R7C3', 'R7C4'],
  ['R6C6', 'R6C7', 'R7C6', 'R7C7'],
];

const whiteDots = [
  ['R1C5', 'R1C6'],
  ['R4C9', 'R5C9'],
  ['R9C7', 'R9C8'],
  ['R6C1', 'R7C1'],
];

const pinkCircleConstraints = pinkCircles.map(cells => new Renban(...cells));
const whiteDotConstraints = whiteDots.map(cells => new WhiteDot(...cells));

return [
  new Shape('9x9'),
  ...blackCircleConstraints,
  new CountingCircles(...blueCircles),
  ...pinkCircleConstraints,
  ...whiteDotConstraints,
];
