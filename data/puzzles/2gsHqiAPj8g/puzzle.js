// Title: 2023
// Author: Die Hard
// Video: https://www.youtube.com/watch?v=2gsHqiAPj8g
// Source: https://sudokupad.app/t6Rd7d8JD7

// Normal Sudoku; 23 killer cages; three blue zipper lines; the grey palindrome;
// and the rule that each line digit counts its occurrences across all line cells.
// Cage cells are transcribed from the drawn dashed 23-cages.
const cages = [
  ['R2C1', 'R3C1', 'R3C2'],
  ['R4C1', 'R4C2', 'R4C3', 'R4C4'],
  ['R1C3', 'R1C4', 'R1C5', 'R1C6'],
  ['R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R3C6', 'R4C5', 'R4C6', 'R4C7', 'R4C8'],
  ['R8C7', 'R9C6', 'R9C7'],
  ['R5C5', 'R5C6', 'R6C5', 'R6C6'],
  ['R6C8', 'R7C8', 'R7C9', 'R8C9'],
  ['R5C7', 'R5C8', 'R5C9', 'R6C7'],
  ['R7C3', 'R7C4', 'R7C5', 'R7C6'],
  ['R8C3', 'R8C4', 'R8C5', 'R9C4'],
  ['R6C2', 'R6C3', 'R7C2', 'R8C2', 'R9C2', 'R9C3'],
];
// Ordered paths transcribed from the blue and grey drawn lines.
const zippers = [
  ['R3C6', 'R3C5', 'R3C4', 'R4C3', 'R5C3', 'R6C3'],
  ['R1C1', 'R2C2', 'R3C3'],
  ['R7C5', 'R7C6', 'R6C7', 'R5C7'],
];
const palindrome = ['R3C8', 'R4C9'];
const lineCells = [...zippers.flat(), ...palindrome];

return [
  new Shape('9x9'),
  ...cages.map(cells => new Cage(23, ...cells)),
  ...zippers.map(cells => new Zipper(...cells)),
  new Palindrome(...palindrome),
  new CountingCircles(...lineCells),
];
