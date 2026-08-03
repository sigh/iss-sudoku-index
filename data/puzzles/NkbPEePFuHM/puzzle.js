// Title: Consecutive Thermo
// Author: clover!
// Video: https://www.youtube.com/watch?v=NkbPEePFuHM
// Source: https://app.crackingthecryptic.com/sudoku/PmLFFN27Hq

// Normal sudoku rules apply. Digits along thermometers must increase from the
// bulb end and must also be consecutive (e.g. 23456). Each thermometer is
// encoded as a Thermo (strictly increasing from the first cell, the bulb) and
// a Renban (the cells hold a set of consecutive digits) on the same cells;
// together they force a strictly increasing run of consecutive digits from
// the bulb.
//
// Thermo cell lists are transcribed from the drawn lines (bulb first, per the
// underlay circle on each line's first cell).
const thermoCells = [
  ['R4C3', 'R3C2', 'R2C2', 'R1C2'],
  ['R3C1', 'R4C2', 'R5C2', 'R6C2'],
  ['R9C7', 'R8C6', 'R8C5', 'R8C4'],
  ['R7C6', 'R8C7', 'R8C8', 'R8C9'],
  ['R1C7', 'R2C7', 'R3C7', 'R3C8', 'R3C9'],
  ['R6C9', 'R7C8'],
  ['R2C3', 'R1C4'],
  ['R9C1', 'R8C1', 'R9C2'],
  ['R4C7', 'R3C6'],
  ['R5C5', 'R6C4'],
];

return [
  new Shape('9x9'),
  ...thermoCells.map(cells => new Thermo(...cells)),
  ...thermoCells.map(cells => new Renban(...cells)),
];
