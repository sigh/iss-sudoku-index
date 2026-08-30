// Title: Shaken Clones
// Author: Unknown
// Video: https://www.youtube.com/watch?v=D8nEAKMYXI0
// Source: https://cracking-the-cryptic.web.app/sudoku/M39frQrPBq

// Normal sudoku rules apply (rows, columns, boxes; the payload's `regions`
// are the ordinary nine 3x3 boxes). Shaken Clones: grey areas of the same
// size must contain the same set of digits, in any order -- a multiset
// equality across same-size regions, not a cell-to-cell correspondence or a
// shared shape.
//
// Grey regions (24 cells drawn as 1x1 grey-filled underlays), split into
// connected components (orthogonal adjacency) and grouped by size below.
const size4Groups = [
  ['R1C1', 'R2C1', 'R3C1', 'R3C2'],
  ['R7C5', 'R8C5', 'R9C5', 'R7C6'],
  ['R1C8', 'R2C8', 'R3C8', 'R1C9'],
];
const size3Groups = [
  ['R6C1', 'R6C2', 'R7C1'],
  ['R9C8', 'R9C9', 'R8C9'],
];
const size2Groups = [
  ['R8C3', 'R9C3'],
  ['R5C8', 'R6C8'],
  ['R2C5', 'R3C5'],
];

// SameValues(k, ...cells) splits `cells` into k equal-size consecutive
// groups and requires every group's multiset of values to equal every other
// group's -- exactly "same set of digits, in any order" across same-size
// grey areas.
const shakenClones = [
  new SameValues(size4Groups.length, ...size4Groups.flat()),
  new SameValues(size3Groups.length, ...size3Groups.flat()),
  new SameValues(size2Groups.length, ...size2Groups.flat()),
];

const givens = [
  new Given('R1C1', 5), new Given('R1C4', 3), new Given('R1C6', 6),
  new Given('R2C2', 8), new Given('R2C9', 4),
  new Given('R3C3', 7), new Given('R3C7', 2),
  new Given('R4C3', 1), new Given('R4C4', 9),
  new Given('R5C3', 6), new Given('R5C5', 3), new Given('R5C7', 5),
  new Given('R6C6', 4), new Given('R6C7', 1),
  new Given('R7C3', 5), new Given('R7C7', 4),
  new Given('R8C1', 8), new Given('R8C8', 7),
  new Given('R9C4', 8), new Given('R9C6', 2), new Given('R9C9', 1),
];

return [
  new Shape('9x9'),
  ...givens,
  ...shakenClones,
];
