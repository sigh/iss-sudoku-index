// Title: 7 and 8 make 15
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=912rzhP0jvE
// Source: https://app.crackingthecryptic.com/sudoku/TbhRHQrP7Q

// Normal Sudoku rules apply. Each drawn cage has the stated sum and no repeated digit.
// The cage list transcribes the source's drawn two-cell cages.
const cages = [
  [7, 'R1C2', 'R2C2'], [7, 'R2C3', 'R3C3'], [7, 'R3C4', 'R4C4'],
  [7, 'R1C5', 'R2C5'], [8, 'R1C8', 'R2C8'], [8, 'R2C7', 'R3C7'],
  [8, 'R3C6', 'R4C6'], [15, 'R4C5', 'R5C5'], [8, 'R5C4', 'R6C4'],
  [8, 'R6C3', 'R7C3'], [8, 'R7C2', 'R8C2'], [8, 'R8C1', 'R9C1'],
  [7, 'R5C1', 'R5C2'], [8, 'R5C8', 'R5C9'], [7, 'R5C6', 'R6C6'],
  [7, 'R6C7', 'R7C7'], [7, 'R7C8', 'R8C8'], [7, 'R8C9', 'R9C9'],
];

return [
  new Shape('9x9'),
  new Given('R4C1', 8), new Given('R4C9', 1),
  new Given('R7C1', 5), new Given('R7C9', 8),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
