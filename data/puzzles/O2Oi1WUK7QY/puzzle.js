// Title: Jedi Sudoku: X-Wings Beat TIE Fighters!
// Author: Sam Cavnar-Johnson
// Video: https://www.youtube.com/watch?v=O2Oi1WUK7QY
// Source: https://cracking-the-cryptic.web.app/sudoku/mF9n66BhQ3

// Normal sudoku rules apply (standard boxes, defaults kept). Two givens.
// Along each thermometer, digits strictly increase from the bulb end.
// Twelve thermometer strokes are drawn, in two colours (grey/purple); the
// rules give colour no meaning, so both colours are encoded the same way.
//
// Thermometers #5 and #6 (R5C3-R5C4-R4C5-R5C6-R5C7 and R5C4-R6C5-R5C6) share
// a bulb at R5C3 with #4 and share endpoints R5C4/R5C6 with each other,
// forming a diamond: two parallel increasing arms (via R4C5 and via R6C5)
// between the same low cell (R5C4, adjacent to the bulb) and high cell
// (R5C6, adjacent to the shared tip R5C7). That connectivity -- not stroke
// draw order -- fixes #6's direction as R5C4 -> R6C5 -> R5C6. Encoding both
// arms as their own Thermo keeps every drawn increasing edge.

const thermos = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],
  ['R8C3', 'R7C3', 'R6C3'],
  ['R5C3', 'R4C3', 'R3C3', 'R2C3'],
  ['R5C3', 'R5C4', 'R4C5', 'R5C6', 'R5C7'],
  ['R5C4', 'R6C5', 'R5C6'],
  ['R7C4', 'R6C4', 'R7C5'],
  ['R2C7', 'R3C7', 'R4C7'],
  ['R8C7', 'R7C7', 'R6C7'],
  ['R5C8', 'R5C9', 'R6C9'],
  ['R4C9', 'R4C8'],
  ['R2C2', 'R3C2', 'R3C1', 'R2C1'],
];

return [
  new Shape('9x9'),
  new Given('R2C9', 5),
  new Given('R8C8', 2),
  ...thermos.map((cells) => new Thermo(...cells)),
];
