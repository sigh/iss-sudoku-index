// Title: July 29, 2021: Slow Thermo
// Author: clover!
// Video: https://www.youtube.com/watch?v=_YomjQ0aIbg
// Source: https://tinyurl.com/2rjfkdva

// Normal sudoku rules apply.
// Along each "slow thermometer" the digits never decrease from the bulb
// (circle) to the tip, but may repeat where sudoku otherwise allows it.
// No dedicated line class exists for this; each thermo is a chain of
// per-edge Pair constraints (bulb-to-tip order) requiring the later cell's
// value to be >= the earlier cell's value.

const shape = new Shape('9x9');

// Cell paths transcribed from the source's line arrays; each starts at its
// drawn circular bulb.
const thermos = [
  ['R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C7', 'R3C6'],
  ['R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9', 'R4C8', 'R3C7', 'R2C6', 'R1C5', 'R2C4', 'R3C3', 'R4C2'],
  ['R1C4', 'R2C3', 'R3C2', 'R4C1'],
  ['R9C6', 'R8C7', 'R7C8', 'R6C9'],
];

const nonDecreasingKey = Pair.fnToKey((a, b) => b >= a, shape);

const slowThermoPairs = thermos.flatMap(
  (cells, i) => cells.slice(0, -1).map(
    (cell, j) => new Pair(nonDecreasingKey, `slow thermo ${i}`, cell, cells[j + 1])));

return [
  shape,
  ...slowThermoPairs,
];
