// Title: Spinning AnTENna
// Author: Steven
// Video: https://www.youtube.com/watch?v=HzmWdFbqg78
// Source: https://app.crackingthecryptic.com/sudoku/NdFpRNqhGt

// Normal sudoku rules apply (standard 3x3 boxes, no givens). Cages show
// their sums (killer convention: digits within a cage are distinct).
// Along grey thermometers, digits strictly increase from the bulb.
// Orange lines are palindromes, reading the same in both directions.
//
// Several thermometers and palindromes cross at a shared cell on the board
// (e.g. R4C4 carries both thermometer T3 and palindrome P4). Those are two
// separate lines by colour/thickness in the payload's own `lines[]` array,
// so each is encoded as its own constraint on the shared cell -- not merged.

// Killer cages: cells (from cages[].cells), sum.
const cages = [
  [10, 'R4C3', 'R4C2', 'R5C2', 'R5C3'],
  [30, 'R5C7', 'R5C8', 'R6C8', 'R6C7'],
];

// Grey thermometers: bulb cell first (matches the grey circle overlay at
// that cell), then increasing toward the tip.
const thermos = [
  ['R9C1', 'R8C2', 'R7C3', 'R6C4'],
  ['R4C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R4C4', 'R3C3'],
  ['R7C7', 'R6C6'],
];

// Orange palindrome lines.
const palindromes = [
  ['R2C3', 'R1C4'],
  ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1'],
  ['R3C4', 'R4C3'],
  ['R3C5', 'R4C4', 'R5C3'],
  ['R5C7', 'R6C6', 'R7C5'],
  ['R6C7', 'R7C6'],
  ['R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5'],
  ['R8C7', 'R9C6'],
  ['R6C3', 'R7C4'],
  ['R6C2', 'R7C3', 'R8C4'],
  ['R3C6', 'R4C7'],
  ['R2C6', 'R3C7', 'R4C8'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...thermos.map(cells => new Thermo(...cells)),
  ...palindromes.map(cells => new Palindrome(...cells)),
];
