// Title: unknown
// Author: Christoph Seeliger
// Video: https://www.youtube.com/watch?v=myGqOF6blPI
// Source: https://cracking-the-cryptic.web.app/sudoku/36r8R9FNnN

// Encoded:
//   - Normal Sudoku on a 9x9 grid with the nine default 3x3 boxes.
//   - The 24 drawn cages, no digit repeated within a cage.
//
// Omitted: the source carries no rules prose, and not one of its 24 cages
// carries a printed total, so the relation those totalless cages stand for is
// not encoded. Only the cage outlines themselves are drawn data, and they say
// nothing about which totals relation is meant; a reading picked from the
// candidates would be a guess, so none is encoded. Read as no-repeat cages
// alone the grid is very far from determined.
//
// There are no givens: every cell of the grid is drawn empty.

// Cage cell lists exactly as drawn, in source order; 24 cages covering 69 of
// the 81 cells. The twelve cells in no cage are R4C3-R4C6, R5C4-R5C6 and
// R6C2-R6C6.
const cages = [
  ['R1C1', 'R1C2'],
  ['R2C1', 'R3C1', 'R4C1'],
  ['R6C1', 'R5C1', 'R5C2', 'R5C3'],
  ['R2C2', 'R4C2', 'R3C2', 'R3C3', 'R2C3'],
  ['R7C1', 'R8C1'],
  ['R9C1', 'R9C2', 'R9C3'],
  ['R7C2', 'R7C3'],
  ['R8C2', 'R8C3'],
  ['R1C3', 'R1C4'],
  ['R1C5', 'R2C5', 'R2C4'],
  ['R2C6', 'R1C6', 'R1C7'],
  ['R3C4', 'R3C5', 'R3C6'],
  ['R7C4', 'R8C4', 'R8C5', 'R7C5'],
  ['R7C6', 'R8C6', 'R9C6'],
  ['R9C4', 'R9C5'],
  ['R3C7', 'R2C7', 'R2C8', 'R1C8'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R3C8', 'R4C8', 'R4C7'],
  ['R4C9', 'R5C9', 'R5C8'],
  ['R5C7', 'R6C7', 'R6C8'],
  ['R6C9', 'R7C9'],
  ['R7C7', 'R7C8'],
  ['R8C7', 'R8C8', 'R8C9'],
  ['R9C7', 'R9C8', 'R9C9'],
];

// A Cage total of 0 is "no total": the constraint emits only the cage's
// AllDifferent, which is the whole of what an untotalled cage states here.
return [
  new Shape('9x9'),
  ...cages.map((cells) => new Cage(0, ...cells)),
];
