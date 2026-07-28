// Title: Medieval Upheaval 4
// Author: Nordy
// Video: https://www.youtube.com/watch?v=qDdpQjR8xRQ
// Source: https://sudokupad.app/0of52e2mjx

// Chaos Construction: nine orthogonally connected 9-cell regions contain
// digits 1-9 once each. Pink lines are renbans. Chess Sums are omitted:
// their region-dependent king, knight, and bishop sum-count condition is not
// included in this constraint string.

// Pink-line paths transcribed from the seven drawn line entries.
const RENBANS = [
  ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'],
  ['R2C4', 'R2C5', 'R3C5'],
  ['R8C7', 'R7C7', 'R7C8', 'R6C8', 'R5C8'],
  ['R5C3', 'R5C2', 'R5C1'],
  ['R4C5', 'R5C5', 'R5C4'],
  ['R4C4', 'R4C3', 'R3C3', 'R3C2', 'R2C2', 'R2C3'],
  ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R2C8', 'R3C8'],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...RENBANS.map(cells => new Renban(...cells)),
];
