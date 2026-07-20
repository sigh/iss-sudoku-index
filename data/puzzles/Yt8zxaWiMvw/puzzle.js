// Title: The Snug Bug
// Author: Allagem
// Video: https://www.youtube.com/watch?v=Yt8zxaWiMvw
// Source: https://sudokupad.app/br4k6gdpzz

// A Snug Between Line is a standard Between line whose endpoint digits must
// each be consecutive with at least one interior digit on that same line.
const lines = [
  ['R2C9', 'R2C8', 'R1C7', 'R2C6'],
  ['R2C6', 'R3C7', 'R3C8', 'R4C9', 'R5C8', 'R6C8'],
  ['R6C8', 'R7C9', 'R8C9', 'R8C8'],
  ['R8C8', 'R9C8', 'R9C7', 'R8C6'],
  ['R8C6', 'R7C6', 'R6C6', 'R5C5'],
  ['R5C5', 'R4C5', 'R4C4', 'R3C4', 'R3C3'],
  ['R3C3', 'R3C2', 'R3C1', 'R4C1'],
  ['R4C1', 'R4C2', 'R4C3', 'R3C3'],
  ['R4C1', 'R5C1', 'R6C1', 'R7C1', 'R7C2', 'R7C3'],
  ['R7C3', 'R6C4', 'R5C5'],
  ['R7C3', 'R8C3', 'R9C4', 'R8C5', 'R8C6'],
];

const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);

const snugConstraints = lines.flatMap(line => {
  const first = line[0];
  const last = line[line.length - 1];
  const interior = line.slice(1, -1);
  const consecutiveTo = endpoint => new Or(interior.map(cell =>
    new Pair(consecutiveKey, 'Snug adjacency', endpoint, cell)
  ));

  return [
    new Between(...line),
    consecutiveTo(first),
    consecutiveTo(last),
  ];
});

return [
  new Shape('9x9'),
  new Given('R9C2', 2),
  ...snugConstraints,
];
