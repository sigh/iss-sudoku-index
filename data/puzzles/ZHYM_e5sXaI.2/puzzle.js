// Title: Zone Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=ZHYM_e5sXaI
// Source: https://tinyurl.com/5n7275a6

// Standard Sudoku. Nine outlined zones from the puzzle artwork; each zone's
// printed clue is a string of digits (transcribed per zone below), and every
// digit in that string must appear among the zone's cells, at least as many
// times as it repeats in the string. A zone imposes no other constraint: it
// is not an all-different cage, so repeats beyond what the clue requires are
// not forbidden. The two zones that are exactly a 2x2 square use the
// canonical Quad class, which has the same at-least-present semantics as
// ContainAtLeast.
const zones = [
  new ContainAtLeast('3_8', 'R1C2', 'R1C3'),
  new ContainAtLeast('4_7', 'R2C1', 'R3C1'),
  new ContainAtLeast('1_1_1_2_6', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R4C2'),
  new ContainAtLeast('2_3_3_4_4', 'R3C4', 'R3C5', 'R4C3', 'R4C4', 'R5C3'),
  new Quad('R3C6', 3, 5, 6, 6),
  new ContainAtLeast('4_4_4_5_6', 'R5C6', 'R5C7', 'R6C5', 'R6C6', 'R7C5'),
  new Quad('R6C3', 2, 5, 5, 9),
  new ContainAtLeast('3_7_7_7_9', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R8C6'),
  new ContainAtLeast('5', 'R7C8', 'R8C7', 'R8C8'),
];

return [
  new Shape('9x9'),
  ...zones,
];
