// Title: O, the Pelican
// Author: Dag H
// Video: https://www.youtube.com/watch?v=9yHG6_2Lmc0
// Source: https://app.crackingthecryptic.com/sudoku/gMRQT38J3m

// Normal sudoku rules (default rows/cols/boxes). Two given digits. Twelve
// arrows: digits along an arrow sum to the digit in that arrow's circled
// bulb. Two circles (R4C4 and R6C4) each anchor two separate arrow arms
// (a forked/Y-shaped arrow drawn with one shared bulb) -- encoded as two
// independent Arrow constraints per shared bulb.

// Arrow bulb (first cell) and arm cells, transcribed from the drawn `arrows`
// wayPoints (interpolated to full cell paths) and cross-checked against the
// `underlays` circle positions.
const arrows = [
  ['R1C6', 'R1C5', 'R1C4'],
  ['R2C9', 'R2C8', 'R2C7'],
  ['R5C6', 'R4C6', 'R4C7'],
  ['R5C8', 'R6C8', 'R6C7'],
  ['R5C2', 'R5C1', 'R4C2'],
  ['R5C5', 'R5C4', 'R5C3'],
  ['R9C4', 'R9C3', 'R9C2'],
  ['R8C7', 'R8C8', 'R8C9'],
  ['R4C4', 'R3C3', 'R2C3', 'R3C2'],
  ['R4C4', 'R3C5', 'R2C5', 'R3C6'],
  ['R6C4', 'R7C3', 'R8C3', 'R7C2'],
  ['R6C4', 'R7C5', 'R8C5', 'R7C6'],
];

return [
  new Shape('9x9'),
  new Given('R5C9', 6),
  new Given('R9C6', 6),
  ...arrows.map(cells => new Arrow(...cells)),
];
