// Title: Seven Arrows
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=1wGrV70pfo0
// Source: https://sudokupad.app/rM7bbtdT6r

// Standard 9x9 Sudoku; each arrow's arm sums to its circle, and all seven circles differ.
// Arrow cell lists and circle cells are transcribed from the seven drawn grey arrows and circles.
const arrows = [
  ['R2C2', 'R3C3', 'R4C4'],
  ['R2C5', 'R3C5', 'R4C5'],
  ['R2C8', 'R3C7', 'R4C6'],
  ['R5C2', 'R5C3', 'R5C4'],
  ['R8C2', 'R7C3', 'R6C4'],
  ['R8C8', 'R7C7', 'R6C6'],
  ['R5C8', 'R5C7', 'R5C6'],
];

const circleCells = arrows.map(([circle]) => circle);

return [
  new Shape('9x9'),
  new Given('R1C1', 6),
  new Given('R1C8', 5),
  new Given('R5C5', 7),
  new Given('R6C3', 8),
  new Given('R9C8', 9),
  ...arrows.map((cells) => new Arrow(...cells)),
  new AllDifferent(...circleCells),
];
