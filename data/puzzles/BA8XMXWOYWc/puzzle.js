// Title: Tenet
// Author: Jazzora
// Video: https://www.youtube.com/watch?v=BA8XMXWOYWc
// Source: https://app.crackingthecryptic.com/8d4q3NdNLR

// Normal Sudoku; the two blue diagonals and each drawn colored nine-cell region
// contain no repeated digit. V/X, white-dot, purple ratio-dot, and parity marks
// are encoded from their drawn edges and cells.
const coloredRegions = [
  // Yellow, red, and blue cell fills in the drawing.
  ['R1C1', 'R2C2', 'R1C3', 'R2C4', 'R1C5', 'R2C6', 'R1C7', 'R2C8', 'R1C9'],
  ['R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R3C7', 'R4C6', 'R6C4', 'R7C3'],
  ['R9C1', 'R8C2', 'R9C3', 'R8C4', 'R9C5', 'R8C6', 'R9C7', 'R8C8', 'R9C9'],
];

// The predicate permits exactly the two orientations of a printed ratio dot.
const ratio = n => Pair.fnToKey((a, b) => a === n * b || b === n * a, 9);

return [
  new Shape('9x9'),
  new Given('R5C5', 5),
  new Diagonal(1),
  new Diagonal(-1),
  ...coloredRegions.map(cells => new AllDifferent(...cells)),
  new V('R3C4', 'R4C4'), new V('R3C6', 'R4C6'),
  new V('R6C4', 'R7C4'), new V('R6C6', 'R7C6'),
  new X('R8C2', 'R8C3'), new X('R8C7', 'R8C8'),
  new X('R2C7', 'R2C8'), new X('R2C2', 'R2C3'),
  new WhiteDot('R5C3', 'R5C4'), new WhiteDot('R3C5', 'R4C5'),
  new WhiteDot('R5C6', 'R5C7'), new WhiteDot('R6C5', 'R7C5'),
  new Pair(ratio(3), 'ratio 3', 'R3C2', 'R4C2'),
  new Pair(ratio(3), 'ratio 3', 'R6C8', 'R7C8'),
  new Pair(ratio(4), 'ratio 4', 'R3C8', 'R4C8'),
  new Pair(ratio(4), 'ratio 4', 'R6C2', 'R7C2'),
  new Given('R2C1', 1, 3, 5, 7, 9), new Given('R2C5', 1, 3, 5, 7, 9),
  new Given('R5C8', 1, 3, 5, 7, 9), new Given('R9C2', 1, 3, 5, 7, 9),
  new Given('R1C8', 2, 4, 6, 8), new Given('R5C2', 2, 4, 6, 8),
  new Given('R8C5', 2, 4, 6, 8), new Given('R8C9', 2, 4, 6, 8),
];
