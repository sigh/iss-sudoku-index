// Title: Entropea
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=xdtTT0Vx5bw
// Source: https://sudokupad.app/3xkgia0gur

// Normal sudoku rules apply (standard rows/columns/boxes, the ISS default).
// Split pea lines: the digits strictly between a line's two green-circle
// endpoints sum to the two-digit number the endpoint digits form, read in
// either order.
// Entropic lines: every line, including its two endpoints, is entropic --
// each sliding window of 3 consecutive cells along the drawn path holds one
// low digit (1-3), one medium digit (4-6), and one high digit (7-9).

// Each line's cells, ordered start-to-end as drawn; the first and last cell
// of each path are its two green-circle endpoints.
const LINES = {
  A: ['R2C7', 'R1C8', 'R2C8', 'R2C9', 'R3C8'],
  B: [
    'R7C8', 'R6C9', 'R6C8', 'R6C7', 'R5C7', 'R5C8', 'R5C9', 'R4C9', 'R4C8',
    'R3C7', 'R2C6', 'R1C6', 'R1C5', 'R2C5', 'R3C5', 'R3C4', 'R2C4', 'R1C4',
    'R1C3',
  ],
  C: ['R9C1', 'R8C2', 'R7C3', 'R6C4'],
  D: ['R3C6', 'R4C5', 'R4C4', 'R4C3', 'R3C2', 'R4C1'],
  E: ['R4C7', 'R5C6', 'R6C6', 'R7C6', 'R8C7', 'R9C6'],
  F: ['R8C8', 'R9C8', 'R8C9', 'R7C9'],
  G: ['R1C2', 'R2C3', 'R2C2', 'R3C1'],
};

// Split-pea sum: the between-cells sum to the two-digit number formed by the
// endpoint digits, either order -- an Or of the same Sum with the -10/-1
// coefficient swapped between the two endpoint cells.
function eitherOrderTotal(a, b, betweenCells) {
  return new Or([
    new Sum(0, ...betweenCells, [a, -10], [b, -1]),
    new Sum(0, ...betweenCells, [a, -1], [b, -10]),
  ]);
}

const splitPeaSums = Object.values(LINES).map(path => {
  const a = path[0];
  const b = path[path.length - 1];
  const between = path.slice(1, -1);
  return eitherOrderTotal(a, b, between);
});

const entropicLines = Object.values(LINES).map(path => new Entropic(...path));

return [
  new Shape('9x9'),
  ...splitPeaSums,
  ...entropicLines,
];
