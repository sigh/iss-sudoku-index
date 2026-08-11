// Title: Binary Meter
// Author: Tino Khong
// Video: https://www.youtube.com/watch?v=c98vNNLpY4E
// Source: https://app.crackingthecryptic.com/sudoku/hrgPfnGMLb

// Normal sudoku rules apply. Digits do not repeat along the two marked diagonals
// (main and anti). Digits along each thermometer strictly increase from the
// bulb, and for a thermometer of length n the sum of its digits is 2^n.
//
// R5C4 carries a grey bulb marker and is the shared start cell of two separate
// grey thermometer arms (one through R6C5-R7C6, one through R5C5-R5C6): a
// "Y" thermometer with one bulb and two independent increasing arms, each
// totalled on its own per the length-n rule.

const thermometers = [
  new Thermo('R2C6', 'R3C7', 'R3C6', 'R3C5'),
  new Thermo('R5C4', 'R6C5', 'R7C6'),
  new Thermo('R5C4', 'R5C5', 'R5C6'),
  new Thermo('R2C2', 'R3C2', 'R4C2', 'R5C2'),
  new Thermo('R9C1', 'R9C2', 'R8C2', 'R7C1', 'R7C2'),
  new Thermo('R9C5', 'R8C4', 'R7C5', 'R7C4'),
  new Thermo('R5C5', 'R4C5', 'R3C5', 'R2C5', 'R1C5'),
  new Thermo('R6C2', 'R5C1', 'R4C2', 'R3C3'),
  new Thermo('R3C1', 'R4C1', 'R4C2', 'R4C3'),
  new Thermo('R7C9', 'R7C8', 'R6C9', 'R5C9'),
];

// sum = 2^n, n = the arm's own cell count -- derived from each Thermo's cells
// rather than restated, so the totals cannot drift from the drawn arm lengths.
const sums = thermometers.map(t => new Sum(2 ** t.cells.length, ...t.cells));

return [
  new Shape('9x9'),
  ...thermometers,
  ...sums,
  new Diagonal(-1),
  new Diagonal(1),
];
