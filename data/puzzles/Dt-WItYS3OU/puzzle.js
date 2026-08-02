// Title: Sum Amount of Trouble
// Author: Tyrgannus
// Video: https://www.youtube.com/watch?v=Dt-WItYS3OU
// Source: https://app.crackingthecryptic.com/sudoku/3nG3prjDhd

// Normal Sudoku rules apply. Each drawn cage has distinct digits and totals one
// less than or one more than its displayed sum. The cage table is transcribed
// from the source's outlined cages.
const cages = [
  [12, ['R3C2', 'R3C3', 'R3C4', 'R4C3']],
  [12, ['R3C6', 'R3C7', 'R3C8', 'R4C7']],
  [23, ['R6C4', 'R7C3', 'R7C4']],
  [22, ['R6C6', 'R7C6', 'R7C7']],
  [16, ['R4C5', 'R5C5']],
  [15, ['R8C5', 'R9C5']],
  [8, ['R1C4', 'R1C5', 'R1C6']],
  [16, ['R6C8', 'R7C8', 'R8C6', 'R8C7', 'R8C8']],
  [35, ['R6C2', 'R7C2', 'R8C2', 'R8C3', 'R8C4']],
  [22, ['R1C8', 'R1C9', 'R2C9']],
  [7, ['R1C1', 'R1C2', 'R2C1']],
  [11, ['R5C1', 'R5C2', 'R5C3']],
  [18, ['R5C7', 'R5C8', 'R5C9']],
  [10, ['R8C1', 'R9C1', 'R9C2']],
  [18, ['R8C9', 'R9C8', 'R9C9']],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, cells]) => new Or([
    new Cage(sum - 1, ...cells),
    new Cage(sum + 1, ...cells),
  ])),
];
