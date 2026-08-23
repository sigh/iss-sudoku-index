// Title: Ascending Order
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=WxgEvD-UXDM
// Source: https://app.crackingthecryptic.com/sudoku/7b8G6LDQGH

// Normal sudoku rules apply. Digits along thermometers must increase from
// the bulb (the rounded end). All 11 thermometers are listed bulb-first;
// two of them (#4, #10 below) are drawn tip-first in the source payload and
// are reversed here per the drawn bulb overlay.

const GIVENS = [
  ['R1C3', 1], ['R1C6', 2], ['R2C7', 3], ['R3C1', 4], ['R3C2', 5],
  ['R3C5', 6], ['R3C8', 7], ['R3C9', 8], ['R4C4', 9], ['R6C6', 1],
  ['R7C1', 2], ['R7C2', 3], ['R7C5', 4], ['R7C8', 5], ['R7C9', 6],
  ['R8C3', 7], ['R9C4', 8], ['R9C7', 9],
];

const THERMOS = [
  ['R4C8', 'R4C7'],
  ['R5C7', 'R5C8', 'R5C9'],
  ['R8C9', 'R8C8', 'R9C8'],
  ['R8C7', 'R9C6'],
  ['R9C3', 'R8C4'], // drawn R8C4-R9C3, bulb at R9C3
  ['R6C2', 'R6C3'],
  ['R5C1', 'R5C2', 'R5C3'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R2C6', 'R1C7'],
  ['R2C3', 'R1C4'],
  ['R2C1', 'R2C2', 'R1C2'], // drawn R1C2-R2C2-R2C1, bulb at R2C1
];

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...THERMOS.map((cells) => new Thermo(...cells)),
];
