// Title: Re-framed
// Author: Nordy & Riffclown
// Video: https://www.youtube.com/watch?v=tyw9YGGvTP4
// Source: https://sudokupad.app/9JLLbT9Jj7

// Normal sudoku rules apply; there are no givens.
// Blue line: each line segment within a different 3x3 box sums to the same
//   total. Different lines may have different totals (so one constraint per
//   line, with no total stated).
// Grey line: divides into contiguous, non-overlapping groups each summing
//   to 10.
// Green line: adjacent digits differ by at least 5.
// Every sentence of the rules text is encoded; nothing is omitted.

// Drawn geometry. Each blue line is a closed rectangular frame four cells on a
// side, listed by its top-left and bottom-right corner cells. The four frames
// are congruent and sit on the four interior box corners.
const blueFrames = [
  ['R2C2', 'R5C5'],
  ['R2C5', 'R5C8'],
  ['R5C2', 'R8C5'],
  ['R5C5', 'R8C8'],
];
// Drawn geometry: the grey and green strokes, each a straight run given by its
// two endpoints.
const greyLines = [
  ['R5C8', 'R5C2'],
  ['R8C2', 'R2C2'],
  ['R7C8', 'R4C8'],
];
const greenLines = [
  ['R7C5', 'R4C5'],
  ['R2C2', 'R2C8'],
];

const straightPath = (from, to) => {
  const a = parseCellId(from);
  const b = parseCellId(to);
  const dr = Math.sign(b.row - a.row);
  const dc = Math.sign(b.col - a.col);
  const steps = Math.max(Math.abs(b.row - a.row), Math.abs(b.col - a.col));
  return Array.from(
    { length: steps + 1 },
    (_, i) => makeCellId(a.row + i * dr, a.col + i * dc));
};

// The frame's twelve cells, walked clockwise from its top-left corner.
const framePath = (topLeft, bottomRight) => {
  const a = parseCellId(topLeft);
  const b = parseCellId(bottomRight);
  return [
    ...straightPath(topLeft, makeCellId(a.row, b.col)).slice(0, -1),
    ...straightPath(makeCellId(a.row, b.col), bottomRight).slice(0, -1),
    ...straightPath(bottomRight, makeCellId(b.row, a.col)).slice(0, -1),
    ...straightPath(makeCellId(b.row, a.col), topLeft).slice(0, -1),
  ];
};

const boxOf = (cellId) => {
  const { row, col } = parseCellId(cellId);
  return `${Math.ceil(row / 3)},${Math.ceil(col / 3)}`;
};

// A blue frame is a closed line, so its box segments are the cyclic runs and
// the point at which the drawn stroke happens to start is not a break in it.
// RegionSumLine splits its cell list in the given order, so rotate the cycle to
// begin at a box change; otherwise the run straddling the list ends would be
// scored as two segments. After rotating, each frame is four segments of three
// cells, one per box it passes through.
const rotateToBoxBoundary = (path) => {
  const start = path.findIndex(
    (cell, i) => boxOf(cell) !== boxOf(path[(i + path.length - 1) % path.length]));
  return [...path.slice(start), ...path.slice(0, start)];
};

return [
  new Shape('9x9'),
  ...blueFrames.map(
    corners => new RegionSumLine(...rotateToBoxBoundary(framePath(...corners)))),
  ...greyLines.map(ends => new SumLine(10, ...straightPath(...ends))),
  ...greenLines.map(ends => new Whisper(5, ...straightPath(...ends))),
];
