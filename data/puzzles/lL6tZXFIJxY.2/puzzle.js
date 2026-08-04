// Title: 2/10/23: Love Numbers
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=lL6tZXFIJxY
// Source: https://tinyurl.com/yckpfevx

// Normal sudoku rules apply. White dots (the payload's `difference` array)
// mark orthogonally-adjacent cells whose digits differ by 5. Black dots (the
// payload's `ratio` array) mark orthogonally-adjacent cells whose digits are
// in a 3:1 ratio. The rules text states there is no negative constraint, so
// undotted adjacent cells are left unrestricted -- no extra constraint is
// added for them.

// White-dot pairs: difference of 5. One Pair per dot so each domino stays an
// independent edge constraint (not chained through a shared cell).
const diffKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 5, 9);
const diffDots = [
  ['R8C7', 'R8C6'],
  ['R7C8', 'R7C7'],
  ['R6C9', 'R6C8'],
  ['R4C9', 'R5C9'],
  ['R3C9', 'R3C8'],
  ['R2C7', 'R2C8'],
  ['R3C6', 'R2C6'],
  ['R3C5', 'R4C5'],
  ['R6C8', 'R7C8'],
  ['R7C3', 'R7C4'],
].map(([a, b]) => new Pair(diffKey, 'diff5', a, b));

// Black-dot pairs: ratio of 3:1.
const ratioKey = Pair.fnToKey((a, b) => a === 3 * b || b === 3 * a, 9);
const ratioDots = [
  ['R2C4', 'R3C4'],
  ['R2C3', 'R2C2'],
  ['R3C2', 'R3C1'],
  ['R4C1', 'R5C1'],
  ['R6C2', 'R6C1'],
  ['R7C2', 'R7C3'],
  ['R8C4', 'R8C3'],
  ['R8C5', 'R9C5'],
  ['R6C2', 'R7C2'],
  ['R5C5', 'R6C5'],
  ['R7C7', 'R7C6'],
].map(([a, b]) => new Pair(ratioKey, 'ratio3', a, b));

return [
  new Shape('9x9'),
  new Given('R2C5', 5),
  new Given('R5C3', 5),
  new Given('R5C7', 3),
  new Given('R9C5', 3),
  ...diffDots,
  ...ratioDots,
];
