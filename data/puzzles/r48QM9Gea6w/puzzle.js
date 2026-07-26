// Title: Medulla
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=r48QM9Gea6w
// Source: https://sudokupad.app/bfw89rdo1o

// Normal sudoku rules apply. Six blue lines are drawn; the 3x3 box borders
// divide each line into segments, and every segment of a given line sums to
// the same total (a per-line constant -- different lines may use different
// sums). RegionSumLine enforces exactly this per line, including the case
// where a line re-enters a box it already passed through (each individual
// segment there sums separately to the same per-line total).

// Cell paths transcribed end-to-end from the drawn line geometry, in stroke
// order.
const lines = [
  ['R2C2', 'R2C1', 'R3C1', 'R4C1', 'R5C2'],
  ['R2C8', 'R2C7', 'R2C6', 'R2C5', 'R1C4', 'R1C3', 'R2C3', 'R3C3', 'R3C2',
   'R4C2', 'R5C3', 'R4C4', 'R5C4', 'R6C3', 'R6C2', 'R6C1', 'R5C1'],
  ['R2C4', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R4C8', 'R5C7', 'R4C6',
   'R5C6', 'R6C6', 'R7C5', 'R7C6', 'R8C6', 'R9C5'],
  ['R4C5', 'R5C5', 'R6C5', 'R6C4', 'R7C3', 'R7C2', 'R7C1', 'R8C1', 'R9C2'],
  ['R8C2', 'R8C3', 'R9C3', 'R9C4', 'R8C4', 'R8C5'],
  ['R7C8', 'R7C9', 'R6C9', 'R5C9', 'R6C8', 'R6C7'],
];

return [
  new Shape('9x9'),
  ...lines.map(cells => new RegionSumLine(...cells)),
];
