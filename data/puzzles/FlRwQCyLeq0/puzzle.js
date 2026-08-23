// Title: Moldy Dumpling
// Author: GarlicBredFries & Memeristor
// Video: https://www.youtube.com/watch?v=FlRwQCyLeq0
// Source: https://app.crackingthecryptic.com/sudoku/G9J68BT9Tj

// Normal sudoku rules apply on a standard 9x9 grid with the default 3x3 boxes
// (the payload's `regions` array is nine ordinary boxes, not a jigsaw
// layout, so no custom Region constraints are added).
//
// Digits in a cage must not repeat and sum to the number in the cage's
// top-left cell: encoded as one Cage(total, ...cells) per drawn cage.
//
// Adjacent digits along a green line have a difference of at least 5:
// encoded as one Whisper(5, ...cells) per drawn line. Several lines step
// diagonally (corner-to-corner) rather than only orthogonally; the cell
// sequences below are the drawn waypoints interpolated to grid cell centres,
// which is what "adjacent along the line" means for a freehand-drawn line.

const cages = [
  new Cage(24, 'R1C5', 'R1C6', 'R2C6', 'R2C5'),
  new Cage(21, 'R3C5', 'R3C6', 'R4C6', 'R4C5'),
  new Cage(15, 'R5C1', 'R5C2', 'R6C2', 'R6C1'),
  new Cage(18, 'R5C3', 'R5C4', 'R6C4', 'R6C3'),
  new Cage(8, 'R3C8', 'R3C9'),
  new Cage(12, 'R8C3', 'R9C3'),
  new Cage(7, 'R7C8', 'R7C9'),
  new Cage(11, 'R8C7', 'R9C7'),
  new Cage(15, 'R9C8', 'R8C8', 'R8C9'),
];

const whispers = [
  new Whisper(5, 'R2C1', 'R1C2'),
  new Whisper(5, 'R1C8', 'R2C9'),
  new Whisper(5, 'R4C8', 'R5C7'),
  new Whisper(5, 'R5C6', 'R5C5', 'R6C5'),
  new Whisper(5, 'R7C5', 'R8C4'),
  new Whisper(5, 'R8C1', 'R9C2'),
  new Whisper(5, 'R9C3', 'R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9', 'R3C9'),
];

return [
  new Shape('9x9'),
  new Given('R1C4', 9),
  new Given('R4C1', 1),
  ...cages,
  ...whispers,
];
