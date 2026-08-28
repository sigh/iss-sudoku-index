// Title: March 4, 2022: Kroptween
// Author: clover!
// Video: https://www.youtube.com/watch?v=VrmINT5PAyk
// Source: https://tinyurl.com/4rz82b55

// Normal sudoku rules apply. Digits along each between line must be strictly
// between the values in the two circle cells at the line's ends. Digits
// either side of a black dot are in a 1:2 ratio; digits either side of a
// white dot are consecutive. Not every dot is drawn, so an unmarked
// adjacent pair carries no constraint either way (no strict/negative
// reading of the missing dots).

// Between lines: each line's cell list runs end-to-end; the first and last
// cells are the given "circles", interior cells must be strictly between
// them.
const betweenLines = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ['R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7'],
  ['R7C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3'],
  ['R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3'],
  ['R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4'],
];

// White (consecutive) dots.
const whiteDots = [
  ['R3C5', 'R3C4'],
  ['R4C3', 'R5C3'],
  ['R5C3', 'R6C3'],
  ['R5C1', 'R6C1'],
  ['R5C9', 'R4C9'],
  ['R7C5', 'R7C6'],
  ['R4C7', 'R5C7'],
];

// Black (1:2 ratio) dots.
const blackDots = [
  ['R1C7', 'R1C8'],
  ['R3C6', 'R3C5'],
  ['R2C1', 'R3C1'],
  ['R9C2', 'R9C3'],
  ['R7C4', 'R7C5'],
  ['R6C7', 'R5C7'],
  ['R8C9', 'R7C9'],
];

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C1', 3), new Given('R1C9', 2),
  new Given('R2C5', 3),
  new Given('R3C3', 7), new Given('R3C7', 1),
  new Given('R5C2', 7), new Given('R5C8', 8),
  new Given('R7C3', 3), new Given('R7C7', 9),
  new Given('R8C5', 6),
  new Given('R9C1', 6), new Given('R9C9', 8),

  ...betweenLines.map(cells => new Between(...cells)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
