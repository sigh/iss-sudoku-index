// Title: Different Delights
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=jgbIR7sLy_0
// Source: https://sudokupad.app/r9d3orh23f

// Normal sudoku rules apply. Fog of war is solving UI only (see
// pipeline-gotchas: fog is not a constraint) and is not encoded.
//
// Different Difference lines (beige): no pair of adjacent digits on a beige
// line may have the same absolute difference as another pair of adjacent
// digits on that same line. Each adjacent pair on a line gets its own Var
// holding (that pair's absolute difference) + 1 -- shifted by 1 so its
// domain is the default 1-9 rather than 0-8 -- linked to its two cells by an
// Or of the two signed orderings; AllDifferent over one line's Vars then
// forbids a repeated difference on that line. A sequential state-machine
// scan of the same rule is the more direct reading but its compiled state
// count exceeds the solver's limit on this puzzle's two longest lines, so
// every line uses this Var form instead for a single consistent encoding.
//
// X markers sum to 10 (X below); Kropki dots are a 1:2 ratio (BlackDot
// below). Not all possible Xs/dots/difference lines are given, so no global
// negative constraint applies to unmarked pairs.

// Different Difference line cell paths, reassembled from several short
// drawn fragments that share colour/width: fragments sharing an endpoint
// continue one another, and a short two-cell fragment whose endpoints
// exactly match a longer fragment's two endpoints is that fragment's
// closing chord back to its own start (a loop). A repeated cell in a path
// (e.g. line 1's R2C2) is the point where a loop closes or a tail meets its
// loop -- the same drawn stroke revisits that cell.
const differentDifferenceLines = [
  ['R2C2', 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R2C2', 'R3C3', 'R4C4'],
  ['R3C2', 'R4C1', 'R4C2', 'R4C3', 'R3C2'],
  ['R5C1', 'R5C2', 'R5C3', 'R6C2', 'R5C1'],
  // A separate short line, R6C3-R7C2, touches this line's middle cell
  // (R7C2) but is its own one-pair line, which cannot violate the rule by
  // itself -- omitted below as a no-op.
  ['R6C1', 'R7C2', 'R8C2'],
  ['R9C2', 'R9C3', 'R8C3', 'R7C3', 'R7C4', 'R8C4', 'R9C4', 'R9C5'],
  ['R7C5', 'R8C5', 'R8C6', 'R7C6', 'R7C5'],
  ['R5C5', 'R4C6', 'R5C7', 'R6C6', 'R5C5', 'R5C6', 'R5C7'],
  ['R2C5', 'R1C6', 'R2C7', 'R3C6', 'R2C5', 'R2C6', 'R2C7'],
  ['R8C7', 'R8C8', 'R9C7', 'R8C7', 'R9C6', 'R9C7'],
  ['R3C8', 'R4C7', 'R4C8', 'R4C9', 'R3C8', 'R4C8'],
];

// Kropki black dots (1:2 ratio), transcribed from the `ratio` marks.
const blackDots = [
  ['R2C1', 'R2C2'],
  ['R1C2', 'R2C2'],
  ['R4C1', 'R4C2'],
  ['R4C2', 'R4C3'],
  ['R6C2', 'R7C2'],
  ['R7C3', 'R7C4'],
];

// X markers (sum to 10), transcribed from the `xv` marks (all are 'X'; no
// 'V' marks are present).
const xMarks = [
  ['R1C2', 'R1C3'],
  ['R2C1', 'R3C1'],
  ['R5C2', 'R6C2'],
  ['R7C5', 'R8C5'],
  ['R8C7', 'R9C7'],
  ['R6C4', 'R6C5'],
];

// Build one difference Var per adjacent pair, across all lines, plus the
// per-line groups of that Var's index for AllDifferent. The Var overlay is
// laid out on a grid wide enough to index every edge (a plain cellGraph
// dimension caps at 16, so a single row won't fit them all).
const edgesPerLine = differentDifferenceLines.map(
  cells => cells.slice(0, -1).map((cell, i) => [cell, cells[i + 1]]));
const totalEdges = edgesPerLine.reduce((n, edges) => n + edges.length, 0);
const diffCols = Math.min(totalEdges, 16);
const diffRows = Math.ceil(totalEdges / diffCols);
const diffGraph = cellGraph(`${diffRows}x${diffCols}`);
const diffVars = diffGraph.makeOverlay('VD').toVar('line differences');
let nextIndex = 0;
const diffLineGroups = edgesPerLine.map(edges => edges.map(([a, b]) => {
  const diffVar = diffVars.cell(
    Math.floor(nextIndex / diffCols) + 1, (nextIndex % diffCols) + 1);
  nextIndex++;
  // diffVar == |a - b| + 1: exactly one of the two signed orderings holds.
  return {
    diffVar,
    link: new Or([
      new Sum(-1, [a, 1], [b, -1], [diffVar, -1]),
      new Sum(-1, [b, 1], [a, -1], [diffVar, -1]),
    ]),
  };
}));
// The overlay grid (diffRows x diffCols) can have more cells than edges --
// pin the leftover unused cells so they don't add spurious free choices.
const unusedDiffVars = [];
for (let i = totalEdges; i < diffRows * diffCols; i++) {
  unusedDiffVars.push(diffVars.cell(Math.floor(i / diffCols) + 1, (i % diffCols) + 1));
}

return [
  new Shape('9x9'),
  diffVars,
  ...diffLineGroups.flatMap(group => group.map(({ link }) => link)),
  ...unusedDiffVars.map(cell => new Given(cell, 1)),
  ...diffLineGroups.map(
    group => new AllDifferent(...group.map(({ diffVar }) => diffVar))),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...xMarks.map(cells => new X(...cells)),
];
