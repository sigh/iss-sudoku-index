// Title: Robin Hood's Sudoku
// Author: Jonas Gleim
// Video: https://www.youtube.com/watch?v=pdtWTg4LrqQ
// Source: https://cracking-the-cryptic.web.app/sudoku/h27LtR9RnN

// Normal sudoku rules apply. No given digits.
//
// The published puzzle has no written rules panel, so each clue is read from
// the shape it is drawn as:
//   - Grey line with a fat grey bulb at one end: a thermometer. Digits strictly
//     increase along the line away from the bulb.
//   - Black arrow springing from a white, black-outlined shape: the digits
//     along the shaft sum to the value in that shape.
//   - The row 5 arrow starts at a white, black-outlined rounded rectangle two
//     cells wide over R5C1-R5C2, the two-cell form of the same bulb. Its two
//     cells are read left to right as a two-digit number.
// Every drawn line, arrow and bulb is encoded below; nothing is omitted.

// Thermometers, bulb cell first. Transcribed from the nine grey drawn strokes.
// The T3/T4 pair are the two arms of one bulb at R5C8: the arc is drawn as
// R1C5..R5C8..R9C5 with the bulb in the middle, so digits rise along each arm.
const thermos = [
  ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'],
  ['R2C9', 'R1C9', 'R1C8'],
  ['R5C8', 'R4C8', 'R3C7', 'R2C6', 'R1C5'],
  ['R5C8', 'R6C8', 'R7C7', 'R8C6', 'R9C5'],
  ['R7C8', 'R6C9'],
  ['R4C9', 'R3C8'],
  ['R8C9', 'R9C9', 'R9C8'],
  ['R9C3', 'R9C2', 'R9C1', 'R8C1', 'R7C1'],
  ['R5C5', 'R5C4', 'R5C3'],
];

// Single-cell arrow bulbs, bulb cell first then the shaft, from the two drawn
// diagonal arrows.
const arrows = [
  ['R4C2', 'R3C3', 'R2C4', 'R1C5'],
  ['R6C2', 'R7C3', 'R8C4', 'R9C5'],
];

return [
  new Shape('9x9'),

  ...thermos.map(cells => new Thermo(...cells)),
  ...arrows.map(cells => new Arrow(...cells)),

  // The row 5 arrow: 2 = pill width, so R5C1 R5C2 read left to right are the
  // tens and units digits of the total for the seven shaft cells.
  new PillArrow(2, 'R5C1', 'R5C2',
    'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'),
];
