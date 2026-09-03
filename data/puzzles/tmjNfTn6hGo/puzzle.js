// Title: Regional Differences
// Author: Lake
// Video: https://www.youtube.com/watch?v=tmjNfTn6hGo
// Source: https://sudokupad.app/r3xtlrd6qv

// Rules encoded here:
//   Normal sudoku rules apply.
//   Box borders divide lines into segments. Each sum of adjacent segments on
//   one of these lines has the same difference.
//   The different colours do not mean anything -- decorative, nothing to encode.
//
// Segmenting a line: walk it from one end to the other; a segment is a maximal
// run of consecutive cells lying in the same 3x3 box. A box the line leaves and
// later re-enters contributes a separate segment for each visit (the aqua line
// re-enters box 5, the yellow line box 1, the green line box 2), so the walk
// order matters and a tidied per-box grouping would be wrong.
//
// "The same difference" is read unsigned, as the sentence writes it: the
// adjacent-segment-sum differences all share one magnitude, chosen per line
// (nothing in the rules ties the six lines to a common value). The stricter
// reading, in which the segment sums form an arithmetic progression, is the
// special case of this where every step runs the same way, so it is included.

// The drawn lines, each traced end to end in drawn order. Cells that follow one
// another diagonally are adjacent on the drawing; the rule only needs the order.
const LINES = [
  // salmon
  ['R1C1', 'R2C1', 'R3C1', 'R3C2', 'R2C2', 'R1C2', 'R1C3', 'R2C3', 'R3C3',
    'R4C3', 'R4C2', 'R4C1', 'R5C1', 'R6C2', 'R5C2', 'R5C3', 'R6C3', 'R7C3',
    'R7C2', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6',
    'R8C5', 'R8C6', 'R7C7', 'R8C7', 'R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9',
    'R6C9', 'R5C9', 'R4C9', 'R4C8', 'R4C7', 'R5C7'],
  // aqua
  ['R5C7', 'R5C6', 'R4C6', 'R3C5', 'R4C4', 'R4C3', 'R4C2'],
  // plum
  ['R5C3', 'R6C4', 'R7C3'],
  // gold
  ['R8C2', 'R8C3', 'R8C4', 'R7C5', 'R7C6', 'R6C7', 'R7C8', 'R8C8'],
  // yellow
  ['R3C3', 'R3C4', 'R2C4', 'R1C4', 'R1C3'],
  // green
  ['R1C5', 'R1C6', 'R2C7', 'R2C8', 'R3C8', 'R3C7', 'R4C7', 'R3C6'],
];

// 0-8, reading boxes left to right then top to bottom.
const boxOf = (cellId) => {
  const { row, col } = parseCellId(cellId);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
};

const boxSegments = (cells) => cells.reduce((segments, cell) => {
  const last = segments[segments.length - 1];
  if (last && boxOf(last[0]) === boxOf(cell)) last.push(cell);
  else segments.push([cell]);
  return segments;
}, []);

// One segment's cells as Sum terms at the given coefficient.
const terms = (segment, coeff) => segment.map(cell => [cell, coeff]);

// For segment sums A, B, C in a row, |A - B| = |B - C| holds exactly when
// A - 2B + C = 0 (the two steps run the same way) or A - C = 0 (they reverse).
// Imposing that on every consecutive triple makes all of a line's adjacent
// differences equal, without naming the common difference.
const sameDifference = (segments) => segments.slice(0, -2).map((_, i) => new Or([
  new Sum(0,
    ...terms(segments[i], 1),
    ...terms(segments[i + 1], -2),
    ...terms(segments[i + 2], 1)),
  new EqualSum(segments[i], segments[i + 2]),
]));

return [
  new Shape('9x9'),
  new Given('R1C1', 9),
  ...LINES.flatMap(cells => sameDifference(boxSegments(cells))),
];
