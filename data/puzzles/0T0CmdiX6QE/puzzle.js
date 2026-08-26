// Title: Lupin's Loop 6 - Between Worlds
// Author: Rab3aron
// Video: https://www.youtube.com/watch?v=0T0CmdiX6QE
// Source: https://sudokupad.app/9snrpdy9fe

// Normal sudoku (default rows/cols/boxes). Dot clues (edges, provenance: source
// overlay colour scan): white = consecutive, yellow = non-consecutive, red =
// one even + one odd digit.
//
// This is only the sudoku-and-dots subset of the puzzle. The loop mechanic
// (single non-branching cable, must-visit electricity signs, river borders,
// purple 3x3-box sensors) and everything built on the loop's segment
// structure (the segment-length population-parity rule, the segment-length
// digit rule, the marked-diagonal length-5 restriction) are all omitted.

const geometry = cellGeometry('9x9');

const whiteDotEdges = [
  ['R8C7', 'R8C8'],
  ['R5C6', 'R6C6'],
  ['R1C3', 'R1C4'],
  ['R7C8', 'R8C8'],
];
const yellowDotEdges = [
  ['R7C3', 'R7C4'],
  ['R3C6', 'R4C6'],
  ['R5C7', 'R5C8'],
];
const redDotEdges = [
  ['R7C4', 'R8C4'],
  ['R4C5', 'R5C5'],
  ['R4C7', 'R4C8'],
  ['R4C9', 'R5C9'],
  ['R1C1', 'R1C2'],
  ['R6C2', 'R6C3'],
  ['R1C8', 'R1C9'],
  ['R9C5', 'R9C6'],
];

const whiteDots = whiteDotEdges.map(([a, b]) => new WhiteDot(a, b));
const notConsecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, geometry.numValues);
const yellowDots = yellowDotEdges.map(([a, b]) =>
  new Pair(notConsecutiveKey, 'non-consecutive', a, b));
const oneEvenOneOddKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), geometry.numValues);
const redDots = redDotEdges.map(([a, b]) =>
  new Pair(oneEvenOneOddKey, 'one-even-one-odd', a, b));

return [
  new Shape('9x9'),
  ...whiteDots,
  ...yellowDots,
  ...redDots,
];
