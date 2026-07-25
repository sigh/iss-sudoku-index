// Title: Dutch Flat Mates (Counting Circles)
// Author: Flinty
// Video: https://www.youtube.com/watch?v=ooK1oHZNMpg
// Source: https://sudokupad.app/pdhr2gqlhe

// Normal sudoku (default 3x3 boxes; the payload's `regions` also list the
// same nine boxes, so no override is needed).
// Both marked diagonals: digits may not repeat. Drawn as deepskyblue lines
// and enforced by the payload's two hidden `unique` cages on R1C1-R9C9 and
// R9C1-R1C9 -- Diagonal(-1)/Diagonal(1) are those same two diagonals.
// Dutch Flats: every 5 needs a 1 directly above it or a 9 directly below it
// (may have both). DutchFlatmates is that rule verbatim.
// Counting Circles: if a digit appears in a Circle cell, exactly that many
// Circle cells hold that digit. CountingCircles is that rule verbatim.
// "5s ... don't live in Circles": Circle cells additionally exclude the
// digit 5, encoded as a candidate-restricting Given on each.

// Circle cells, from the payload's 28 `underlays` (white circle markers).
const circles = [
  'R1C4', 'R1C5', 'R1C6', 'R1C8',
  'R2C3', 'R2C4', 'R2C5', 'R2C6',
  'R3C2', 'R3C9',
  'R4C2', 'R4C5', 'R4C9',
  'R5C1', 'R5C2', 'R5C4', 'R5C6',
  'R6C1', 'R6C5', 'R6C7', 'R6C9',
  'R7C4',
  'R8C3', 'R8C6', 'R8C7',
  'R9C3', 'R9C6', 'R9C8',
];

return [
  new Shape('9x9'),
  new Diagonal(-1),
  new Diagonal(1),
  new DutchFlatmates(),
  new CountingCircles(...circles),
  ...circles.map(cell => new Given(cell, 1, 2, 3, 4, 6, 7, 8, 9)),
];
