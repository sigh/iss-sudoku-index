// Title: Friendly Circles
// Author: FIT7Y
// Video: https://www.youtube.com/watch?v=Eugspj43SGA
// Source: https://sudokupad.app/70gesrzbl4

// Normal sudoku, plus one given (R8C2=6).
//
// A cell is friendly if its digit equals its row number, its column number,
// or its box number (boxes numbered 1-9 in reading order). The diagram shows
// 21 circles already drawn (GIVEN_CIRCLES, below, transcribed from the
// puzzle's circle underlays); the rule then adds a circle to every friendly
// cell that lacks one. It never says to remove a circle, so the final
// circled cells are the union of GIVEN_CIRCLES and every friendly cell --
// a pre-drawn circle counts regardless of what digit lands under it, and a
// friendly cell counts whether or not it already had a circle.
//
// "If a digit N appears on a circle, then it appears N times on circles":
// fix a digit N. A circle can hold N only if the cell is in GIVEN_CIRCLES
// (any digit there is circled), or the cell is friendly for N -- which, with
// N fixed, depends only on position: row N, column N, or box N. So every
// circled occurrence of N lies in (row N, column N, box N, or
// GIVEN_CIRCLES combined), and every occurrence of N inside that cell set is
// guaranteed circled (by one of the two reasons above). That set is exactly
// `friendlyCandidateCells(N)` below. The rule becomes, per digit: either N
// never appears in that cell set, or it appears there exactly N times --
// encoded literally as the Or/ContainExact pair in `friendlyCircleRule`.

const GIVEN_CIRCLES = [
  // Transcribed from the puzzle's 21 circle underlays.
  'R2C5', 'R3C1', 'R3C2', 'R4C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4', 'R4C6',
  'R4C8', 'R4C9', 'R4C7', 'R7C9', 'R3C6', 'R3C5', 'R2C6', 'R8C7', 'R1C8',
  'R1C9', 'R5C2', 'R5C1',
];

const ALL_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const boxOf = (r, c) => 3 * Math.floor((r - 1) / 3) + Math.floor((c - 1) / 3) + 1;

function friendlyCandidateCells(digit) {
  const cells = new Set(GIVEN_CIRCLES);
  for (let i = 1; i <= 9; i++) {
    cells.add(makeCellId(digit, i)); // row `digit`
    cells.add(makeCellId(i, digit)); // column `digit`
  }
  for (let r = 1; r <= 9; r++) {
    for (let c = 1; c <= 9; c++) {
      if (boxOf(r, c) === digit) cells.add(makeCellId(r, c)); // box `digit`
    }
  }
  return [...cells];
}

function friendlyCircleRule(digit) {
  const cells = friendlyCandidateCells(digit);
  const neverAppears = new And(
    cells.map(cell => new Given(cell, ...ALL_VALUES.filter(v => v !== digit)))
  );
  const exactlyDigitTimes = new ContainExact(
    Array(digit).fill(digit).join('_'), ...cells
  );
  return new Or([neverAppears, exactlyDigitTimes]);
}

return [
  new Shape('9x9'),
  new Given('R8C2', 6),
  ...ALL_VALUES.map(friendlyCircleRule),
];
