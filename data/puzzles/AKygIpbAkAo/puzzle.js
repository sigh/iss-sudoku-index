// Title: Hazy Cipher
// Author: gdc
// Video: https://www.youtube.com/watch?v=AKygIpbAkAo
// Source: https://sudokupad.app/gdc/hazy-cipher
//
// Normal sudoku rules apply. Cages with the same letter have the same sum.
// (Fog/reveal state is solving UI, not a grid rule, and is not encoded.)
//
// Every multi-cell cage below lies entirely within one row or column, so
// none of them adds an all-different constraint beyond what the row/column
// rule already enforces -- EqualSum alone (sum-equality only) is a faithful
// reading regardless of whether "cage" also implies no repeats.
//
// Cage cells, transcribed from the drawn cage geometry and grouped by each
// cage's letter label:
const cagesByLetter = {
  // A: single cell R1C9 fixes the sum every other A-cage must match.
  A: [['R1C9'], ['R2C7', 'R3C7'], ['R8C4', 'R8C5']],
  B: [['R2C9'], ['R1C1', 'R1C2', 'R1C3'], ['R7C6', 'R7C7', 'R7C8'], ['R9C2', 'R9C3']],
  // C has only one cage (R3C9), so the same-letter rule is vacuous for it --
  // there is nothing to equate it against, and it is omitted below.
  D: [['R4C9'], ['R1C5', 'R1C6'], ['R4C1', 'R5C1'], ['R7C3', 'R8C3']],
  F: [['R6C9'], ['R3C2', 'R3C3', 'R3C4'], ['R6C3', 'R6C4']],
  H: [['R8C9'], ['R5C4', 'R5C5', 'R5C6'], ['R6C2', 'R7C2'], ['R4C6', 'R4C7']],
};

const equalSums = Object.values(cagesByLetter).map(
  segments => new EqualSum(...segments));

return [
  new Shape('9x9'),
  ...equalSums,
];
