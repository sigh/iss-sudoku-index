// Title: Disjoint Killer
// Author: Quarterthru
// Video: https://www.youtube.com/watch?v=GboQf82wZR8
// Source: https://app.crackingthecryptic.com/sudoku/tMF4MPrFqr

// Rules encoded:
// - Normal sudoku rules (rows, columns, boxes all-different; default ISS grid).
// - Cage(sum, cells): cage digits sum to the printed total and cannot repeat
//   within the cage. Cage cell lists are transcribed from the geometry helper,
//   provenance comment above each group.
// - DisjointSets: no digit may repeat in the same relative position across
//   boxes, matching the rule "cells that appear in the same relative position
//   in their 3x3 box must not contain the same digit".

// Cages transcribed from the source payload's drawn cage geometry (cage
// entries with cells; metadata-only stubs excluded).
const cages = [
  new Cage(14, 'R1C1', 'R1C2', 'R2C2', 'R2C3'),
  new Cage(15, 'R1C4', 'R1C5'),
  new Cage(10, 'R2C4', 'R2C5', 'R2C6'),
  new Cage(25, 'R1C7', 'R1C8', 'R2C8', 'R2C9'),
  new Cage(12, 'R2C7', 'R3C7', 'R3C6'),
  new Cage(22, 'R3C3', 'R3C4', 'R4C4', 'R5C4'),
  new Cage(14, 'R3C1', 'R4C1', 'R4C2', 'R5C2'),
  new Cage(15, 'R5C1', 'R6C1'),
  new Cage(15, 'R7C1', 'R8C1', 'R9C1'),
  new Cage(11, 'R8C2', 'R8C3', 'R8C4', 'R9C3'),
  new Cage(15, 'R6C3', 'R6C4', 'R7C4', 'R7C5'),
  new Cage(15, 'R8C5', 'R8C6'),
  new Cage(17, 'R9C6', 'R9C7', 'R8C7', 'R7C7', 'R7C8'),
  new Cage(14, 'R8C9', 'R9C9'),
  new Cage(11, 'R6C6', 'R6C7'),
  new Cage(16, 'R4C5', 'R5C5', 'R5C6', 'R5C7'),
  new Cage(11, 'R4C8', 'R5C8', 'R5C9', 'R6C9'),
];

return [
  new Shape('9x9'),
  ...cages,
  new DisjointSets(),
];
