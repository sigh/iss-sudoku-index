// Title: August 26, 2022: Zone Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=BW4QRK9yB5k
// Source: https://tinyurl.com/mrxscna8

// Normal sudoku rules apply. Each cage's listed digits must appear
// somewhere within that cage; digits may otherwise repeat in a cage
// (ContainAtLeast, not ContainExact, so a listed digit may occur more
// than once). Cages carry no sum and no AllDifferent of their own --
// repeats are governed only by the normal row/column/box rules.

// Cage table: cells and required-digit list, from the source cage
// entries' "value" field (a digit-list clue, not a sum total).
const CAGES = [
  { cells: ['R2C5', 'R3C5', 'R3C6', 'R4C6'], digits: '1_2_5_6' },
  { cells: ['R5C7', 'R5C8', 'R6C6', 'R6C7'], digits: '2_3_6_7' },
  { cells: ['R6C4', 'R7C4', 'R7C5', 'R8C5'], digits: '3_4_7_8' },
  { cells: ['R4C3', 'R4C4', 'R5C2', 'R5C3'], digits: '1_4_5_8' },
  { cells: ['R1C4', 'R2C3', 'R2C4', 'R3C2', 'R3C3'], digits: '4_5_6' },
  { cells: ['R2C7', 'R3C7', 'R3C8', 'R4C8', 'R4C9'], digits: '3_4_8' },
  { cells: ['R7C7', 'R7C8', 'R8C6', 'R8C7', 'R9C6'], digits: '1_2_5' },
  { cells: ['R6C1', 'R6C2', 'R7C2', 'R7C3', 'R8C3'], digits: '1_7_9' },
];

const givens = [
  ['R1C9', 6], ['R3C4', 6], ['R4C5', 1], ['R4C7', 8], ['R5C4', 4],
  ['R5C6', 2], ['R6C3', 9], ['R6C5', 3], ['R7C6', 5], ['R9C1', 3],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...CAGES.map(cage => new ContainAtLeast(cage.digits, ...cage.cells)),
];
