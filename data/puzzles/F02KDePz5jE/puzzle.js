// Title: Architect Killer Sudoku
// Author: Preston Phillips
// Video: https://www.youtube.com/watch?v=F02KDePz5jE
// Source: https://cracking-the-cryptic.web.app/sudoku/rJnJ2F6T7G

// Encoded: normal sudoku (rows, columns and the nine standard 3x3 boxes) plus
// the 21 printed givens, transcribed from the digits drawn in the grid.
//
// Omitted, and this is the whole of the variant:
//  - The 76 non-grey cells are partitioned into regions, each congruent (up to
//    rotation and reflection) to one of a catalogue of numeral-shaped pieces;
//    the five grey cells R3C5, R4C5, R5C5, R6C5 and R7C5 lie outside every
//    region. Neither the region borders nor the number of regions is drawn.
//  - A circle's digit is the numeral its own region is shaped like. The
//    circles are at R1C7, R2C3, R2C4, R2C5, R2C8, R4C1, R4C2, R5C7, R6C4,
//    R7C9, R8C2, R8C5, R9C1, R9C6 and R9C8.
//  - Each region's digits sum to a multiple of that same numeral.
//
// Everything after rule 1 depends on assigning each solver-discovered region a
// shape identity from a fixed catalogue up to rotation and reflection, which
// this encoding has no way to state; the numeral catalogue is also not drawn
// on the board. The remainder below is the sudoku layer alone and does not pin
// the puzzle down.

// Givens: the 21 digits printed in the grid.
const givens = {
  R1C1: 6, R1C9: 5,
  R2C3: 5, R2C7: 4,
  R3C4: 3, R3C5: 5, R3C6: 6,
  R4C3: 9, R4C7: 3,
  R5C3: 6, R5C5: 4, R5C7: 2,
  R6C3: 7, R6C7: 9,
  R7C4: 8, R7C5: 9, R7C6: 2,
  R8C3: 2, R8C7: 1,
  R9C1: 3, R9C9: 9,
};

return [
  new Shape('9x9'),
  ...Object.entries(givens).map(([cell, value]) => new Given(cell, value)),
];
