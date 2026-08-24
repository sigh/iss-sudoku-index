// Title: August 8, 2021: Cupid Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=i3JiNbn1t_Q
// Source: https://app.crackingthecryptic.com/sudoku/qMRg43pfRn

// Rules: "Normal sudoku rules apply. Digits on an arrow must repeat at least
// once in the direction of the arrow."
//
// Normal sudoku is the solver default (row/column/box all-different).
//
// Twelve small arrows are drawn, each a short diagonal stroke lying wholly
// inside one cell, with its head pointing at one of that cell's corners. An
// arrow therefore carries exactly one digit -- the digit of the cell it is
// drawn in -- and "in the direction of the arrow" is the diagonal ray leading
// away from that cell towards the head. Encoded as: the arrow cell's digit
// occurs again in at least one cell of that ray.
//
// Nothing is omitted.

// Drawn geometry: the cell each arrow stroke lies in, and the head's direction
// as [row step, col step]. Transcribed from the twelve diagonal strokes.
const arrows = [
  ['R4C1', 1, 1],
  ['R5C2', 1, 1],
  ['R6C3', 1, 1],
  ['R3C4', 1, -1],
  ['R2C5', 1, -1],
  ['R1C6', 1, -1],
  ['R9C4', -1, 1],
  ['R8C5', -1, 1],
  ['R7C6', -1, 1],
  ['R6C9', -1, -1],
  ['R5C8', -1, -1],
  ['R4C7', -1, -1],
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

  new Given('R2C3', 1),
  new Given('R2C4', 2),
  new Given('R2C6', 3),
  new Given('R2C7', 4),
  new Given('R3C2', 5),
  new Given('R3C5', 6),
  new Given('R3C8', 7),
  new Given('R4C2', 3),
  new Given('R4C8', 8),
  new Given('R5C3', 4),
  new Given('R5C7', 1),
  new Given('R6C4', 6),
  new Given('R6C6', 4),
  new Given('R7C5', 7),

  ...arrows.map(repeatsAhead),
];
