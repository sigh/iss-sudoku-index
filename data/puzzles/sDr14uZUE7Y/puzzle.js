// Title: Outside Inn
// Author: Maggie & BremSter
// Video: https://www.youtube.com/watch?v=sDr14uZUE7Y
// Source: https://app.crackingthecryptic.com/fdo/outsideinn

// Normal Sudoku rules apply. Every outside digit occurs in the first three
// cells seen from its labelled side; each killer cage has its drawn total and
// no repeated digit. The arrays transcribe the drawn cage cells and labels.
const outside = (digits, cells) =>
  new ContainAtLeast(digits.join('_'), ...cells);

const cages = [
  [29, ['R1C3', 'R1C4', 'R1C5', 'R2C1', 'R2C2', 'R2C3', 'R3C1']],
  [32, ['R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C5', 'R3C6', 'R3C7']],
  [31, ['R4C1', 'R4C2', 'R4C3', 'R5C3', 'R5C4', 'R6C2', 'R6C3']],
  [35, ['R4C7', 'R4C8', 'R5C6', 'R5C7', 'R6C7', 'R6C8', 'R6C9']],
  [38, ['R8C4', 'R8C6', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7']],
  [15, ['R7C6', 'R7C7', 'R7C8']],
  [15, ['R7C2', 'R7C3', 'R7C4']],
];

const outsideClues = [
  [[3, 4], ['R1C2', 'R2C2', 'R3C2']],
  [[9], ['R1C5', 'R2C5', 'R3C5']],
  [[1, 2], ['R1C8', 'R2C8', 'R3C8']],
  [[5], ['R1C1', 'R1C2', 'R1C3']],
  [[4, 5], ['R5C1', 'R5C2', 'R5C3']],
  [[9], ['R9C1', 'R9C2', 'R9C3']],
  [[2, 6], ['R5C9', 'R5C8', 'R5C7']],
  [[4], ['R7C9', 'R7C8', 'R7C7']],
  [[2], ['R9C9', 'R9C8', 'R9C7']],
  [[2], ['R9C4', 'R8C4', 'R7C4']],
  [[9], ['R9C6', 'R8C6', 'R7C6']],
];

return [
  new Shape('9x9'),
  ...cages.map(([total, cells]) => new Cage(total, ...cells)),
  ...outsideClues.map(([digits, cells]) => outside(digits, cells)),
];
