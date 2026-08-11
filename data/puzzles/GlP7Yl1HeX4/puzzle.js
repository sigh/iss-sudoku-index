// Title: Polarity
// Author: A_Majestic_Hobo
// Video: https://www.youtube.com/watch?v=GlP7Yl1HeX4
// Source: https://app.crackingthecryptic.com/sudoku/qLDQq7tn94

// Normal sudoku rules apply (standard 9x9, default 3x3 boxes -- the source's
// drawn regions are exactly the default box partition).
// White dots join consecutive digits; black dots join digits with a 1:2
// ratio. "Not all dots are given" forbids inferring a negative (no-dot)
// constraint on unmarked adjacent pairs, so none is encoded.
// Adjacent digits along a green or purple line differ by at least 5
// (Whisper(5)).
// Lines of the same color share the same count of digits >5 and the same
// count of digits <5; lines of different colors do not.
//
// Whisper(5) on the 1-9 range forbids 5 entirely on line cells (no partner
// digit is >=5 away from 5) and forces every adjacent pair to be one Low
// digit (1-4) paired with one High digit (6-9). So every line strictly
// alternates Low/High, and for a fixed 5-cell line length the count of
// High digits is fully determined by whether the line's first cell is Low
// or High (Low-first -> 3 Low/2 High; High-first -> 2 Low/3 High). The
// "share the same amount" rule is therefore encoded as first-cell Low/High
// membership: both purple lines share one polarity, both green lines share
// the other (exactly one of the two global assignments), via Given
// candidate-set restrictions inside an Or.

const whiteDots = [
  ['R2C4', 'R3C4'],
  ['R2C5', 'R2C6'],
  ['R5C2', 'R6C2'],
  ['R7C6', 'R8C6'],
  ['R8C4', 'R8C5'],
  ['R4C8', 'R5C8'],
];

const blackDots = [
  ['R6C2', 'R7C2'],
  ['R3C8', 'R4C8'],
  ['R6C7', 'R7C7'],
  ['R7C7', 'R7C8'],
  ['R3C3', 'R4C3'],
  ['R3C2', 'R3C3'],
];

// Purple and green whisper lines, cell order as drawn on the board.
const purpleLines = [
  ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R4C4'],
  ['R6C6', 'R6C5', 'R7C5', 'R8C5', 'R9C5'],
];

const greenLines = [
  ['R4C6', 'R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R6C4'],
];

const LOW = [1, 2, 3, 4];
const HIGH = [6, 7, 8, 9];

return [
  new Shape('9x9'),

  new Given('R1C1', 9),
  new Given('R1C6', 4),
  new Given('R1C9', 2),
  new Given('R3C7', 9),
  new Given('R7C3', 7),
  new Given('R9C1', 4),
  new Given('R9C4', 2),
  new Given('R9C9', 7),

  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),

  ...purpleLines.map(cells => new Whisper(5, ...cells)),
  ...greenLines.map(cells => new Whisper(5, ...cells)),

  new Or([
    new And([
      new Given(purpleLines[0][0], ...LOW),
      new Given(purpleLines[1][0], ...LOW),
      new Given(greenLines[0][0], ...HIGH),
      new Given(greenLines[1][0], ...HIGH),
    ]),
    new And([
      new Given(purpleLines[0][0], ...HIGH),
      new Given(purpleLines[1][0], ...HIGH),
      new Given(greenLines[0][0], ...LOW),
      new Given(greenLines[1][0], ...LOW),
    ]),
  ]),
];
