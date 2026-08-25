// Title: Cupid Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=asGob1naOag
// Source: https://app.crackingthecryptic.com/webapp/4MpBPRM2tQ

// Rules: "Normal sudoku rules apply. Digits in a cell with an arrow must
// repeat at least once in the direction of the arrow."
//
// Normal sudoku is the solver default (row/column/box all-different).
//
// Twenty short diagonal strokes are drawn, each lying wholly inside one cell
// and reaching only part-way from that cell's centre to one corner, with an
// arrowhead at the outer end. An arrow therefore carries exactly one digit --
// the digit of the cell it is drawn in -- and "in the direction of the arrow"
// is the diagonal ray leading away from that cell towards the marked corner.
// Encoded as: the arrow cell's digit occurs again in at least one cell of
// that ray. Eight of the twelve marked cells carry two ticks pointing at two
// different corners; each tick is still its own independent arrow, since
// treating a corner-pair as one merged, cardinal-direction (row/column) arrow
// would require a repeat along that row or column, which normal sudoku
// already forbids.
//
// Nothing is omitted.

// Drawn geometry: the cell each stroke lies in, and its arrowhead's direction
// as [row step, col step]. Transcribed from the twenty diagonal ticks.
const arrows = [
  ['R5C1', -1, 1],
  ['R8C6', -1, 1],
  ['R7C2', -1, 1],
  ['R8C3', -1, 1],
  ['R4C7', -1, 1],
  ['R3C6', -1, 1],
  ['R2C4', 1, -1],
  ['R2C7', 1, -1],
  ['R6C3', 1, -1],
  ['R7C4', 1, -1],
  ['R3C8', 1, -1],
  ['R5C9', 1, -1],
  ['R6C3', 1, 1],
  ['R7C2', 1, 1],
  ['R2C7', 1, 1],
  ['R3C6', 1, 1],
  ['R8C3', -1, -1],
  ['R7C4', -1, -1],
  ['R4C7', -1, -1],
  ['R3C8', -1, -1],
];

// The cells the arrow points at: the diagonal from the arrow's cell to the
// grid edge, exclusive of the arrow's own cell.
function cellsAhead(cellId, rowStep, colStep) {
  const { row, col } = parseCellId(cellId);
  const cells = [];
  for (let r = row + rowStep, c = col + colStep;
    r >= 1 && r <= 9 && c >= 1 && c <= 9;
    r += rowStep, c += colStep) {
    cells.push(makeCellId(r, c));
  }
  return cells;
}

// "must repeat at least once in the direction of the arrow": some cell ahead
// of the arrow holds the arrow cell's digit. SameValues(2, a, b) makes two
// one-cell sets hold the same values, i.e. a === b.
function repeatsAhead([cellId, rowStep, colStep]) {
  return new Or(
    cellsAhead(cellId, rowStep, colStep).map(
      ahead => new SameValues(2, cellId, ahead)));
}

return [
  new Shape('9x9'),

  new Given('R1C2', 7),
  new Given('R1C5', 1),
  new Given('R2C1', 4),
  new Given('R2C3', 5),
  new Given('R3C2', 3),
  new Given('R4C5', 2),
  new Given('R5C4', 4),
  new Given('R5C6', 6),
  new Given('R6C5', 8),
  new Given('R7C8', 3),
  new Given('R8C7', 7),
  new Given('R8C9', 8),
  new Given('R9C5', 9),
  new Given('R9C8', 5),

  ...arrows.map(repeatsAhead),
];
