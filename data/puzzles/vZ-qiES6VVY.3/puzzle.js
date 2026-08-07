// Title: Sept. 22, 2022: Clone Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=vZ-qiES6VVY
// Source: https://tinyurl.com/2wpjp9hc

// Normal sudoku rules apply. The two gray hollow 4x4-square outlines contain
// the same digits in the same relative positions (a position-by-position
// clone); digits may repeat within a region. Both cell lists are transcribed
// from the payload's `clone` entry in matching top-row / sides / bottom-row
// order, so index i of one list corresponds to index i of the other.
const cloneA = [
  'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R2C4',
  'R3C1', 'R3C4', 'R4C1', 'R4C2', 'R4C3', 'R4C4',
];
const cloneB = [
  'R6C6', 'R6C7', 'R6C8', 'R6C9', 'R7C6', 'R7C9',
  'R8C6', 'R8C9', 'R9C6', 'R9C7', 'R9C8', 'R9C9',
];

return [
  new Shape('9x9'),
  new Given('R1C6', 4), new Given('R1C7', 3), new Given('R1C8', 2), new Given('R1C9', 1),
  new Given('R2C6', 1), new Given('R2C9', 9),
  new Given('R3C6', 3), new Given('R3C9', 5),
  new Given('R4C6', 7), new Given('R4C7', 2), new Given('R4C8', 1), new Given('R4C9', 6),
  new Given('R6C1', 2), new Given('R6C2', 3), new Given('R6C3', 4), new Given('R6C4', 5),
  new Given('R7C1', 3), new Given('R7C4', 1),
  new Given('R8C1', 4), new Given('R8C4', 6),
  new Given('R9C1', 7), new Given('R9C2', 1), new Given('R9C3', 6), new Given('R9C4', 3),
  ...cloneA.map((cell, i) => new SameValues(2, cell, cloneB[i])),
];
