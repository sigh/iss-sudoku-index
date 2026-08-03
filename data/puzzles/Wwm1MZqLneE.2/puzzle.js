// Title: The Ministry of Random Walks
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=Wwm1MZqLneE
// Source: https://tinyurl.com/ymsnsr3y

// Thermo: 4 thermometers, digits strictly increase from bulb (first cell)
// to tip (last cell). No givens.
const thermos = [
  ['R9C5', 'R9C4', 'R9C3', 'R8C3', 'R8C2', 'R7C2', 'R7C3', 'R6C3', 'R6C4'],
  ['R5C4', 'R5C5', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R5C8', 'R5C7', 'R4C7'],
  ['R4C8', 'R3C8', 'R3C7', 'R2C7', 'R2C6', 'R2C5', 'R1C5', 'R1C4', 'R1C3'],
  ['R2C3', 'R2C2', 'R1C2', 'R1C1'],
].map(cells => new Thermo(...cells));

return [
  new Shape('9x9'),
  ...thermos,
];
