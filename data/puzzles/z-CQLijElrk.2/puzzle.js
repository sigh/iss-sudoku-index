// Title: Sep 1, 2021: Clone Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=z-CQLijElrk
// Source: https://tinyurl.com/ubmmmvd6

// Normal sudoku rules apply. In addition, the three shaded 3x3 shapes (box 1,
// box 5, box 9 -- the grid's diagonal boxes) must contain exactly the same
// digits in the same relative places: a "clone" rule, cell-wise equal across
// the three shapes, not a same-multiset rule (a single SameValues over the
// merged 27-cell set would ask the wrong thing).

// Clone correspondences, one SameValues(2, a, b) per matching relative
// position, transcribed from the drawn shading (3 pairwise relations
// forming a cycle: box1<->box5, box5<->box9, box9<->box1).
const clones = [
  // box 1 <-> box 5
  new SameValues(2, 'R1C1', 'R4C4'),
  new SameValues(2, 'R1C2', 'R4C5'),
  new SameValues(2, 'R1C3', 'R4C6'),
  new SameValues(2, 'R2C1', 'R5C4'),
  new SameValues(2, 'R2C2', 'R5C5'),
  new SameValues(2, 'R2C3', 'R5C6'),
  new SameValues(2, 'R3C1', 'R6C4'),
  new SameValues(2, 'R3C2', 'R6C5'),
  new SameValues(2, 'R3C3', 'R6C6'),
  // box 5 <-> box 9
  new SameValues(2, 'R4C4', 'R7C7'),
  new SameValues(2, 'R4C5', 'R7C8'),
  new SameValues(2, 'R4C6', 'R7C9'),
  new SameValues(2, 'R5C4', 'R8C7'),
  new SameValues(2, 'R5C5', 'R8C8'),
  new SameValues(2, 'R5C6', 'R8C9'),
  new SameValues(2, 'R6C4', 'R9C7'),
  new SameValues(2, 'R6C5', 'R9C8'),
  new SameValues(2, 'R6C6', 'R9C9'),
  // box 9 <-> box 1
  new SameValues(2, 'R7C7', 'R1C1'),
  new SameValues(2, 'R7C8', 'R1C2'),
  new SameValues(2, 'R7C9', 'R1C3'),
  new SameValues(2, 'R8C7', 'R2C1'),
  new SameValues(2, 'R8C8', 'R2C2'),
  new SameValues(2, 'R8C9', 'R2C3'),
  new SameValues(2, 'R9C7', 'R3C1'),
  new SameValues(2, 'R9C8', 'R3C2'),
  new SameValues(2, 'R9C9', 'R3C3'),
];

const givens = [
  // Givens, transcribed from the drawn grid.
  new Given('R1C6', 1),
  new Given('R2C7', 2),
  new Given('R3C4', 2),
  new Given('R3C5', 4),
  new Given('R3C8', 3),
  new Given('R4C3', 8),
  new Given('R4C9', 4),
  new Given('R5C3', 1),
  new Given('R5C7', 6),
  new Given('R6C1', 5),
  new Given('R6C7', 7),
  new Given('R7C2', 6),
  new Given('R7C5', 5),
  new Given('R7C6', 4),
  new Given('R8C3', 7),
  new Given('R9C4', 8),
];

return [
  new Shape('9x9'),
  ...givens,
  ...clones,
];
