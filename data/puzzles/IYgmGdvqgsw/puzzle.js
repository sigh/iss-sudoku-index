// Title: Polyamorous Cages
// Author: Ennead
// Video: https://www.youtube.com/watch?v=IYgmGdvqgsw
// Source: https://app.crackingthecryptic.com/sudoku/q6pR9DQghg

// Normal sudoku rules apply (default row/column/box all-different from
// Shape). No given digits.
//
// Digits cannot repeat in cages: every drawn cage has no printed total, so
// each is AllDifferent over its own cells only -- no cross-cage restriction.
// Any group of three adjacent cages must sum to 45: two cages are "adjacent"
// when they share a cell-to-cell orthogonal border. Walking every cage
// border gives one and only one triple of pairwise adjacent cages in the
// whole grid -- cages 5, 6 and 7 -- so that is the one "group of three
// adjacent cages" the rule constrains; no other cage triple is pairwise
// adjacent.
// Cells with identical colours contain identical digits: two colour pairs
// are drawn as underlay dots (blue at R4C1/R1C4, gold at R4C7/R7C4).

// Cage cell lists, transcribed from the payload's `cages` array (id order).
const cages = [
  ['R8C9', 'R8C8', 'R9C8', 'R9C9'],
  ['R8C6', 'R8C7', 'R7C7', 'R7C8', 'R6C8'],
  ['R7C6', 'R6C6', 'R6C7'],
  ['R6C5', 'R5C5', 'R5C6'],
  ['R5C4', 'R4C4', 'R4C5'],
  ['R4C3', 'R3C3', 'R3C4'],
  ['R3C2', 'R2C2', 'R2C1', 'R3C1', 'R4C1'],
  ['R1C2', 'R1C3', 'R2C3', 'R1C4'],
  ['R2C5'],
  ['R2C6', 'R2C7'],
  ['R1C9', 'R1C8', 'R2C8', 'R3C8', 'R3C7', 'R4C7'],
  ['R2C9', 'R3C9'],
  ['R8C3', 'R9C3', 'R9C4'],
  ['R7C2', 'R7C1', 'R6C1'],
  ['R8C2', 'R8C1', 'R9C1', 'R9C2'],
  ['R5C2', 'R6C2'],
];

// A no-total cage is all-different only.
const cageConstraints = cages.map((cells) => new AllDifferent(...cells));

// The one mutually-adjacent triple of cages (5, 6, 7; see comment above)
// sums to 45 over its combined 12 cells. Repeats are allowed across the
// cage boundary (each cage's own AllDifferent above still applies within
// itself), so this is a plain Sum, not a Cage.
const polyamorousTriple = new Sum(45, ...cages[5], ...cages[6], ...cages[7]);

// Colour-linked cell pairs (underlay circles): each pair holds one shared
// digit.
const colourGroups = [
  new SameValues(2, 'R4C1', 'R1C4'), // blue
  new SameValues(2, 'R4C7', 'R7C4'), // gold
];

return [
  new Shape('9x9'),
  ...cageConstraints,
  polyamorousTriple,
  ...colourGroups,
];
