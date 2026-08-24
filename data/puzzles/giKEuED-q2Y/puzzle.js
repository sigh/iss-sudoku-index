// Title: Charybdis
// Author: Gliperal
// Video: https://www.youtube.com/watch?v=giKEuED-q2Y
// Source: https://app.crackingthecryptic.com/sudoku/9b4hN9F2LN

// Normal sudoku rules apply (standard rows/columns/3x3 boxes, from the
// default 9x9 Shape). In cages, digits sum to the small clue in the cage's
// top-left corner and cannot repeat within the cage: Cage(sum, ...cells)
// enforces both. No other global rule (no anti-knight/anti-king, diagonals,
// disjoint groups, Kropki, or XV) is stated in the rules text or drawn in
// the payload. Cage cell lists are transcribed from the puzzle's drawn cage
// geometry; one metadata entry with no cells and no total is a stub, not a
// real cage, and is omitted.

return [
  new Shape('9x9'),

  new Cage(20, 'R2C2', 'R2C3', 'R3C2', 'R3C3'),
  new Cage(19, 'R4C1', 'R4C2', 'R4C3'),
  new Cage(17, 'R5C3', 'R6C2', 'R6C3', 'R7C3'),
  new Cage(5, 'R9C2', 'R9C3'),
  new Cage(19, 'R7C5', 'R8C4', 'R8C5'),
  new Cage(19, 'R6C4', 'R6C5', 'R7C4'),
  new Cage(9, 'R5C4', 'R5C5', 'R5C6'),
  new Cage(11, 'R3C6', 'R4C5', 'R4C6'),
  new Cage(13, 'R2C5', 'R2C6', 'R3C5'),
  new Cage(15, 'R1C7', 'R1C8'),
  new Cage(17, 'R3C7', 'R4C7', 'R4C8', 'R5C7'),
  new Cage(21, 'R6C7', 'R6C8', 'R6C9'),
  new Cage(22, 'R7C7', 'R7C8', 'R8C7', 'R8C8'),
];
