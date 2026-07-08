// Title: Four Octagons
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=vNfwa4wPliY
// Source: https://sudokupad.app/sd02li6q2c

const constraints = [
  new Shape('9x9'),

  new Given('R1C5', 1),
  new Given('R2C8', 4),
  new Given('R6C4', 4),
  new Given('R8C3', 4),

  new Cage(17, 'R2C2', 'R2C3', 'R3C2', 'R3C3'),
  new Cage(20, 'R2C7', 'R2C8', 'R3C7', 'R3C8'),
  new Cage(23, 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'),
  new Cage(18, 'R7C2', 'R7C3', 'R8C2', 'R8C3'),
  new Cage(22, 'R7C7', 'R7C8', 'R8C7', 'R8C8'),
];

const roseKey = Pair.fnToKey((a, b) => Math.abs(a - b) >= 6, 9);
const roseOctagons = [
  ['R7C6', 'R8C6', 'R9C7', 'R9C8', 'R8C9', 'R7C9', 'R6C8', 'R6C7'],
  ['R6C2', 'R6C3', 'R7C4', 'R8C4', 'R9C3', 'R9C2', 'R8C1', 'R7C1'],
  ['R2C6', 'R3C6', 'R4C7', 'R4C8', 'R3C9', 'R2C9', 'R1C8', 'R1C7'],
  ['R1C2', 'R1C3', 'R2C4', 'R3C4', 'R4C3', 'R4C2', 'R3C1', 'R2C1'],
];

for (const octagon of roseOctagons) {
  constraints.push(new Pair(roseKey, 'rose octagon', ...octagon, octagon[0]));
}

return constraints;
