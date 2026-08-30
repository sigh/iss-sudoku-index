// Title: Mirror Sudoku
// Author: Justin Smart
// Video: https://www.youtube.com/watch?v=Wfxr4-5hDiU
// Source: https://cracking-the-cryptic.web.app/sudoku/GmmPRDDHhr

// Normal sudoku rules apply. R3C3 (yellow) is a "mirror" cell; 16 further
// cells are shaded grey. Each grey cell is paired with its transpose across
// R3C3's diagonal (R*r*C*c* <-> R*c*C*r*) and the two cells of a pair hold
// the same digit: every one of the 16 shaded cells has its transpose also
// shaded, and the pairing is corroborated by the R3C7/R7C3 givens, both 7.
// Separately, the 17 shaded cells (16 grey + the yellow mirror cell)
// together contain every digit 1-9 at least once.

// Mirror pairs: SameValues(2, a, b) forces each pair to hold one equal digit.
const mirrorPairs = [
  ['R2C4', 'R4C2'],
  ['R3C4', 'R4C3'],
  ['R3C5', 'R5C3'],
  ['R3C6', 'R6C3'],
  ['R3C7', 'R7C3'],
  ['R4C7', 'R7C4'],
  ['R4C8', 'R8C4'],
  ['R5C9', 'R9C5'],
].map(([a, b]) => new SameValues(2, a, b));

// The 17 shaded cells (yellow mirror cell + 16 grey cells) must together
// contain each of 1-9 at least once.
const shadedCells = [
  'R3C3',
  'R2C4', 'R4C2',
  'R3C4', 'R4C3',
  'R3C5', 'R5C3',
  'R3C6', 'R6C3',
  'R3C7', 'R7C3',
  'R4C7', 'R7C4',
  'R4C8', 'R8C4',
  'R5C9', 'R9C5',
];

return [
  new Shape('9x9'),

  new Given('R1C1', 3),
  new Given('R1C3', 9),
  new Given('R1C5', 4),
  new Given('R1C8', 6),
  new Given('R2C7', 1),
  new Given('R3C7', 7),
  new Given('R4C2', 2),
  new Given('R5C1', 4),
  new Given('R5C2', 1),
  new Given('R7C2', 6),
  new Given('R7C3', 7),
  new Given('R7C7', 8),
  new Given('R8C8', 4),
  new Given('R9C1', 5),
  new Given('R9C3', 4),
  new Given('R9C4', 3),
  new Given('R9C6', 6),
  new Given('R9C7', 2),

  ...mirrorPairs,

  new ContainAtLeast('1_2_3_4_5_6_7_8_9', ...shadedCells),
];
