// Title: April 14, 2022: Crotalus
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=wnE1j-agx2Y
// Source: https://tinyurl.com/2s3wyuw8
//
// Normal sudoku rules apply. Digits along thermometers must strictly
// increase from bulb (round end) to tip. Each thermometer is given below
// bulb-first, matching the payload's waypoint order.

const GIVENS = [['R8C9', 4]];

const THERMOS = [
  ['R4C5', 'R4C6', 'R5C6', 'R6C6', 'R6C5', 'R6C4', 'R5C4', 'R4C4'],
  ['R6C9', 'R5C9', 'R4C9', 'R4C8', 'R5C8', 'R5C7', 'R6C7', 'R6C8'],
  ['R1C4', 'R2C4', 'R3C4', 'R3C5', 'R3C6', 'R2C6', 'R2C5', 'R1C5'],
  ['R9C6', 'R9C5', 'R8C5', 'R8C4', 'R7C4', 'R7C5', 'R7C6', 'R8C6'],
  ['R3C7', 'R3C8', 'R2C8', 'R2C7', 'R1C7', 'R1C8', 'R1C9', 'R2C9'],
  ['R5C2', 'R6C2', 'R6C1', 'R5C1', 'R4C1', 'R4C2', 'R4C3', 'R5C3'],
];

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...THERMOS.map((cells) => new Thermo(...cells)),
];
