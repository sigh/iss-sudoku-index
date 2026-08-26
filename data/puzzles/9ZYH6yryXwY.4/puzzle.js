// Title: Scratchcard Lanyard
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=9ZYH6yryXwY
// Source: https://tinyurl.com/2w8beypt

// Normal sudoku rules apply. Each outside label is two distinct digits (not
// a two-digit number); both named digits must appear somewhere among the
// first three cells counted in from that label's side of the grid.
// Clue digit pairs and directions transcribed from the payload's `text`
// entries (positions R0/C0/C10/R10 mark the outside side; the other
// coordinate is the 1-9 row/column the clue belongs to).
const outsideClues = [
  // Top: column, digits, first three cells reading down from row 1.
  { cells: ['R1C1', 'R2C1', 'R3C1'], digits: '1_2' },
  { cells: ['R1C2', 'R2C2', 'R3C2'], digits: '3_4' },
  { cells: ['R1C3', 'R2C3', 'R3C3'], digits: '5_6' },
  { cells: ['R1C4', 'R2C4', 'R3C4'], digits: '7_8' },
  { cells: ['R1C5', 'R2C5', 'R3C5'], digits: '9_1' },
  { cells: ['R1C6', 'R2C6', 'R3C6'], digits: '2_3' },
  { cells: ['R1C7', 'R2C7', 'R3C7'], digits: '4_5' },
  { cells: ['R1C8', 'R2C8', 'R3C8'], digits: '6_7' },
  { cells: ['R1C9', 'R2C9', 'R3C9'], digits: '8_9' },

  // Right: row, digits, first three cells reading left from column 9.
  { cells: ['R1C9', 'R1C8', 'R1C7'], digits: '1_2' },
  { cells: ['R2C9', 'R2C8', 'R2C7'], digits: '3_4' },
  { cells: ['R3C9', 'R3C8', 'R3C7'], digits: '5_6' },
  { cells: ['R4C9', 'R4C8', 'R4C7'], digits: '7_8' },
  { cells: ['R5C9', 'R5C8', 'R5C7'], digits: '9_1' },
  { cells: ['R6C9', 'R6C8', 'R6C7'], digits: '2_3' },
  { cells: ['R7C9', 'R7C8', 'R7C7'], digits: '4_5' },
  { cells: ['R8C9', 'R8C8', 'R8C7'], digits: '6_7' },
  { cells: ['R9C9', 'R9C8', 'R9C7'], digits: '8_9' },

  // Left: row, digits, first three cells reading right from column 1.
  { cells: ['R3C1', 'R3C2', 'R3C3'], digits: '2_3' },
  { cells: ['R4C1', 'R4C2', 'R4C3'], digits: '3_4' },
  { cells: ['R5C1', 'R5C2', 'R5C3'], digits: '5_6' },
  { cells: ['R6C1', 'R6C2', 'R6C3'], digits: '7_8' },
  { cells: ['R7C1', 'R7C2', 'R7C3'], digits: '9_1' },
  { cells: ['R8C1', 'R8C2', 'R8C3'], digits: '2_3' },
  { cells: ['R9C1', 'R9C2', 'R9C3'], digits: '4_5' },

  // Bottom: column, digits, first three cells reading up from row 9.
  { cells: ['R9C1', 'R8C1', 'R7C1'], digits: '6_7' },
  { cells: ['R9C3', 'R8C3', 'R7C3'], digits: '8_9' },
  { cells: ['R9C4', 'R8C4', 'R7C4'], digits: '1_2' },
  { cells: ['R9C5', 'R8C5', 'R7C5'], digits: '3_4' },
  { cells: ['R9C6', 'R8C6', 'R7C6'], digits: '5_6' },
  { cells: ['R9C7', 'R8C7', 'R7C7'], digits: '7_8' },
];

return [
  new Shape('9x9'),
  new Given('R5C5', 8),
  ...outsideClues.map(({ cells, digits }) => new ContainAtLeast(digits, ...cells)),
];
