// Title: The Buddy System
// Author: Allagem
// Video: https://www.youtube.com/watch?v=wwrDAgtoND8
// Source: https://sudokupad.app/xgmmht4odf

// Normal Sudoku applies. Circled digits count their occurrences among all circles;
// grey lines are palindromes; blue lines have values strictly between their circled
// endpoints; black dots mark 2:1 ratios.
const circles = [
  'R1C2', 'R1C4', 'R1C6', 'R1C8', 'R2C1', 'R2C3', 'R2C7', 'R2C9', 'R3C2',
  'R3C8', 'R4C1', 'R4C5', 'R4C9', 'R5C4', 'R5C5', 'R5C6', 'R6C1', 'R6C5',
  'R6C9', 'R7C2', 'R7C8', 'R8C1', 'R8C3', 'R8C7', 'R8C9', 'R9C2', 'R9C4',
  'R9C6', 'R9C8',
];

// Grey line paths transcribed from the drawing.
const palindromes = [
  ['R3C6', 'R4C7'],
  ['R6C3', 'R7C4'],
  ['R8C5', 'R7C6', 'R6C7', 'R5C8'],
  ['R5C2', 'R4C3', 'R3C4', 'R2C5'],
  ['R1C4', 'R2C4', 'R3C3', 'R4C2', 'R4C1'],
];

// Blue paths include the two circled endpoint cells, as drawn.
const betweenLines = [
  ['R1C2', 'R1C1', 'R2C1'],
  ['R7C8', 'R7C7', 'R8C7'],
];

return [
  new Shape('9x9'),
  new CountingCircles(...circles),
  ...palindromes.map(cells => new Palindrome(...cells)),
  ...betweenLines.map(cells => new Between(...cells)),
  // Black dots transcribed from the two edge-centered black marks.
  new BlackDot('R5C2', 'R5C3'),
  new BlackDot('R5C7', 'R5C8'),
];
