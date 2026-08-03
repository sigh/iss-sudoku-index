// Title: X-clusivity
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=0qGJVHcQCQA
// Source: https://app.crackingthecryptic.com/sudoku/JGG2RDFhJq

// Normal sudoku rules apply. Each grey line consists of one or more
// non-overlapping groups of consecutive cells, each of which sums to 10; the
// solver chooses where the group boundaries fall (SumLine below).
//
// Omitted: the second, global rule that no two of these groups, even across
// different lines, may share the same fill (the same multiset of digits,
// including permutations). SumLine enforces only that each line partitions
// into consecutive groups summing to 10; it does not expose where the group
// boundaries actually fall, so there is no way to read off a discovered
// group's digit multiset and compare it against every other discovered
// group's multiset (across all six lines, an unknown and varying number of
// groups of varying length). No existing ISS primitive compares content
// across a solver-discovered, unanchored partition like this.
//
// Line cells, read off the drawn waypoints (grey, thickness 10).
const lines = [
  ['R1C7', 'R2C7', 'R3C7', 'R4C7'],
  ['R4C5', 'R3C6', 'R2C5', 'R1C4', 'R2C3'],
  ['R6C9', 'R7C9', 'R8C9', 'R8C8', 'R8C7'],
  ['R8C5', 'R7C6', 'R7C5', 'R7C4'],
  [
    'R9C1', 'R9C2', 'R8C2', 'R7C2', 'R6C2', 'R6C3', 'R6C4', 'R5C5',
    'R5C6', 'R5C7', 'R4C8', 'R4C9', 'R3C9', 'R2C9', 'R1C9',
  ],
  ['R3C2', 'R2C2', 'R1C1', 'R2C1', 'R3C1'],
];

return [
  new Shape('9x9'),
  ...lines.map(cells => new SumLine(10, ...cells)),
];
