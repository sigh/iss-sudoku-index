// Title: Something Stupid
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=wki4oNzykTI
// Source: https://sudokupad.app/4wlunbtlaq

// Shuffled Somedoku: no row/column/box all-different at all (payload marks
// `norowcol`, draws no box regions) -- a Raw grid, so every rule is stated
// explicitly below. Every gold circle (the main diagonal, R1C1..R9C9)
// contains a different digit, and each circle's value is the count of
// distinct digits in its own row AND in its own column (it sits on both).
// Zipper line: digits equidistant from the centre sum to the centre digit.
// German whisper: adjacent line digits differ by >= 5. Red dot: one odd, one
// even. Black dot: one double the other. Fog/reveal is solving UI, not
// encoded.

const shape = new Shape('9x9', '', 'Raw');
const graph = cellGraph(shape);

// Gold circles: the 9 khaki-bordered underlay circles, one per cell on the
// main diagonal, R1C1..R9C9.
const diagonal = [
  'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9',
];

// CountDistinct's control cell is excluded from its own counted list by the
// class's own semantics ("counts the number of distinct values among the
// REMAINING cells"), but a gold circle's rule is about the FULL row/column,
// including the circle's own cell. Repeating the control cell's id inside
// the counted list makes the count self-inclusive, so each row/column call
// lists the diagonal cell once as control and once more among the counted
// cells.
const rowCounts = graph.rows().map((row, i) =>
  new CountDistinct(diagonal[i], ...row));
const colCounts = graph.columns().map((col, i) =>
  new CountDistinct(diagonal[i], ...col));

const distinctCircles = new AllDifferent(...diagonal);

// Zipper line (lavender), anti-diagonal corner to corner; centre R5C5 carries
// the line's own "centre of zipper" marker, not a separate clue.
const zipper = new Zipper(
  'R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9');

// German whisper lines (green). The border loop is drawn as a closed ring
// around all 32 edge cells; the cell list repeats the first cell at the end
// so the wrap-around edge (R1C8-R1C9 back to R1C9-R2C9) is covered too.
const borderLoop = [
  'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9',
  'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1',
  'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1',
  'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9',
];
const whispers = [
  new Whisper(5, ...borderLoop),
  new Whisper(5, 'R2C6', 'R2C7'),
  new Whisper(5, 'R3C2', 'R4C2'),
];

// Red dots: one odd, one even. There is no built-in parity-pair class, so
// this is a custom pairwise predicate.
const oddEvenKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
const redDots = [
  ['R3C4', 'R3C5'],
  ['R3C5', 'R4C5'],
  ['R3C5', 'R3C6'],
  ['R2C5', 'R3C5'],
  ['R4C2', 'R4C3'],
].map(([a, b]) => new Pair(oddEvenKey, 'RedDot', a, b));

// Black dots: one double the other (Kropki black dot semantics).
const blackDots = [
  ['R8C6', 'R9C6'],
  ['R6C2', 'R6C3'],
  ['R4C2', 'R5C2'],
  ['R8C3', 'R8C4'],
].map(([a, b]) => new BlackDot(a, b));

return [
  shape,
  ...rowCounts,
  ...colCounts,
  distinctCircles,
  zipper,
  ...whispers,
  ...redDots,
  ...blackDots,
];
