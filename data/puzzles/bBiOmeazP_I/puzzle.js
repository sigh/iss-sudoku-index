// Title: Codex
// Author: Glen Fletcher
// Video: https://www.youtube.com/watch?v=bBiOmeazP_I
// Source: https://sudokupad.app/1snjlipwcb
//
// Rules encoded:
// - Normal Sudoku (default 9x9, rows/cols/3x3 boxes from Shape).
// - Green-square cells hold a positive power of two: {2,4,8} (2^1..2^3; 0 is
//   not a positive integer, so 2^0=1 is excluded -- "positive power"
//   qualifies the exponent, not the (already-positive, 1-9) cell value --
//   and 2^4=16 exceeds the 1-9 range). Encoded as a Given candidate
//   restriction, the standard way to express "this cell is one of these
//   digits" (no native PowerOfTwo/Prime class).
// - Blue-diamond cells hold a prime number: {2,3,5,7}.
// - White-dot pairs: consecutive digits (WhiteDot). The payload's
//   "difference" array carries these as edge pairs with no explicit
//   difference value, which is the f-puzzles convention for a plain
//   (consecutive) white dot. Each drawn pair is its own WhiteDot -- see the
//   note above whiteDotPairs for why they cannot be grouped by cluster.
// - Killer-cage-shaped regions: "Digits may not repeat in a cage" and no
//   sum is drawn for these three cages, so each is AllDifferent only (a
//   no-total cage), per the catalog's own guidance for a no-total cage.
// - Gray lines are palindromes (Palindrome): reads the same from either end.
//
// The decorative diamond/square rectangle overlays in the payload
// (isPrimeConstraint / isPowerOfTwoConstraint) duplicate the prime/
// poweroftwo cell lists one-for-one and carry no extra information; they
// are not separately encoded. The payload's single "cage" entry is a
// transparent metadata stub (the author's commentary text) with no drawn
// cells, so it is not a real clue and is not encoded.

const powerOfTwoCells = [
  'R6C7', 'R1C1', 'R9C4', 'R3C4', 'R2C7', 'R5C4', 'R4C1', 'R7C1', 'R8C7',
];
const primeCells = [
  'R2C1', 'R1C4', 'R3C7', 'R4C4', 'R9C7', 'R5C7', 'R6C1', 'R7C4', 'R8C1',
];

// Killer-cage-shaped regions (all-different only, no sum drawn).
const cages = [
  ['R1C8', 'R2C8', 'R3C8', 'R3C9', 'R4C9', 'R5C9', 'R6C9'],
  ['R4C5', 'R5C5', 'R6C5', 'R6C6', 'R7C6', 'R8C6', 'R9C6'],
  ['R1C3', 'R2C3', 'R3C2', 'R3C3', 'R4C2', 'R5C2', 'R6C2'],
];

// Gray palindrome lines (6 cells each).
const palindromes = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C4', 'R2C5', 'R2C6'],
  ['R4C6', 'R4C5', 'R4C4', 'R5C3', 'R5C2', 'R5C1'],
  ['R9C6', 'R9C5', 'R9C4', 'R8C3', 'R8C2', 'R8C1'],
];

// White-dot pairs, taken directly from the payload's "difference" array
// (each a 2-cell edge; no explicit difference value, the f-puzzles
// convention for a plain/consecutive white dot). Each group of 3 pairs
// traces 3 sides of a 2x2 block, deliberately leaving the 4th side
// undotted -- WhiteDot pairs its cells by grid adjacency across its whole
// argument list (not by list order), so listing all 4 cells of a block in
// one constraint would also bind that undrawn 4th (diagonal-adjacent-free)
// edge; each pair is therefore its own WhiteDot to bind only the drawn
// edges.
const whiteDotPairs = [
  ['R7C6', 'R8C6'], ['R8C5', 'R8C6'], ['R7C5', 'R8C5'],
  ['R6C6', 'R5C6'], ['R6C6', 'R6C5'], ['R5C5', 'R6C5'],
  ['R5C9', 'R4C9'], ['R4C9', 'R4C8'], ['R5C8', 'R4C8'],
  ['R1C9', 'R2C9'], ['R1C8', 'R1C9'], ['R1C8', 'R2C8'],
];

return [
  new Shape('9x9'),

  ...powerOfTwoCells.map(cell => new Given(cell, 2, 4, 8)),
  ...primeCells.map(cell => new Given(cell, 2, 3, 5, 7)),

  ...cages.map(cells => new AllDifferent(...cells)),

  ...palindromes.map(cells => new Palindrome(...cells)),

  ...whiteDotPairs.map(cells => new WhiteDot(...cells)),
];
