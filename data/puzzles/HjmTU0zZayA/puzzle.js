// Title: Killer Sudoku 2
// Author: Wecoc
// Video: https://www.youtube.com/watch?v=HjmTU0zZayA
// Source: https://app.crackingthecryptic.com/webapp/HQ2DbJ7m4M

// Normal sudoku rules apply. In cages, digits must sum to the small clue in
// the top left corner of the cage. Digits cannot repeat within a cage.

// Cages: cells and totals transcribed from the payload's `cages` array
// (one stub entry with no cells is metadata, not a cage, and is omitted).
const cages = [
  { sum: 9, cells: ['R1C1', 'R1C2', 'R2C1'] },
  { sum: 11, cells: ['R1C3', 'R1C4', 'R2C3'] },
  { sum: 11, cells: ['R1C6', 'R1C7', 'R2C7'] },
  { sum: 15, cells: ['R1C8', 'R1C9', 'R2C9'] },
  { sum: 11, cells: ['R3C1', 'R3C2', 'R4C1'] },
  { sum: 20, cells: ['R3C3', 'R3C4', 'R4C3', 'R4C4'] },
  { sum: 22, cells: ['R3C6', 'R3C7', 'R4C6', 'R4C7'] },
  { sum: 11, cells: ['R3C8', 'R3C9', 'R4C9'] },
  { sum: 11, cells: ['R5C2', 'R5C3'] },
  { sum: 9, cells: ['R5C7', 'R5C8'] },
  { sum: 11, cells: ['R6C1', 'R7C1', 'R7C2'] },
  { sum: 26, cells: ['R6C3', 'R6C4', 'R7C3', 'R7C4'] },
  { sum: 27, cells: ['R6C6', 'R6C7', 'R7C6', 'R7C7'] },
  { sum: 11, cells: ['R6C9', 'R7C8', 'R7C9'] },
  { sum: 16, cells: ['R8C1', 'R9C1', 'R9C2'] },
  { sum: 11, cells: ['R8C3', 'R9C3', 'R9C4'] },
  { sum: 11, cells: ['R8C7', 'R9C6', 'R9C7'] },
  { sum: 9, cells: ['R8C9', 'R9C8', 'R9C9'] },
];

return [
  new Shape('9x9'),
  ...cages.map(({ sum, cells }) => new Cage(sum, ...cells)),
];
