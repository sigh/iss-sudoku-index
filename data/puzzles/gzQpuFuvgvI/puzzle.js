// Title: Chaotic Equality
// Author: Knickolas
// Video: https://www.youtube.com/watch?v=gzQpuFuvgvI
// Source: https://app.crackingthecryptic.com/sudoku/RjG3t8B9dp

// Rules encoded here, in full:
//  - Divide the grid into nine regions of nine orthogonally-connected cells.
//  - Each row, column and region contains 1-9 once each.
//  - Each line must pass through at least two regions.
//  - A "line segment" is the digits along the line within a region, from where
//    the line starts in that region until it next leaves it (or ends); all
//    segments of one line have the same sum.  Different lines may differ.
//  - A digit in a circle counts the cells that are part of a line in that
//    cell's region.
// The grid has no givens.  Nothing is omitted.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');   // solver-deduced region label per cell

// The eight grey strokes, in walk order.  Each is drawn twice in the source (a
// grey fill over a white outline covering the same edges); that is one clue.
const LINES = [
  ['R2C3', 'R1C3', 'R1C4', 'R1C5', 'R1C6'],
  ['R2C7', 'R3C7', 'R3C6'],
  ['R3C3', 'R3C4', 'R4C4'],
  ['R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1'],
  ['R8C1', 'R8C2', 'R8C3', 'R8C4', 'R7C4'],
  ['R8C6', 'R8C7', 'R7C7', 'R7C6'],
  ['R7C8', 'R8C8', 'R9C8', 'R9C9'],
  ['R5C9', 'R5C8', 'R5C7'],
];

// The nine circled cells.
const CIRCLES = [
  'R1C7', 'R2C8', 'R4C9', 'R5C6', 'R6C9', 'R7C1', 'R7C5', 'R8C5', 'R9C3',
];

const lineCells = [...new Set(LINES.flat())];   // 32 cells

// Segments of one line.  The region labels along the walk induce exactly one
// pattern of "consecutive cells share a region" / "consecutive cells do not",
// so enumerating the 2^(n-1) patterns over the adjacent pairs partitions every
// possible labelling: bit i set means cells i and i+1 lie in different regions.
// A branch pins its own pattern (SameValues ties two CC cells, AllDifferent
// separates them) and applies EqualSum to the runs the pattern cuts the line
// into, so the Or is the rule itself rather than a relaxation of it.  Splitting
// on adjacent pairs and nothing else is what makes a line that leaves a region
// and comes back start a fresh segment, as the rules' "from the point that line
// starts in that region to when it next leaves it" requires.  Pattern 0 -- no
// split anywhere, the whole line in one region -- is dropped: that is the "each
// line must pass through at least two regions" clause.
// 15 branches per 5-cell line, 7 per 4-cell line, 3 per 3-cell line: 68 total.
const equalSegments = (line) => {
  const branches = [];
  for (let pattern = 1; pattern < (1 << (line.length - 1)); pattern++) {
    const borders = [];
    const runs = [[line[0]]];
    for (let i = 0; i + 1 < line.length; i++) {
      const split = (pattern >> i) & 1;
      const a = cc.at(line[i]);
      const b = cc.at(line[i + 1]);
      borders.push(split ? new AllDifferent(a, b) : new SameValues(2, a, b));
      if (split) runs.push([]);
      runs[runs.length - 1].push(line[i + 1]);
    }
    branches.push(new And([...borders, new EqualSum(...runs)]));
  }
  return new Or(branches);
};

// ChaosCount(control, offset, reference, ...others) sets the control digit to
// the number of the listed CC cells sharing the reference cell's region, less
// the offset.  Listing the circle's own CC cell as the reference always counts
// it, and no circled cell is on a line, so offset 1 discards exactly that one
// and leaves the count of line cells sharing the circle's region.
const circleCount = (circle) =>
  new ChaosCount(circle, 1, cc.at(circle), ...cc.at(lineCells));

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...LINES.map(equalSegments),
  ...CIRCLES.map(circleCount),
];
