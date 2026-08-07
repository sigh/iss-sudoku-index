// Title: Chaotic Equality
// Author: Knickolas
// Video: https://www.youtube.com/watch?v=bxRgdzPdU1A
// Source: https://app.crackingthecryptic.com/sudoku/RjG3t8B9dp

// Rules encoded:
//  - Divide the grid into nine regions of nine orthogonally-connected cells;
//    each row, column and region holds 1-9 once. No region borders are drawn
//    and the grid has no givens, so the regions are solver-deduced.
//  - Each line passes through at least two regions. A "line segment" is the run
//    of cells the line occupies inside one region, from where the line enters
//    that region until it next leaves it (or ends). Every segment of a line
//    sums to the same total; different lines may have different totals.
//  - A digit in a circle is the number of cells that are part of a line in that
//    digit's region.
// Nothing is omitted.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');   // region label per grid cell

// Drawn line paths, in walk order. Each line is drawn twice in the source, as a
// thick white stroke under a thinner grey stroke over the same cells; that is
// one line, not two.
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

// Drawn circles: nine plain white circles with a black border and no printed
// digit, so the circle marks the cell and the solved digit is the clue.
const CIRCLES = [
  'R1C7', 'R2C8', 'R4C9', 'R5C6', 'R6C9', 'R7C1', 'R7C5', 'R8C5', 'R9C3',
];

// A segment boundary sits wherever the region label changes along the walk, and
// those labels are exactly what the solver is deducing, so the split is not
// known when the script is written. (RegionSumLine reads the grid's static
// partition and is rejected outright under Chaos Construction.) So enumerate
// the splits: one branch per subset of the n-1 adjacent pairs along the line,
// bit i meaning "cells i and i+1 sit in different regions". A branch pins every
// adjacent pair's labels to agree with its split -- which fixes the maximal
// same-region runs -- and requires those runs to be equal-sum. A line that
// re-enters a region gets a fresh run each visit, matching "from the point that
// line starts in that region to when it next leaves it".
// Dropping mask 0, the whole line in one region, is the "at least two regions"
// clause. 15 branches for a 5-cell line, 68 across the eight lines.
function lineSegments(cells) {
  const n = cells.length;
  const branches = [];
  for (let mask = 1; mask < (1 << (n - 1)); mask++) {
    const boundaries = [];
    const segments = [];
    let start = 0;
    for (let i = 0; i < n - 1; i++) {
      const [a, b] = cc.at([cells[i], cells[i + 1]]);
      if (mask & (1 << i)) {
        boundaries.push(new AllDifferent(a, b));
        segments.push(cells.slice(start, i + 1));
        start = i + 1;
      } else {
        boundaries.push(new SameValues(2, a, b));
      }
    }
    segments.push(cells.slice(start));
    branches.push(new And([...boundaries, new EqualSum(...segments)]));
  }
  return new Or(branches);
}

// ChaosCount's control digit is how many of the listed region cells carry the
// first listed cell's region label. Listing the circle's own region cell first
// and every line cell after it, with offset 1 so the first cell is not counted
// by the digit, makes the digit the number of line cells sharing the circle's
// region. No circled cell lies on a line, so nothing is double-counted.
const lineCells = [...new Set(LINES.flat())];
const circleCounts = CIRCLES.map(
  circle => new ChaosCount(circle, 1, cc.at(circle), ...cc.at(lineCells)));

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  ...LINES.map(lineSegments),
  ...circleCounts,
];
