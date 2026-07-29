// Title: Center Clash
// Author: Blashyrkh
// Video: https://www.youtube.com/watch?v=-egiLh6s-nw
// Source: https://sudokupad.app/ur2bt9j05l

// Normal Sudoku rules apply. Each source thermometer path is listed from bulb to tip.
const thermometers = [
  ['R4C3', 'R4C2', 'R3C2', 'R3C3', 'R2C4', 'R3C4'],
  ['R4C8', 'R4C9', 'R3C8', 'R2C7', 'R3C6', 'R2C6'],
  ['R6C1', 'R6C2', 'R7C2', 'R8C3', 'R8C4', 'R7C4'],
  ['R6C7', 'R6C8', 'R7C8', 'R8C7', 'R8C6', 'R9C6'],
];

return [
  new Shape('9x9'),
  ...thermometers.map(cells => new Thermo(...cells)),
];
