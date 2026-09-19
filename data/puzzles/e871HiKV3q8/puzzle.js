// Title: Nonconsecutive Renban
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=e871HiKV3q8
// Source: https://test.crackingthecryptic.com/sudoku/LfHBPF8BjP

// Normal sudoku rules apply. Orthogonally adjacent cells cannot contain
// consecutive digits (AntiConsecutive, global, applies everywhere on the
// grid including line cells). Each grey line holds a set of distinct
// consecutive digits in any order (Renban, one per drawn line). Two of the
// lines cross visually in box 2 without sharing a cell -- a drawing detail
// with no separate constraint.

return [
  new Shape('9x9'),

  new Given('R1C3', 7),

  new AntiConsecutive(),

  new Renban('R4C1', 'R3C2'),
  new Renban('R1C4', 'R1C5', 'R2C6'),
  new Renban('R3C4', 'R2C5', 'R1C6'),
  new Renban('R4C3', 'R4C4', 'R4C5', 'R4C6', 'R5C5'),
  new Renban('R5C4', 'R6C4', 'R6C5', 'R5C6'),
  new Renban('R4C7', 'R4C8', 'R5C9'),
  new Renban('R7C4', 'R7C5', 'R6C6'),
  new Renban('R7C1', 'R8C2', 'R8C3', 'R8C4'),
  new Renban('R9C4', 'R8C5'),
];
