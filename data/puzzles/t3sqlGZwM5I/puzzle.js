// Title: The X Sudoku
// Author: marvin Kannhauser
// Video: https://www.youtube.com/watch?v=t3sqlGZwM5I
// Source: https://app.crackingthecryptic.com/sudoku/R9p6tLN9Q9

// Normal sudoku rules apply (standard rows/columns/3x3 boxes).
// Along thermometers, digits strictly increase from the bulb (Thermo).
// Purple lines are palindromes, reading the same both ways (Palindrome).
// A number in a circle must appear in at least one of the four surrounding
// cells (Quad) -- each drawn corner circle carries one value.
//
// Thermo #4 is drawn tip-first in the payload (R9C1-R8C1-R7C2) with the bulb
// at R7C2, so it is listed here in increase order R7C2-R8C1-R9C1.
// The four plain grey circles drawn at R1C1, R3C8, R8C7, R7C2 are the bulb
// markers of the four thermometers (each coincides with a thermo's bulb
// cell), not separate clues.

const thermos = [
  new Thermo('R1C1', 'R1C2', 'R2C3'),
  new Thermo('R3C8', 'R2C9', 'R1C9'),
  new Thermo('R8C7', 'R9C8', 'R9C9'),
  new Thermo('R7C2', 'R8C1', 'R9C1'),
];

const palindromes = [
  new Palindrome('R2C1', 'R2C2', 'R3C3', 'R4C4', 'R4C5'),
  new Palindrome('R5C6', 'R4C6', 'R3C7', 'R2C8', 'R1C8'),
  new Palindrome('R6C5', 'R6C6', 'R7C7', 'R8C8', 'R8C9'),
  new Palindrome('R9C2', 'R8C2', 'R7C3', 'R6C4', 'R5C4'),
];

// Quad(topLeftCell, ...values): "All the given values must be present in the
// surrounding 2x2 square" -- exactly the drawn circle rule, one value each.
const quads = [
  new Quad('R1C1', 1),
  new Quad('R3C6', 1),
  new Quad('R6C6', 2),
  new Quad('R2C2', 2),
  new Quad('R1C8', 2),
  new Quad('R8C8', 3),
  new Quad('R6C3', 3),
  new Quad('R3C3', 4),
  new Quad('R8C1', 4),
  new Quad('R4C4', 5),
  new Quad('R2C7', 6),
  new Quad('R7C7', 7),
  new Quad('R5C5', 7),
  new Quad('R7C2', 8),
];

return [
  new Shape('9x9'),
  new Given('R1C1', 5),
  ...thermos,
  ...palindromes,
  ...quads,
];
