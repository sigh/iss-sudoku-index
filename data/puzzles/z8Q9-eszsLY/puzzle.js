// Title: Broken Fence
// Author: Myxo
// Video: https://www.youtube.com/watch?v=z8Q9-eszsLY
// Source: https://app.crackingthecryptic.com/sudoku/9G783LH9D8

// Standard Sudoku rules apply. The blue / diagonal is all-different. Each listed
// five-cell cage sums to 28 (the rules do not require cage digits to be distinct).
// Grey lines are thermometers from the circled bulb. The outside 27 is the sum of
// R4C1-R3C2-R2C3-R1C4; its digits may repeat where normal Sudoku permits.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// The nine cross-shaped 28 cages drawn in the source.
const cages = [
  ['R1C2', 'R2C2', 'R3C2', 'R2C1', 'R2C3'],
  ['R1C5', 'R2C5', 'R3C5', 'R2C4', 'R2C6'],
  ['R1C8', 'R2C8', 'R3C8', 'R2C7', 'R2C9'],
  ['R4C2', 'R5C2', 'R6C2', 'R5C1', 'R5C3'],
  ['R4C5', 'R5C5', 'R6C5', 'R5C4', 'R5C6'],
  ['R4C8', 'R5C8', 'R6C8', 'R5C7', 'R5C9'],
  ['R7C2', 'R8C2', 'R9C2', 'R8C1', 'R8C3'],
  ['R7C5', 'R8C5', 'R9C5', 'R8C4', 'R8C6'],
  ['R7C8', 'R8C8', 'R9C8', 'R8C7', 'R8C9'],
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  ...cages.map(cells => new Sum(28, ...cells)),

  new Thermo('R1C1', 'R2C2', 'R3C3'),
  new Thermo('R1C8', 'R2C9', 'R3C8', 'R2C7'),
  new Thermo('R4C4', 'R5C5', 'R6C6'),
  new Thermo('R4C6', 'R3C5'),
  new Thermo('R6C4', 'R5C3'),
  new Thermo('R8C3', 'R7C2', 'R8C1', 'R9C2'),
  new Thermo('R7C7', 'R8C8', 'R9C9'),

  // The arrow direction and its four indicated cells are drawn beside the 27.
  LittleKiller.fromCells(27, graph.ray('R4C1', -1, 1), geometry),
];
