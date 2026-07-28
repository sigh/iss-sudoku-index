// Title: Nobody's perfect
// Author: Lithium-Ion
// Video: https://www.youtube.com/watch?v=UBuQxAfGF-o
// Source: https://sudokupad.app/3ppzefe55t

// Normal Sudoku rules apply. Orthogonally adjacent digits are not consecutive.
// Each drawn killer cage has distinct digits and a perfect-number sum. The rules
// state that the only perfect totals below 45 are 6 and 28.
const cages = [
  ['R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C2', 'R9C3'],
  ['R2C1', 'R3C1'],
  ['R2C2', 'R3C2'],
  ['R1C2', 'R1C3', 'R2C3', 'R3C3', 'R4C3'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C5', 'R2C6'],
  ['R1C7', 'R2C7'],
  ['R1C8', 'R2C8'],
  ['R3C9'],
  ['R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R7C6', 'R8C6'],
  ['R7C5', 'R8C5'],
  ['R7C4'],
  ['R4C4', 'R5C4'],
];
// Cage cells transcribed from the drawn outlined cages in the source payload.
const perfectCages = cages.map(cells => new Or([
  new Cage(6, ...cells),
  new Cage(28, ...cells),
]));

return [
  new Shape('9x9'),
  new AntiConsecutive(),
  ...perfectCages,
];
