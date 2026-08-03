// Title: May 10, 2023: Zone Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=lc30O50G_rY
// Source: https://tinyurl.com/26jnua2h

// Normal sudoku rules apply. Each cage's top-left clue string tells you some
// of the digits that appear in that cage: every digit character in the clue
// must appear among the cage's cells, at least as many times as it repeats
// in the clue string. ContainAtLeast enforces exactly that per-value
// multiplicity, so a clue such as "77" or "111" is encoded with the digit
// repeated rather than deduplicated.
// Cage cells and clue strings are transcribed verbatim from the drawn cage
// outlines and their printed corner text; the cages do not partition the
// grid.
const cages = [
  ['1_1_1', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C3', 'R2C4', 'R3C3'],
  ['2_2_2', 'R3C7', 'R3C8', 'R4C8', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
  ['3_3_3', 'R7C7', 'R8C6', 'R8C7', 'R9C3', 'R9C4', 'R9C5', 'R9C6'],
  ['4_4_4', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R6C2', 'R7C2', 'R7C3'],
  ['1_2_4_5', 'R7C4', 'R7C5', 'R8C3', 'R8C4'],
  ['2_3_4_5', 'R2C6', 'R2C7', 'R3C5', 'R3C6'],
  ['6_7_8', 'R3C2', 'R4C2', 'R5C2'],
  ['7_8_9', 'R5C8', 'R6C8', 'R7C8'],
  ['7_7', 'R6C5', 'R6C6', 'R7C6'],
  ['8_8', 'R3C4', 'R4C4', 'R4C5'],
  ['3', 'R5C3', 'R6C3', 'R6C4'],
  ['4', 'R4C6', 'R4C7', 'R5C7'],
];

return [
  new Shape('9x9'),
  ...cages.map(([values, ...cells]) => new ContainAtLeast(values, ...cells)),
];
