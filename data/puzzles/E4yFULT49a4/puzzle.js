// Title: unknown
// Author: Christoph Seeliger
// Video: https://www.youtube.com/watch?v=E4yFULT49a4
// Source: https://cracking-the-cryptic.web.app/sudoku/hP46qg8QMp

// Normal Sudoku rules apply: each row, column and 3x3 box holds 1-9 once.
// Six grey lines each carry an identical hollow circle at both ends and no
// mark on their interior cells; digits on a line are strictly between the two
// circled digits at its ends. Nothing else is drawn, and no rule is omitted.
//
// The source page carries no rules text, so the clue type is read from the
// art: all six lines share one grey and one thickness, all eight circles share
// one white fill and grey border, and no end carries an arrowhead or any other
// distinguishing mark -- one symmetric two-circle clue type across all six.
// The alternative symmetric two-circle family, the double arrow, admits no
// completion of this grid: as a double arrow the R1C5-R5C1 segment forces
// R1C5 = 7 and R5C1 = 6 (its two circles sum to at most 13 given the givens,
// and its five middle cells sum to at least 13 because R1C3/R2C2/R3C1 share
// box 1 with the given 1), and the R9C5-R5C9 or R5C9-R1C5 segment read the
// same way then contradicts that.

// Givens, read off the grid.
const givens = {
  R1C1: 1, R1C9: 8,
  R2C5: 5,
  R3C5: 3,
  R5C2: 5, R5C3: 4, R5C5: 9, R5C7: 1, R5C8: 8,
  R7C5: 1,
  R8C5: 6,
  R9C1: 7, R9C9: 1,
};

// The six drawn lines, end to end, circled cell first and last. The first four
// are the segments of the closed ring through the edge-midpoint cells R1C5,
// R5C1, R9C5 and R5C9, which are its four circled corners; the last two are
// the separate 3-cell diagonal segments.
const betweenLines = [
  ['R1C5', 'R1C4', 'R1C3', 'R2C2', 'R3C1', 'R4C1', 'R5C1'],
  ['R5C1', 'R6C1', 'R7C1', 'R8C2', 'R9C3', 'R9C4', 'R9C5'],
  ['R9C5', 'R9C6', 'R9C7', 'R8C8', 'R7C9', 'R6C9', 'R5C9'],
  ['R5C9', 'R4C9', 'R3C9', 'R2C8', 'R1C7', 'R1C6', 'R1C5'],
  ['R2C6', 'R3C7', 'R4C8'],
  ['R6C2', 'R7C3', 'R8C4'],
];

return [
  new Shape('9x9'),
  ...Object.entries(givens).map(([cell, value]) => new Given(cell, value)),
  ...betweenLines.map((cells) => new Between(...cells)),
];
