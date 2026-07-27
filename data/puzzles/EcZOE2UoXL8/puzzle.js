// Title: Mini Golf
// Author: Brinel
// Video: https://www.youtube.com/watch?v=EcZOE2UoXL8
// Source: https://sudokupad.app/uquc3yiz1v

// Standard 6x6 sudoku: rows, columns and the six 2x3 boxes (the box tiling
// ISS derives by default for a 6x6 Shape matches the `regions` array in the
// payload exactly, so no explicit Jigsaw is needed).
//
// Neighbouring digits along the green line differ by at least 3 -> Whisper(3)
// per drawn edge. The green line is drawn as two touching strokes, both
// spring-green, that share cell R5C1; since Whisper binds only consecutive
// cells in one call, each edge gets its own Whisper(3, a, b) rather than one
// call over the whole (branching) shape.
//
// The purple line contains a set of consecutive digits in any order -> Renban
// (order-independent). Drawn as one stroke shaped as a tail
// (R4C5-R3C5-R2C5) feeding into a loop (R2C5-R2C6-R1C6-R1C5-R2C5); the loop
// revisits R2C5, so the constraint is applied to the 6 distinct cells the
// stroke passes through.
//
// The white dot (golf ball) separates two consecutive digits -> WhiteDot.
// Drawn as an edge-centred dot between R3C3 and R3C4.
//
// The grey circle (hole) contains an odd digit -> multi-value Given (ISS has
// no Odd/Even class). Drawn as a translucent circle filling R4C5.
//
// One of the four cells surrounding the circled 2 contains 2 -> Quad, anchored
// at the top-left cell of the 2x2 square the circle sits at the centre of
// (R1C5, R1C6, R2C5, R2C6).

const GREEN_EDGES = [
  // lines[0]: R3C3-R3C2-R4C1-R5C1-R6C2-R6C3-R6C4-R6C5-R5C6-R4C6-R3C6-R2C5-R1C4-R1C3-R2C2-R3C2
  ['R3C3', 'R3C2'],
  ['R3C2', 'R4C1'],
  ['R4C1', 'R5C1'],
  ['R5C1', 'R6C2'],
  ['R6C2', 'R6C3'],
  ['R6C3', 'R6C4'],
  ['R6C4', 'R6C5'],
  ['R6C5', 'R5C6'],
  ['R5C6', 'R4C6'],
  ['R4C6', 'R3C6'],
  ['R3C6', 'R2C5'],
  ['R2C5', 'R1C4'],
  ['R1C4', 'R1C3'],
  ['R1C3', 'R2C2'],
  ['R2C2', 'R3C2'],
  // lines[1]: R5C1-R5C2-R5C3 (spur touching lines[0] at R5C1)
  ['R5C1', 'R5C2'],
  ['R5C2', 'R5C3'],
];

const PURPLE_CELLS = ['R4C5', 'R3C5', 'R2C5', 'R2C6', 'R1C6', 'R1C5'];

const HOLE_CELL = 'R4C5';

const CIRCLED_TWO_TOP_LEFT = 'R1C5';

return [
  new Shape('6x6'),

  ...GREEN_EDGES.map(([a, b]) => new Whisper(3, a, b)),

  new Renban(...PURPLE_CELLS),

  new WhiteDot('R3C3', 'R3C4'),

  new Given(HOLE_CELL, 1, 3, 5),

  new Quad(CIRCLED_TWO_TOP_LEFT, 2),
];
