// Title: What Number Am I Thinking Of? (61.8%)
// Author: Br1312te
// Video: https://www.youtube.com/watch?v=RzmjwiyQXgo
// Source: https://sudokupad.app/xnamlvwx9w

// The grid uses an unknown common set of six digits chosen from 1-9.
const shape = new Shape('6x6', 9);

const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R3C1'],
  ['R2C3', 'R3C2', 'R3C3', 'R4C2', 'R4C3', 'R5C3'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C5', 'R2C6', 'R3C6'],
  ['R2C4', 'R3C4', 'R3C5', 'R4C4', 'R4C5', 'R5C4'],
  ['R4C1', 'R5C1', 'R5C2', 'R6C1', 'R6C2', 'R6C3'],
  ['R4C6', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'],
];

const yellowLines = [
  ['R2C5', 'R1C5', 'R2C6'],
  ['R2C2', 'R1C2', 'R2C1'],
  ['R4C2', 'R5C3', 'R5C4', 'R4C5'],
  ['R3C3', 'R4C3', 'R3C4'],
  ['R6C5', 'R5C6'],
];

// One direction of a Fibonacci line starts a,b with b = a + 1, then every
// later digit equals the sum of its two predecessors.
const directedFibonacci = cells => new And([
  new Sum(1, [cells[0], -1], cells[1]),
  ...cells.slice(2).map((cell, i) =>
    new EqualSum([cells[i], cells[i + 1]], [cell])),
]);

// The artwork does not mark a start, so either endpoint may begin the sequence.
const fibonacciLines = yellowLines.map(cells => new Or([
  directedFibonacci(cells),
  directedFibonacci(cells.toReversed()),
]));

return [
  shape,
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('6x6', ...cells)),
  new RegionSameValues(),
  ...fibonacciLines,
];
