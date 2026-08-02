// Title: Vice Versa
// Author: Mr.Menace
// Video: https://www.youtube.com/watch?v=jk__aHrtfII
// Source: https://app.crackingthecryptic.com/sudoku/NHMTqjJmRF

// Normal Sudoku rules apply. Blue lines are region sum lines: along a line,
// each line segment within a different 3x3 box sums to the same total.
// Different lines may have different totals. Nothing is omitted.
//
// Four of the blue lines branch. The drawing format has no branching line
// tool, so each branch arrives as an extra stroke that starts or ends part-way
// along another stroke (at R2C4, R3C6, R6C4, R6C6, R8C6 -- all T-junctions, no
// crossings); read stroke-by-stroke instead, three of those strokes lie wholly
// inside one box and would say nothing at all. So the line is the connected
// blue shape, and its segments are the blue cells it has in each box.

// The 15 drawn blue strokes, in source order, each in drawn path order.
const blueStrokes = [
  ['R1C2', 'R1C3', 'R1C4', 'R2C4', 'R3C4', 'R4C4', 'R5C4'],
  ['R1C6', 'R1C7', 'R1C8'],
  ['R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R2C2', 'R2C3', 'R3C3'],
  ['R2C4', 'R2C5'],
  ['R2C8', 'R2C7', 'R2C6', 'R3C6', 'R4C6', 'R5C6'],
  ['R3C5', 'R3C6'],
  ['R3C9', 'R3C8', 'R4C7'],
  ['R4C5', 'R5C5', 'R6C4', 'R6C3', 'R6C2'],
  ['R6C4', 'R7C5'],
  ['R6C5', 'R6C6', 'R6C7', 'R6C8'],
  ['R6C6', 'R7C6', 'R8C6', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R7C4', 'R8C4', 'R8C3', 'R8C2'],
  ['R7C7', 'R8C7', 'R8C8', 'R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R4C8'],
  ['R8C5', 'R8C6'],
  ['R9C2', 'R9C3', 'R9C4', 'R9C5'],
];

// Union-find over the strokes: strokes sharing a cell are one blue line.
const parent = blueStrokes.map((_, i) => i);
const find = (i) => parent[i] === i ? i : (parent[i] = find(parent[i]));
for (let i = 0; i < blueStrokes.length; i++) {
  for (let j = i + 1; j < blueStrokes.length; j++) {
    if (blueStrokes[i].some(c => blueStrokes[j].includes(c))) {
      parent[find(i)] = find(j);
    }
  }
}
const blueLines = [...new Set(blueStrokes.map((_, i) => find(i)))].map(
  root => blueStrokes.filter((_, i) => find(i) === root));

const boxes = cellGraph('9x9').boxes();

// A line's cells, grouped by the box they lie in. Each group here is a single
// orthogonally connected run of blue, i.e. one drawn segment; no line enters
// the same box twice.
const boxSegments = (cells) => boxes
  .map(box => cells.filter(c => box.includes(c)))
  .filter(segment => segment.length > 0);

const regionSumLines = blueLines.map(
  strokes => strokes.length === 1
    // An unbranched line is a path, so RegionSumLine can split it by box.
    ? new RegionSumLine(...strokes[0])
    // A branched line has no single path order to walk, so state its box
    // segments directly; equal segment sums is the same rule. The junction
    // cell is in two strokes, so de-duplicate before summing.
    : new EqualSum(...boxSegments([...new Set(strokes.flat())])));

return [
  new Shape('9x9'),
  new Given('R5C3', 7),
  ...regionSumLines,
];
