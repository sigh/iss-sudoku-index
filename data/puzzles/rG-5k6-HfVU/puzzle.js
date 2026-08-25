// Title: Vierter Pfeilchenstrauss (Fourth Bouquet of Arrows)
// Author: Philipp Blume
// Video: https://www.youtube.com/watch?v=rG-5k6-HfVU
// Source: https://app.crackingthecryptic.com/sudoku/4bJmfhdd9f

// Normal sudoku rules apply (standard 3x3 boxes, 3 given digits). Every
// arrow's arm digits sum to either its circle/pill's value or that value's
// square; the circle/pill's own cell(s) are excluded from the arm (Arrow and
// PillArrow already keep their own bulb/pill cells out of the summed arm). A
// pill is a 2-cell circle read left-to-right as a 2-digit number (tens cell
// first, ones cell second); all 3 pills here are horizontal (same row,
// adjacent columns), so that reading is unambiguous.
//
// Arrow/pill cells below are transcribed from the drawn arrow paths,
// cross-checked against the drawn circle/pill positions. Some cells double
// as one arrow's own bulb/pill cell and another arrow's ordinary arm cell
// (e.g. R7C3, R3C6); that is ordinary arrow-sudoku overlap between two
// independently-drawn arrows, not a data error.

function squareOfDigit(bulbCell, arm) {
  // "sum = bulb^2" branch. The bulb is a single unknown digit 1-9, and Sum
  // has no quadratic form, so enumerate each candidate digit v: pin the bulb
  // to v with a single-cell Sum, and require the arm to sum to v*v.
  const branches = [];
  for (let v = 1; v <= 9; v++) {
    branches.push(new And([
      new Sum(v, bulbCell),
      new Sum(v * v, ...arm),
    ]));
  }
  return branches;
}

function squareOfPill(tensCell, onesCell, arm) {
  // Same idea for a 2-digit pill value v = 10*tens + ones. Both digits are
  // ordinary sudoku digits (1-9), so v ranges over the 81 two-digit numbers
  // with no zero digit.
  const branches = [];
  for (let tens = 1; tens <= 9; tens++) {
    for (let ones = 1; ones <= 9; ones++) {
      const v = 10 * tens + ones;
      branches.push(new And([
        new Sum(tens, tensCell),
        new Sum(ones, onesCell),
        new Sum(v * v, ...arm),
      ]));
    }
  }
  return branches;
}

function circleArrow(bulbCell, arm) {
  return new Or([
    new Arrow(bulbCell, ...arm),
    ...squareOfDigit(bulbCell, arm),
  ]);
}

function pillArrow(tensCell, onesCell, arm) {
  return new Or([
    new PillArrow(2, tensCell, onesCell, ...arm),
    ...squareOfPill(tensCell, onesCell, arm),
  ]);
}

// Circle arrows: [bulb, arm (bulb-to-tip order)].
const circleArrows = [
  ['R5C3', ['R6C3', 'R7C3', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7']],
  ['R7C3', ['R7C4', 'R7C5', 'R7C6']],
  ['R2C3', ['R3C4', 'R4C5', 'R5C6', 'R6C7']],
  ['R2C6', ['R3C7', 'R4C8']],
  ['R1C3', ['R1C4', 'R1C5', 'R1C6', 'R1C7']],
  ['R1C7', ['R2C7', 'R3C6']],
];

// Pill arrows: [tensCell, onesCell, arm (pill-to-tip order)].
const pillArrows = [
  ['R1C1', 'R1C2', ['R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8',
    'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1',
    'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R3C2', 'R4C3', 'R5C4',
    'R6C5']],
  ['R1C8', 'R1C9', ['R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9']],
  ['R3C5', 'R3C6', ['R4C6', 'R5C7', 'R6C8']],
];

return [
  new Shape('9x9'),

  new Given('R2C8', 5),
  new Given('R6C4', 2),
  new Given('R8C1', 9),

  ...circleArrows.map(([bulb, arm]) => circleArrow(bulb, arm)),
  ...pillArrows.map(([tens, ones, arm]) => pillArrow(tens, ones, arm)),
];
