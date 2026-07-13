// Title: Farrago
// Author: Nicolas Duhail
// Video: https://www.youtube.com/watch?v=PcJNQCckiKs
// Source: https://sudokupad.app/n2yv7e76cf

// Normal sudoku rules apply.
// Blue lines: the 3x3 box borders divide each line into segments; each
// segment of an individual line sums to the same total (RegionSumLine).
// Additionally, digits do not repeat along any individual line
// (AllDifferent per line).

const line0 = ['R6C4', 'R6C5', 'R7C5', 'R7C4', 'R8C4', 'R9C4', 'R9C3', 'R8C3'];
const line1 = ['R6C3', 'R5C2', 'R4C1', 'R3C1', 'R2C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6'];
const line2 = ['R8C5', 'R9C5', 'R9C6', 'R9C7', 'R8C8', 'R9C9', 'R9C8'];
const line3 = ['R2C5', 'R2C6', 'R1C7', 'R2C8', 'R2C9', 'R3C9'];
const line4 = ['R5C6', 'R6C6', 'R7C6', 'R8C6', 'R8C7', 'R7C7', 'R6C7', 'R5C7']; // closed loop
const line5 = ['R3C5', 'R3C6', 'R3C7', 'R3C8', 'R4C8', 'R4C7', 'R4C6', 'R4C5']; // closed loop
const line6 = ['R2C3', 'R3C3', 'R4C3', 'R5C3', 'R5C4', 'R4C4', 'R3C4', 'R2C4']; // closed loop

const lines = [line0, line1, line2, line3, line4, line5, line6];

return [
  new Shape('9x9'),
  new Given('R5C5', 1),
  ...lines.flatMap(line => [
    new RegionSumLine(...line),
    new AllDifferent(...line),
  ]),
];
