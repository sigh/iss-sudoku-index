// Title: Supercilious
// Author: Nicolas Duhail
// Video: https://www.youtube.com/watch?v=-dHPY7QpYZA
// Source: https://sudokupad.app/41m7apa6cf

// Normal Sudoku, arrow sums, and peach entropic lines.
// Blue circles and their orange arrow shafts; each list starts at its circle.
const arrows = [
  ['R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R3C6', 'R3C7', 'R3C8'],
  ['R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R9C1', 'R8C1', 'R7C1', 'R6C1'],
  ['R9C5', 'R8C5', 'R7C5', 'R6C5'],
  ['R8C3', 'R7C3', 'R6C3'],
  ['R4C1', 'R5C2', 'R6C2'],
  ['R2C6', 'R2C5', 'R1C4'],
];
// The three peach strokes, including intermediate cells on straight segments.
const lines = [
  ['R9C7', 'R9C6', 'R8C6', 'R7C6', 'R8C7', 'R7C8', 'R6C7', 'R6C8', 'R6C9', 'R7C9'],
  ['R7C4', 'R6C4', 'R5C4', 'R4C5', 'R4C6', 'R4C7'],
  ['R9C8', 'R9C9', 'R8C9'],
];
return [new Shape('9x9'), ...arrows.map(cells => new Arrow(...cells)), ...lines.map(cells => new Entropic(...cells))];
