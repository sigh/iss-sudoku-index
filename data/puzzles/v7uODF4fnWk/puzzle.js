// Title: Killer And Clone
// Author: David McNeill
// Video: https://www.youtube.com/watch?v=v7uODF4fnWk
// Source: https://cracking-the-cryptic.web.app/sudoku/BDnqQjb3GN

// Normal sudoku. 14 killer cages (sum + no repeat). Three congruent 8-cell
// grey-shaded groups (each a 3x3 block minus one corner, all in the same
// orientation) must hold the same digit at each corresponding relative
// position across the three groups; digits may repeat within one group.
// Rules text transcribed from the video's rules-panel frame
// (external-video-frame-358s.jpg): the archived payload carries no
// metadata rules string.

// Cages: sum, then cells. Transcribed from the payload's `cages` array.
const CAGES = [
  [20, 'R1C1', 'R1C2', 'R2C1', 'R2C2'],
  [7, 'R1C3', 'R1C4'],
  [28, 'R1C5', 'R1C6', 'R2C5', 'R2C6', 'R2C7'],
  [26, 'R1C7', 'R1C8', 'R1C9', 'R2C8', 'R2C9'],
  [17, 'R3C5', 'R3C6', 'R3C7', 'R4C6'],
  [23, 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'],
  [12, 'R6C6', 'R6C7', 'R7C6', 'R7C7'],
  [30, 'R6C8', 'R6C9', 'R7C8', 'R7C9'],
  [21, 'R8C6', 'R8C7', 'R9C6', 'R9C7'],
  [13, 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
  [29, 'R7C1', 'R8C1', 'R8C2', 'R9C1', 'R9C2'],
  [28, 'R5C3', 'R6C3', 'R6C4', 'R7C3'],
  [24, 'R5C1', 'R5C2', 'R6C1', 'R6C2', 'R7C2'],
  [7, 'R3C1', 'R4C1'],
];

// The three grey-shaded clone groups, each cell listed in the same relative
// order within its 3x3-minus-corner shape (row-major, skipping the missing
// corner), so index i names corresponding cells across the three groups.
// Derived from the payload's 24 underlay cells: they are exactly the
// complement of the caged 57 cells, and split by contiguous shape into these
// three 8-cell groups, all in the same orientation (pure translation, no
// rotation/reflection needed to match them up).
const CLONE_GROUPS = [
  ['R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C3', 'R4C4'],
  ['R3C8', 'R3C9', 'R4C7', 'R4C8', 'R4C9', 'R5C7', 'R5C8', 'R5C9'],
  ['R7C4', 'R7C5', 'R8C3', 'R8C4', 'R8C5', 'R9C3', 'R9C4', 'R9C5'],
];

const cages = CAGES.map(([sum, ...cells]) => new Cage(sum, ...cells));
// Cell-wise clone: one SameValues(3, ...) per shape position, each over the
// three cells at that position (one from each group) -- not one call over
// all 24 cells, which would ask only for equal multisets rather than
// equal digits at corresponding positions.
const clones = CLONE_GROUPS[0].map((_, i) =>
  new SameValues(3, ...CLONE_GROUPS.map((group) => group[i]))
);

return [new Shape('9x9'), ...cages, ...clones];
