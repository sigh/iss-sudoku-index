// Title: Pentomino Sight Lines
// Author: Blobz
// Video: https://www.youtube.com/watch?v=TUMP5GFD5D4
// Source: https://app.crackingthecryptic.com/sudoku/gJBh3q6mmr

// Normal sudoku rules apply (default 9x9 boxes). One white dot is drawn, so
// R5C1/R6C1 are consecutive; the rules note not all such dots are shown, so
// no other cell pair is constrained by its absence.
//
// The rest of the rules text describes a 60-cell region that must be
// partitioned into twelve orthogonally-connected 5-cell regions, one
// congruent (up to rotation/reflection) to each of the twelve free
// pentomino shapes with none repeated, each holding exactly one of the
// givens below as a "sight line" count of its own region, and each summing
// to a shape-specific killer-cage total. That partition/shape-identity
// mechanic is omitted here.
//
// Givens - decoded from the source cell values.
const GIVENS = [
  ['R2C5', 5], ['R2C7', 3], ['R3C7', 4],
  ['R4C2', 3], ['R4C3', 4], ['R4C4', 5],
  ['R5C9', 4],
  ['R6C2', 5], ['R6C6', 4],
  ['R7C5', 3],
  ['R8C6', 5],
  ['R9C3', 5],
];

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  new WhiteDot('R5C1', 'R6C1'),
];
