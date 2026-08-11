// Title: Twenty-four and what?
// Author: AndreasV
// Video: https://www.youtube.com/watch?v=2PVxJycVmWo
// Source: https://app.crackingthecryptic.com/sudoku/q6GHMnFmt9

// Normal sudoku rules apply. A circle is drawn at the corner shared by four
// cells; the four digits surrounding a circle must sum to the number in the
// circle and may not repeat. One circle shows 24 (fixed sum, digits
// distinct). The other 21 circles are unlabeled and all represent the same
// sum as each other -- a value the solver must find -- so each is also
// distinct-digit, and their totals are tied together.

const labeledCircle = ['R1C2', 'R1C3', 'R2C2', 'R2C3'];

const emptyCircles = [
  ['R1C3', 'R1C4', 'R2C3', 'R2C4'],
  ['R2C1', 'R2C2', 'R3C1', 'R3C2'],
  ['R3C1', 'R3C2', 'R4C1', 'R4C2'],
  ['R5C1', 'R5C2', 'R6C1', 'R6C2'],
  ['R5C2', 'R5C3', 'R6C2', 'R6C3'],
  ['R6C2', 'R6C3', 'R7C2', 'R7C3'],
  ['R7C5', 'R7C6', 'R8C5', 'R8C6'],
  ['R6C5', 'R6C6', 'R7C5', 'R7C6'],
  ['R6C4', 'R6C5', 'R7C4', 'R7C5'],
  ['R5C4', 'R5C5', 'R6C4', 'R6C5'],
  ['R5C5', 'R5C6', 'R6C5', 'R6C6'],
  ['R4C5', 'R4C6', 'R5C5', 'R5C6'],
  ['R4C4', 'R4C5', 'R5C4', 'R5C5'],
  ['R3C4', 'R3C5', 'R4C4', 'R4C5'],
  ['R3C5', 'R3C6', 'R4C5', 'R4C6'],
  ['R1C5', 'R1C6', 'R2C5', 'R2C6'],
  ['R1C6', 'R1C7', 'R2C6', 'R2C7'],
  ['R2C7', 'R2C8', 'R3C7', 'R3C8'],
  ['R5C7', 'R5C8', 'R6C7', 'R6C8'],
  ['R5C8', 'R5C9', 'R6C8', 'R6C9'],
  ['R8C8', 'R8C9', 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),

  new Given('R5C4', 1),
  new Given('R5C6', 7),

  // The printed circle: distinct digits summing to 24.
  new Cage(24, ...labeledCircle),

  // Each unlabeled circle: distinct digits, sum unknown but shared.
  ...emptyCircles.map(cells => new AllDifferent(...cells)),
  new EqualSum(...emptyCircles),
];
