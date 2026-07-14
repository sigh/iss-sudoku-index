// Title: Cookie Crime Part 2: Connecting Clues
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=kj16_BnT0J4
// Source: https://sudokupad.app/bg5cxr23it

// Normal sudoku rules apply. Fog of war is solving UI only (no rule effect).
//
// All drawn lines are German whisper lines (adjacent digits differ by at
// least 5), each drawn in its own colour.
//
// Five pairs of small matching icon markers (footprints, cookie crumbs, and
// other themed marks) are drawn in the grid, each shape/colour at exactly
// two cells. Each pair are the endpoints of a line the solver must build by
// connecting them with the shortest orthogonal path that shares no cell with
// any other line, including the German whisper lines; digits on that path
// must be strictly between the digits at its two endpoints. For two of the
// five pairs, more than one shortest, non-overlapping route is geometrically
// possible; the "between" digit rule is what picks out the real one, so
// those two are encoded as an Or over the tied candidate routes.
//
// Digits in a dashed cage sum to the value in the top-left corner and do not
// repeat within the cage. White dots join consecutive digits, black dots
// join digits in a 1:2 ratio; not all such pairs are dotted (no negative
// constraint).

const cages = [
  [13, 'R1C4', 'R1C5'],
  [16, 'R1C8', 'R2C8'],
  [5, 'R7C6', 'R8C6'],
];

const whiskers = [
  ['R2C2', 'R2C3'],
  ['R1C7', 'R1C6', 'R2C5', 'R1C4', 'R1C5'],
  ['R4C8', 'R5C7', 'R5C8', 'R5C9', 'R6C8'],
  ['R6C4', 'R5C3', 'R4C3', 'R3C4', 'R2C4'],
  ['R8C4', 'R7C5', 'R8C6', 'R9C6', 'R8C7'],
];

const whiteDots = [
  ['R7C8', 'R7C9'],
  ['R7C8', 'R8C8'],
];

const blackDots = [
  ['R3C7', 'R3C8'],
  ['R3C8', 'R3C9'],
  ['R4C3', 'R4C4'],
];

return [
  new Shape('9x9'),

  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),

  ...whiskers.map(cells => new Whisper(5, ...cells)),

  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),

  // Paw-print pair: unique shortest path avoiding the German whisper lines.
  new Between('R6C9', 'R7C9', 'R7C8', 'R7C7'),

  // Cookie-crumb pair: the two direct 3-cell routes both cross the R2C2-R2C3
  // whisper line, so the tie-break forces the long way around via column 1.
  new Between('R3C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'),

  // Dug-hole pair: three tied shortest (5-cell) routes avoid the whisper
  // lines equally well; only the "between" digit rule distinguishes them.
  new Or([
    new Between('R4C9', 'R3C9', 'R3C8', 'R3C7', 'R2C7'),
    new Between('R4C9', 'R3C9', 'R3C8', 'R2C8', 'R2C7'),
    new Between('R4C9', 'R3C9', 'R2C9', 'R2C8', 'R2C7'),
  ]),

  // Bone pair: the two direct 3-cell routes both cross the R8C4-R7C5
  // whisper line, so the tie-break forces a long detour via row 9.
  new Between('R7C4', 'R7C3', 'R8C3', 'R9C3', 'R9C4', 'R9C5', 'R8C5'),

  // Fur-tuft pair: two tied shortest (4-cell) routes avoid the whisper
  // lines equally well; only the "between" digit rule distinguishes them.
  new Or([
    new Between('R3C5', 'R4C5', 'R4C4', 'R5C4'),
    new Between('R3C5', 'R4C5', 'R5C5', 'R5C4'),
  ]),
];
