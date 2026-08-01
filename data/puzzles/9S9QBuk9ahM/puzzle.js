// Title: Circles and Sets
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=9S9QBuk9ahM
// Source: https://sudokupad.app/36fdw51b62

// Rules: normal sudoku; every dashed cage has its shown total with no repeated
// digit; and a circled digit counts the circled cells holding that same digit.

// Killer cages transcribed from the drawn cage data and their displayed totals.
const cages = [
  [24, ['R4C1', 'R4C2', 'R5C1', 'R5C2']],
  [12, ['R1C4', 'R1C5', 'R2C4', 'R2C5']],
  [15, ['R8C4', 'R8C5', 'R9C4', 'R9C5']],
  [18, ['R4C8', 'R4C9', 'R5C8', 'R5C9']],
  [37, ['R6C9', 'R7C9', 'R8C9', 'R9C6', 'R9C7', 'R9C8', 'R9C9']],
  [23, ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R3C1']],
  [9, ['R5C5', 'R5C6', 'R6C5']],
  [28, ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R6C4']],
];

// Circled cells transcribed from the source's 30 circle clues. This is one
// shared set: CountingCircles makes each circle's digit equal its frequency.
const circleCells = [
  'R1C2',
  'R2C2', 'R2C1',
  'R3C3',
  'R4C3',
  'R5C3',
  'R6C3', 'R6C7',
  'R7C3', 'R7C4', 'R7C5', 'R7C6',
  'R5C7', 'R4C7',
  'R3C4', 'R3C5', 'R3C6', 'R3C7',
  'R1C8',
  'R2C8', 'R2C9',
  'R1C9',
  'R9C8',
  'R8C8', 'R8C9',
  'R9C9',
  'R9C2',
  'R8C2', 'R8C1',
  'R9C1',
];

return [
  new Shape('9x9'),
  ...cages.map(([total, cells]) => new Cage(total, ...cells)),
  new CountingCircles(...circleCells),
];
