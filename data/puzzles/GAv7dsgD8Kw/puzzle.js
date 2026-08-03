// Title: Pointing Fingers
// Author: Just Kirb
// Video: https://www.youtube.com/watch?v=GAv7dsgD8Kw
// Source: https://app.crackingthecryptic.com/sudoku/tPFdpb8H78

// Normal sudoku rules apply. The digits along each arrow must sum to the digit
// in the circled cell. 17 arrows, each Arrow(circle, ...arm) below; the circle
// cell is the first argument per the Arrow class's sum-target semantics.
// Several arrows chain (one arrow's arrowhead cell is the next arrow's circle
// cell) -- this needs no special handling since each Arrow constraint reads
// that shared cell's value independently.
//
// The payload also carries 3 short thin lines duplicating the exact 3-cell
// path of 3 of these arrows (same colour, no separate rule text); read as a
// leftover duplicate stroke from drawing those arrows, not a distinct clue,
// and omitted.

const arrows = [
  ['R3C2', 'R4C2', 'R4C3'],
  ['R4C3', 'R4C4', 'R5C4'],
  ['R5C4', 'R6C4', 'R6C3'],
  ['R6C3', 'R6C2', 'R7C2'],
  ['R7C2', 'R7C3', 'R8C3'],
  ['R3C8', 'R3C7', 'R4C7'],
  ['R4C7', 'R4C6', 'R5C6'],
  ['R6C7', 'R5C7', 'R5C6'],
  ['R7C8', 'R6C8', 'R6C7'],
  ['R7C4', 'R8C4', 'R8C3'],
  ['R6C5', 'R7C5', 'R7C6'],
  ['R4C5', 'R4C4', 'R3C4'],
  ['R3C6', 'R3C7', 'R2C7'],
  ['R1C2', 'R2C2', 'R2C1'],
  ['R9C8', 'R8C8', 'R8C9'],
  ['R2C9', 'R2C8', 'R1C8'],
  ['R8C1', 'R8C2', 'R9C1'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
];
