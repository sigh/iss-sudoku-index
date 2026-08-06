// Title: Two Arrows and a Tenline
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=gwUXd_GMrzo
// Source: https://sudokupad.app/igzcothc9f

// Normal 6x6 Sudoku with 2x3 boxes.
// Each arrow arm sums to its attached circle, and the grey line can be
// partitioned into contiguous segments whose digits each sum to 10.
const tenLine = [
  'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R5C3', 'R4C4', 'R3C3',
  'R4C2', 'R4C1', 'R3C1', 'R3C2', 'R2C1', 'R1C1', 'R1C2',
  'R2C3', 'R2C2', 'R1C3', 'R2C4', 'R1C4', 'R1C5', 'R1C6',
  'R2C5', 'R3C5', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R5C5',
];

return [
  new Shape('6x6'),
  new Arrow('R5C1', 'R5C2', 'R4C3', 'R3C4'),
  new Arrow('R6C6', 'R6C5', 'R5C4', 'R4C5'),
  new SumLine(10, ...tenLine),
];
