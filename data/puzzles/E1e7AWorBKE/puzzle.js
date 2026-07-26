// Title: Identical Sum Killer Cages
// Author: Justalilguy
// Video: https://www.youtube.com/watch?v=E1e7AWorBKE
// Source: https://sudokupad.app/2b6nrvt81y

// Normal sudoku, no givens. Every cage carries no printed total and forbids
// repeats within itself. Cages fall into two groups by drawn line style, and
// each group's cages must all sum to the same (unstated) total -- the two
// group totals need not match each other. Group membership: the dotted
// cages use the app's default cage border (no custom line); the solid-grey
// cages have a transparent cage border and are instead outlined by a custom
// solid #777777 line whose inset rectangle matches the cage's cells exactly
// (verified against every cage below). A 14th line -- dashed, black --
// exactly outlines the single hole cell inside the dotted D5 cage; it is a
// border-completion segment for D5's notch, not an independent cage.

const dottedCages = [
  ['R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'],
  ['R7C7', 'R7C8', 'R8C7', 'R8C8', 'R9C7', 'R9C8'],
  ['R5C8', 'R5C9', 'R6C8', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C4', 'R2C5'],
  // Notched around the hole cell R3C7.
  ['R2C6', 'R2C7', 'R2C8', 'R3C6', 'R3C8', 'R4C6', 'R4C7', 'R4C8'],
];

const solidGreyCages = [
  ['R1C7', 'R1C8'],
  ['R1C9', 'R2C9'],
  ['R4C9'],
  ['R8C1', 'R9C1'],
  ['R8C2', 'R9C2'],
  ['R5C2', 'R6C2', 'R6C3'],
  ['R9C6'],
  ['R3C4', 'R3C5'],
  ['R7C2', 'R7C3'],
  ['R6C6', 'R6C7'],
  ['R8C4', 'R9C4'],
  ['R7C5', 'R8C5'],
  ['R5C5', 'R5C6'],
];

const allCages = [...dottedCages, ...solidGreyCages];

return [
  new Shape('9x9'),
  // No total: all-different only, per cage.
  ...allCages.map(cells => new AllDifferent(...cells)),
  // All dotted cages share one common total.
  new EqualSum(...dottedCages),
  // All solid-grey cages share a (possibly different) common total.
  new EqualSum(...solidGreyCages),
];
