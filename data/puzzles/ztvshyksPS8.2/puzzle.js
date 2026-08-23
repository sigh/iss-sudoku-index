// Title: Trio Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=ztvshyksPS8
// Source: https://app.crackingthecryptic.com/sudoku/QHH2q4JDJ9

// Normal sudoku rules apply (standard 3x3 boxes). 1/2/3 are marked by
// circles, 4/5/6 are marked by squares; the remaining cells (no marker) hold
// 7/8/9. Marker cells below are transcribed from the drawn circle/square
// overlays, cross-checked against every given digit.
const circles = [
  'R1C3', 'R1C4', 'R1C7', 'R2C2', 'R2C5', 'R2C8', 'R3C1', 'R3C6', 'R3C9',
  'R4C1', 'R4C6', 'R4C9', 'R5C2', 'R5C5', 'R5C8', 'R6C3', 'R6C4', 'R6C7',
  'R7C3', 'R7C4', 'R7C7', 'R8C2', 'R8C5', 'R8C8', 'R9C1', 'R9C6', 'R9C9',
];
const squares = [
  'R1C2', 'R1C5', 'R1C8', 'R2C1', 'R2C6', 'R2C9', 'R3C2', 'R3C5', 'R3C7',
  'R4C3', 'R4C4', 'R4C8', 'R5C1', 'R5C3', 'R5C4', 'R6C6', 'R6C8', 'R6C9',
  'R7C1', 'R7C5', 'R7C6', 'R8C3', 'R8C7', 'R8C9', 'R9C2', 'R9C4', 'R9C7',
];
const unmarked = [
  'R1C1', 'R1C6', 'R1C9', 'R2C3', 'R2C4', 'R2C7', 'R3C3', 'R3C4', 'R3C8',
  'R4C2', 'R4C5', 'R4C7', 'R5C6', 'R5C7', 'R5C9', 'R6C1', 'R6C2', 'R6C5',
  'R7C2', 'R7C8', 'R7C9', 'R8C1', 'R8C4', 'R8C6', 'R9C3', 'R9C5', 'R9C8',
];

// Given cells already carry a fixed value, so a Given for the marker's
// candidate set is redundant there (and would duplicate the constraint on
// that cell id): skip those cells from the marker lists below.
const givens = {
  R1C3: 1, R2C5: 2, R2C7: 8, R4C6: 3, R7C1: 4, R9C2: 5, R9C5: 7,
};
const notGiven = (c) => !(c in givens);

return [
  new Shape('9x9'),
  ...Object.entries(givens).map(([c, v]) => new Given(c, v)),
  ...circles.filter(notGiven).map((c) => new Given(c, 1, 2, 3)),
  ...squares.filter(notGiven).map((c) => new Given(c, 4, 5, 6)),
  ...unmarked.filter(notGiven).map((c) => new Given(c, 7, 8, 9)),
];
