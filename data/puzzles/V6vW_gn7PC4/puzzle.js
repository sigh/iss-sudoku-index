// Title: College Clones
// Author: SSG
// Video: https://www.youtube.com/watch?v=V6vW_gn7PC4
// Source: https://app.crackingthecryptic.com/sudoku/hm3m9hNrqm

// Normal sudoku rules apply. In cages, digits must sum to the small clue in
// the top-left corner of the cage; standard cage convention also forbids a
// repeated digit within a cage (Cage enforces both).
//
// Each coloured shape is a clone: two congruent, identically-oriented copies
// of the same shape, drawn as coloured cells. "Digits must appear in
// identical positions in each copy of a clone" is read as one equality per
// pair of cells occupying the same position within their shape (found by
// matching each copy's cells to the same translation offset from its own
// top-left cell -- no rotation or reflection is needed to match the two
// copies of any colour). SameValues(2, a, b) with two singleton cell lists
// asserts a === b.

const CAGES = [
  [9, 'R2C3', 'R3C3', 'R3C2'],
  [17, 'R2C4', 'R2C5', 'R3C4', 'R3C5'],
  [13, 'R1C8', 'R2C8'],
  [19, 'R4C7', 'R4C8', 'R5C7', 'R5C8'],
  [8, 'R7C9', 'R8C9', 'R9C9'],
  [18, 'R7C5', 'R7C6', 'R8C5', 'R8C6'],
  [15, 'R9C2', 'R9C3'],
  [20, 'R5C2', 'R5C3', 'R6C2', 'R6C3'],
  [16, 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'],
];

// Each entry is one clone colour's two copies, read off the drawn coloured
// underlays. Cells within a copy are listed in the same relative order as
// the other copy (top-left-of-shape reading order), which is what fixes the
// cell-to-cell correspondence below.
const CLONES = [
  { copyA: ['R1C2', 'R1C3', 'R2C2'], copyB: ['R7C1', 'R7C2', 'R8C1'] }, // deepskyblue
  { copyA: ['R2C9', 'R3C9', 'R3C8'], copyB: ['R7C8', 'R8C8', 'R8C7'] }, // yellowgreen
  { copyA: ['R8C2', 'R8C3'], copyB: ['R9C7', 'R9C8'] },                 // red
  { copyA: ['R2C1', 'R3C1'], copyB: ['R1C7', 'R2C7'] },                 // chocolate
];

return [
  new Shape('9x9'),

  ...CAGES.map(([sum, ...cells]) => new Cage(sum, ...cells)),

  ...CLONES.flatMap(({ copyA, copyB }) => copyA.map(
    (cell, i) => new SameValues(2, cell, copyB[i]))),
];
