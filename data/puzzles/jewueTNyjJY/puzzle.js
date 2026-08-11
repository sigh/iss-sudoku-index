// Title: The Butterfly Effect
// Author: Abed Hawila and Mr.Menace
// Video: https://www.youtube.com/watch?v=jewueTNyjJY
// Source: https://app.crackingthecryptic.com/sudoku/N73tMp8QM8

// Normal sudoku rules apply (9x9, standard boxes).
// For each line, digits on the line have an equal sum N within each 3x3 box
// it passes through; a line that passes through the same box more than once
// sums each individual segment within that box to N separately, matching
// RegionSumLine's own semantics exactly. N is independent per line.
// The payload draws 8 line entries but one renders nothing (not a clue),
// leaving 7 lines. Each line below is given as its full drawn cell path, so
// RegionSumLine's own box-crossing split produces the intended per-box
// segments, including the two lines that revisit a box (segmented in walk
// order, not merged).

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R6C9', 4),
  new Given('R9C6', 5),
  new Given('R9C9', 3),

  new RegionSumLine(
    'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7'),
  new RegionSumLine(
    'R1C4', 'R2C4', 'R3C4', 'R3C5', 'R4C5', 'R4C6', 'R3C6', 'R2C6', 'R2C5'),
  new RegionSumLine(
    'R1C5', 'R1C6', 'R1C7', 'R2C7', 'R3C7', 'R2C8', 'R2C9'),
  new RegionSumLine(
    'R4C1', 'R4C2', 'R4C3', 'R5C3', 'R5C4', 'R6C4', 'R6C3', 'R6C2', 'R5C2'),
  new RegionSumLine(
    'R5C1', 'R6C1', 'R7C1', 'R7C2', 'R7C3', 'R8C2', 'R9C2'),
  new RegionSumLine(
    'R7C5', 'R7C6', 'R8C7'),
  new RegionSumLine(
    'R6C7', 'R7C8', 'R7C9'),
];
