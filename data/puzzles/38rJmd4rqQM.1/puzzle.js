// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=38rJmd4rqQM
// Source: https://cracking-the-cryptic.web.app/sudoku/8rMdM7m62G

// Normal sudoku rules apply. Every clue is a letter written in a cell's
// corner, and it is the first letter of the English name of that cell's digit:
// O=one, T=two/three, F=four/five, S=six/seven, E=eight, N=nine. O, E and N
// therefore fix a digit; T and S each leave two. No F clue is drawn.
//
// The letters drawn are exactly N, O, T, E and S, all of them digit-name
// initials, and a letter cannot stand for a single digit: R2C7 and R7C7 both
// read T (same column) and R6C4 and R6C7 both read S (same row).
//
// The purple cells draw a heart behind the grid. No clue is drawn on them and
// they carry no printed value, so they are treated as artwork, not a region.

// First letters of the English names of 1-9.
const LETTER_DIGITS = {
  O: [1],
  T: [2, 3],
  F: [4, 5],
  S: [6, 7],
  E: [8],
  N: [9],
};

// Clue letters, transcribed from the 19 small white letters drawn one per cell
// in the cell's top-left corner.
const clues = {
  R1C8: 'N',
  R2C7: 'T',
  R3C4: 'T', R3C6: 'O',
  R4C4: 'N', R4C7: 'E',
  R5C1: 'T', R5C3: 'O', R5C5: 'S', R5C7: 'N',
  R6C4: 'S', R6C7: 'S',
  R7C2: 'O', R7C3: 'N', R7C7: 'T', R7C8: 'S',
  R9C1: 'S', R9C4: 'O', R9C5: 'N',
};

return [
  new Shape('9x9'),

  ...Object.entries(clues).map(
    ([cell, letter]) => new Given(cell, ...LETTER_DIGITS[letter])),
];
