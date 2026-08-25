// Title: Qarpet Beater
// Author: Henk Nicolai
// Video: https://www.youtube.com/watch?v=Nxj_VA8gzaU
// Source: https://app.crackingthecryptic.com/webapp/67hmPT6gLB

// Normal sudoku rules apply. No digit may repeat in the same position across
// boxes (DisjointSets). Cages sum to the small clue in their top-left corner
// and forbid repeats within the cage (Cage). Each outside arrow gives the sum
// of the digits along the diagonal it indicates, running from its on-grid
// corner until the diagonal exits the grid; digits may repeat on it
// (LittleKiller). The two single-cell cages drawn in box 9 (R8C8, R9C9) are
// decoration only per the rules text and are not encoded.

const geometry = cellGeometry('9x9');

// Cages: cells transcribed from the payload's drawn cage regions.
const cages = [
  new Cage(39, 'R2C3', 'R2C4', 'R2C5', 'R3C2', 'R3C3', 'R4C2', 'R5C2'),
  new Cage(45, 'R3C5', 'R4C5', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R7C5'),
  new Cage(20, 'R2C6', 'R2C7', 'R3C7', 'R3C8', 'R4C8'),
  new Cage(17, 'R5C8', 'R6C7', 'R6C8', 'R7C7'),
  new Cage(14, 'R7C6', 'R8C5', 'R8C6'),
  new Cage(18, 'R6C2', 'R7C2', 'R7C3', 'R8C3', 'R8C4'),
];

// Outside diagonal-sum arrows. Each entry's cells were read off the drawn
// arrow direction; LittleKiller.fromCells finds the canonical corner
// regardless of which end the array lists first.
const littleKillers = [
  [16, ['R2C1', 'R1C2']],
  [10, ['R1C7', 'R2C8', 'R3C9']],
  [4, ['R8C9', 'R9C8']],
  [8, ['R7C1', 'R8C2', 'R9C3']],
].map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry));

return [
  new Shape('9x9'),
  new DisjointSets(),
  ...cages,
  ...littleKillers,
];
