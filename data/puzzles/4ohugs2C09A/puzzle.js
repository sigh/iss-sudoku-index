// Title: Thermo Sudoku
// Author: Christoph Seeliger
// Video: https://www.youtube.com/watch?v=4ohugs2C09A
// Source: https://cracking-the-cryptic.web.app/sudoku/Jr3JPpr6P2

// Normal sudoku: 1-9 in every row, column and 3x3 box (the standard boxes,
// which the source draws explicitly).
// Along a thermometer, digits increase strictly away from the bulb.
// Nothing else is drawn or stated; no rule is omitted.

// Thermometer cell paths, bulb first, transcribed from the five grey
// bulb-and-shaft figures. Diagonal steps (R3C1-R2C2, R2C2-R3C3, R6C3-R7C2)
// run corner to corner and so cover no intermediate cell.
const thermos = [
  ['R1C1', 'R2C1', 'R3C1', 'R2C2', 'R3C3', 'R2C3', 'R1C3'],
  ['R4C6', 'R4C5', 'R4C4', 'R5C4', 'R5C5', 'R5C6', 'R6C6', 'R6C5', 'R6C4'],
  ['R7C9', 'R7C8', 'R7C7', 'R8C7', 'R9C7', 'R9C8', 'R9C9'],
  ['R9C3', 'R8C3', 'R7C3', 'R6C3', 'R7C2'],
];

// The fifth figure branches: one bulb at R2C7, a stem down column 7 and along
// row 4 to R4C9, and there a vertical bar of ink covering R3C9, R4C9 and R5C9
// -- a T whose junction is R4C9 and whose two tips are R3C9 and R5C9. Each
// bulb-to-tip run increases, so it is two thermometers sharing the stem.
// (Read instead as one walk, the ink would demand R4C9 < R3C9 < R4C9.)
const branchStem = ['R2C7', 'R3C7', 'R4C7', 'R4C8', 'R4C9'];
const branchTips = ['R3C9', 'R5C9'];

return [
  new Shape('9x9'),

  new Given('R2C5', 3),
  new Given('R5C2', 1),
  new Given('R5C8', 9),
  new Given('R8C5', 1),

  ...thermos.map((cells) => new Thermo(...cells)),
  ...branchTips.map((tip) => new Thermo(...branchStem, tip)),
];
