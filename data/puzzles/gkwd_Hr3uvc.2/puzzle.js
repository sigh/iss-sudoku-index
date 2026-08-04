// Title: Another Humanmade Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=gkwd_Hr3uvc
// Source: https://tinyurl.com/mthkaypj

// Normal sudoku rules apply (rows, columns, boxes all-different; no givens).
// 12 regions are drawn, each simultaneously a killer cage (digits sum to the
// total, no repeats) and a thermometer (digits strictly increase away from
// the bulb). Every cage's cell set exactly equals one thermometer's cell
// set, so each region below is encoded once as a paired Cage+Thermo. Cell
// order is bulb -> tip, taken from the payload's thermometer.lines path
// order; the matching cage total comes from the killercage entry with the
// identical cell set.
const thermoCages = [
  [10, ['R4C3', 'R3C3', 'R3C4', 'R4C4']],
  [14, ['R4C6', 'R4C7', 'R3C7', 'R3C6']],
  [30, ['R6C7', 'R7C7', 'R7C6', 'R6C6']],
  [26, ['R7C4', 'R7C3', 'R6C3', 'R6C4']],
  [22, ['R3C2', 'R3C1', 'R4C1']],
  [24, ['R4C9', 'R3C9', 'R3C8']],
  [9, ['R6C9', 'R7C9', 'R7C8']],
  [7, ['R7C2', 'R7C1', 'R6C1']],
  [13, ['R2C3', 'R1C3', 'R1C4']],
  [10, ['R2C7', 'R1C7', 'R1C6']],
  [14, ['R9C6', 'R9C7', 'R8C7']],
  [19, ['R9C4', 'R9C3', 'R8C3']],
];

return [
  new Shape('9x9'),
  ...thermoCages.map(([sum, cells]) => new Cage(sum, ...cells)),
  ...thermoCages.map(([, cells]) => new Thermo(...cells)),
];
