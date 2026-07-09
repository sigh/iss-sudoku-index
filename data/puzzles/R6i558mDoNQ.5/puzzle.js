// Title: March 31, 2023: Rossini
// Author: clover!
// Video: https://www.youtube.com/watch?v=R6i558mDoNQ
// Source: https://tinyurl.com/2pjx8st8

const givens = [
  ['R1C4', 6],
  ['R1C7', 5],
  ['R2C7', 9],
  ['R3C1', 3],
  ['R3C2', 6],
  ['R3C3', 9],
  ['R3C7', 7],
  ['R4C5', 7],
  ['R4C7', 4],
  ['R5C3', 2],
  ['R5C5', 3],
  ['R5C7', 8],
  ['R6C3', 4],
  ['R6C5', 1],
  ['R7C3', 5],
  ['R7C7', 1],
  ['R7C8', 4],
  ['R7C9', 7],
  ['R8C3', 6],
  ['R9C3', 1],
  ['R9C6', 5],
];

const arrows = [
  ['R1C1', 'R2C1', 'R3C1'],
  ['R1C2', 'R2C2', 'R3C2'],
  ['R3C4', 'R2C4', 'R1C4'],
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C9', 'R1C8', 'R1C7'],
  ['R2C1', 'R2C2', 'R2C3'],
  ['R2C9', 'R2C8', 'R2C7'],
  ['R3C1', 'R3C2', 'R3C3'],
  ['R4C9', 'R4C8', 'R4C7'],
  ['R7C7', 'R7C8', 'R7C9'],
  ['R8C3', 'R8C2', 'R8C1'],
  ['R8C7', 'R8C8', 'R8C9'],
  ['R9C3', 'R9C2', 'R9C1'],
  ['R9C7', 'R9C8', 'R9C9'],
  ['R7C6', 'R8C6', 'R9C6'],
  ['R7C8', 'R8C8', 'R9C8'],
  ['R7C9', 'R8C9', 'R9C9'],
];

const noArrows = [
  ['R3C9', 'R3C8', 'R3C7'],
  ['R4C1', 'R4C2', 'R4C3'],
  ['R5C1', 'R5C2', 'R5C3'],
  ['R5C9', 'R5C8', 'R5C7'],
  ['R6C1', 'R6C2', 'R6C3'],
  ['R6C9', 'R6C8', 'R6C7'],
  ['R7C1', 'R7C2', 'R7C3'],
  ['R9C1', 'R8C1', 'R7C1'],
  ['R9C2', 'R8C2', 'R7C2'],
  ['R1C3', 'R2C3', 'R3C3'],
  ['R9C3', 'R8C3', 'R7C3'],
  ['R9C4', 'R8C4', 'R7C4'],
  ['R1C5', 'R2C5', 'R3C5'],
  ['R9C5', 'R8C5', 'R7C5'],
  ['R1C6', 'R2C6', 'R3C6'],
  ['R1C7', 'R2C7', 'R3C7'],
  ['R9C7', 'R8C7', 'R7C7'],
  ['R1C8', 'R2C8', 'R3C8'],
  ['R1C9', 'R2C9', 'R3C9'],
];

const lt = Pair.fnToKey((a, b) => a < b, 9);
const gt = Pair.fnToKey((a, b) => a > b, 9);

function increasing([a, b, c]) {
  return new And([
    new Pair(lt, 'less than', a, b),
    new Pair(lt, 'less than', b, c),
  ]);
}

function notMonotonic([a, b, c]) {
  return new Or([
    new And([
      new Pair(lt, 'less than', a, b),
      new Pair(gt, 'greater than', b, c),
    ]),
    new And([
      new Pair(gt, 'greater than', a, b),
      new Pair(lt, 'less than', b, c),
    ]),
  ]);
}

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...arrows.map(increasing),
  ...noArrows.map(notMonotonic),
];
