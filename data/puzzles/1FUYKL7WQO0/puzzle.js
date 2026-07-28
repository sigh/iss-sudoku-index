// Title: Hazy Rellik
// Author: gdc
// Video: https://www.youtube.com/watch?v=1FUYKL7WQO0
// Source: https://sudokupad.app/869hsb49kn

// Normal 9x9 Sudoku. Fog only controls clue visibility and is not a solution rule.
// Numbered drawn cages are Rellik cages: no non-empty subset reaches its label;
// their digits are also distinct. The foglight outline is display-only.
const rellikCages = [
  [7, 'R1C2', 'R1C3', 'R2C2', 'R2C3', 'R2C4'],
  [8, 'R1C1', 'R2C1', 'R3C1', 'R3C2', 'R3C3'],
  [5, 'R1C4', 'R1C5', 'R1C6', 'R2C5', 'R2C6'],
  [8, 'R3C4', 'R3C5', 'R3C6', 'R4C4', 'R4C5'],
  [6, 'R5C4', 'R5C5', 'R6C4', 'R6C5'],
  [11, 'R4C6', 'R5C6', 'R5C7', 'R6C6'],
  [10, 'R4C7', 'R4C8', 'R4C9'],
  [11, 'R5C8', 'R5C9', 'R6C7', 'R6C8', 'R6C9'],
  [10, 'R4C1', 'R4C2', 'R5C1', 'R5C2', 'R6C1'],
  [7, 'R6C2', 'R7C1', 'R7C2', 'R7C3', 'R8C2'],
  [6, 'R7C4', 'R8C3', 'R8C4', 'R8C5', 'R9C4'],
  [7, 'R7C7', 'R7C8', 'R8C8', 'R8C9', 'R9C9'],
  [8, 'R9C7', 'R9C8'],
  [7, 'R1C8', 'R1C9', 'R2C9'],
]; // Drawn cage labels and cell outlines.

// Drawn white dots are consecutive; the black dot has a 1:2 ratio. Unmarked dots are allowed.
return [
  new Shape('9x9'),
  ...rellikCages.map(([sum, ...cells]) => new RellikCage(sum, ...cells)),
  new WhiteDot('R3C8', 'R4C8'),
  new WhiteDot('R8C8', 'R9C8'),
  new WhiteDot('R5C6', 'R5C7'),
  new BlackDot('R7C2', 'R8C2'),
];
