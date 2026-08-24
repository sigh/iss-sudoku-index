// Title: Chaos Construction (X Sums)
// Author: Jesper
// Video: https://www.youtube.com/watch?v=WXeJLzFoshY
// Source: https://app.crackingthecryptic.com/sudoku/3bJgQPpDdj

// Rules: divide the grid into nine 9-cell orthogonally-connected regions;
// rows, columns and regions hold 1-9 once each (ChaosConstruction + NoBoxes).
// Each of the 14 outside-clue lanes names a border cell whose own digit X is
// the length of the run of cells, from that side, sharing its region -- the
// (X+1)th cell lies in a different region (ChaosArrow; offset 0 because the
// border cell itself is the first of the X cells the rules describe). Six of
// the fourteen lanes also print the sum of those X digits (XSum); the other
// eight are printed "?" ("stands for any single- or double-digit number"),
// so only the region-run structure applies there -- no sum constraint.
// Every row/column side with no drawn overlay carries no outside-clue rule
// at all.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

// One entry per drawn outside-clue overlay: [border cell, ray step, sum or
// null for "?"]. Cell and sum values transcribed from the puzzle's outside
// clue markers, one row per lane, in reading direction from that side.
const OUTSIDE_CLUES = [
  ['R1C2', [1, 0], null],   // top C2
  ['R1C4', [1, 0], null],   // top C4
  ['R1C7', [1, 0], 11],     // top C7
  ['R9C2', [-1, 0], null],  // bottom C2
  ['R9C5', [-1, 0], null],  // bottom C5
  ['R9C6', [-1, 0], 28],    // bottom C6
  ['R5C1', [0, 1], 19],     // left R5
  ['R8C1', [0, 1], 24],     // left R8
  ['R9C1', [0, 1], null],   // left R9
  ['R3C9', [0, -1], null],  // right R3
  ['R4C9', [0, -1], 20],    // right R4
  ['R5C9', [0, -1], 23],    // right R5
  ['R7C9', [0, -1], null],  // right R7
  ['R8C9', [0, -1], null],  // right R8
];

const lanes = OUTSIDE_CLUES.map(([border, [dRow, dCol], sum]) => ({
  border, sum, line: graph.ray(border, dRow, dCol),
}));

// Structural part of every lane: the border cell's value gates a run of that
// many region-label cells (including the border cell) followed by a
// different-region boundary cell.
const runBoundaries = lanes.map(
  ({ border, line }) => new ChaosArrow(border, 0, ...cc.at(line)));

// Sum part, only for the six lanes with a printed value.
const runSums = lanes
  .filter(({ sum }) => sum !== null)
  .map(({ sum, line }) => XSum.fromCells(sum, line, geometry));

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  ...runBoundaries,
  ...runSums,
];
