// Title: Oyster
// Author: Tyrgannus
// Video: https://www.youtube.com/watch?v=h9wI3XNZ07A
// Source: https://app.crackingthecryptic.com/sudoku/G7Nh7pnNmR

// Standard 9x9 sudoku (payload regions are plain 3x3 boxes, so the default
// row/column/box constraints already match). Along each thermometer, digits
// increase from the bulb (Thermo, bulb cell first). A digit printed in a
// circle at the corner of four cells must appear in at least one of those
// four cells (Quad with a single value).
//
// The corner of R3C3/R3C4/R4C3/R4C4 (the puzzle's "pearl") carries a blank
// bordered circle plus two smaller unbordered marks reading "1 2" and "8 9",
// positioned on the two edges either side of that same corner rather than
// inside one circle. Read as one split quadruple listing the union of both
// marks' digits (the same multi-circle-at-one-corner idiom seen elsewhere),
// touching the same four cells as the blank circle.

const thermos = [
  ['R1C9', 'R2C9'],
  ['R3C5', 'R2C6'],
  ['R5C2', 'R4C2', 'R3C2', 'R2C3', 'R2C4', 'R2C5'],
  ['R5C3', 'R6C2'],
  ['R7C3', 'R7C4', 'R7C5', 'R7C6', 'R6C7', 'R5C7', 'R4C7', 'R3C7'],
  ['R4C8', 'R5C8', 'R6C8', 'R7C7', 'R8C6', 'R8C5', 'R8C4'],
  ['R9C1', 'R9C2'],
];
const thermoRules = thermos.map(cells => new Thermo(...cells));

// [top-left cell of the touching 2x2, ...printed digits]
const circles = [
  ['R1C1', 5],
  ['R8C8', 5],
  ['R2C7', 4],
  ['R7C2', 4],
  ['R5C5', 7],
  ['R3C3', 1, 2, 8, 9],
];
const circleRules = circles.map(([topLeft, ...digits]) => new Quad(topLeft, ...digits));

return [
  new Shape('9x9'),
  ...thermoRules,
  ...circleRules,
];
