// Title: Chaotic Equality
// Author: Knickolas
// Video: https://www.youtube.com/watch?v=bxRgdzPdU1A
// Source: https://app.crackingthecryptic.com/sudoku/RjG3t8B9dp

// Rules encoded: standard Sudoku rows/columns, plus nine solver-deduced,
// orthogonally-connected, 9-cell regions (ChaosConstruction), each holding
// 1-9 once. Eight lines; along each line, every maximal run of cells sharing
// one region label (a "line segment") must sum to the same total, and each
// line must cross at least two regions. The built-in region-segment-sum class
// does not support solver-deduced regions, so segment boundaries -- which are
// dynamic, since the regions are solver-discovered -- are modelled as an
// explicit Or over every way a line's cells can split into same-region runs.
// Each branch pins the region-label relationship (equal/different) on every
// adjacent pair per that split and requires an equal sum (EqualSum) over the
// resulting segments; the all-one-region split is excluded since every line
// must cross >= 2 regions.
//
// Omitted: "Digits in a circle indicate the number of cells that are part of
// a line in that cell's region." The source draws nine circles but carries no
// digit text for any of them, so the values cannot be recovered and the rule
// is left out (decode-gap).

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');
const label = cell => cc.at(cell);

// Every way an n-cell line can split into contiguous same-region runs, other
// than staying in one region the whole way (every line must cross >= 2
// regions). One bit per adjacent pair: 1 = a region boundary there.
function lineSegments(cells) {
  const n = cells.length;
  const branches = [];
  for (let mask = 1; mask < (1 << (n - 1)); mask++) {
    const adjacency = [];
    const segments = [];
    let segStart = 0;
    for (let i = 0; i < n - 1; i++) {
      const a = label(cells[i]), b = label(cells[i + 1]);
      if (mask & (1 << i)) {
        adjacency.push(new AllDifferent(a, b));
        segments.push(cells.slice(segStart, i + 1));
        segStart = i + 1;
      } else {
        adjacency.push(new SameValues(2, a, b));
      }
    }
    segments.push(cells.slice(segStart));
    branches.push(new And([...adjacency, new EqualSum(...segments)]));
  }
  return new Or(branches);
}

// Drawn line paths (one white + one grey stroke per line, same cells).
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

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  ...LINES.map(lineSegments),
];
