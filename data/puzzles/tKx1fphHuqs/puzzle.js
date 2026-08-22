// Title: This Way Please
// Author: Mr. Menace
// Video: https://www.youtube.com/watch?v=tKx1fphHuqs
// Source: https://app.crackingthecryptic.com/sudoku/9hmL774prj

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens: R2C8=4, R9C1=6.
//
// Digits along an arrow sum to the digit in that arrow's circle -- one
// `Arrow` per drawn arrow (circle cell, then the summed path cells in drawn
// order). One arrow entry in the payload carries no waypoints and renders
// nothing; it is not a clue.
//
// Additionally, the circle's digit repeats in a cell pointed at by the
// arrow's tip, one or more cells away from the tip (never the tip cell
// itself). The rule names no exact distance, so every cell along the tip's
// outward straight-line direction, from one cell past the tip to the edge
// of the grid, is a candidate: encoded as an `Or` of two-cell `SameValues`
// (circle equals candidate) over that cell run. Direction is read off each
// arrow's final drawn segment (bulb-to-tip for single-segment arrows).

function repeatCells(circle, candidates) {
  return new Or(candidates.map(cell => new SameValues(2, circle, cell)));
}

// [circle, [sum cells...], [repeat candidate cells...]], transcribed from the
// drawn arrow paths (bulb = circle, in-line bend/end cells = sum path) and
// each arrow's final-segment direction extended to the grid edge.
const ARROWS = [
  ['R2C2', ['R1C3', 'R1C4', 'R1C5', 'R2C4'], ['R3C3', 'R4C2', 'R5C1']],
  ['R1C7', ['R2C6'], ['R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C1']],
  ['R3C5', ['R4C4'], ['R5C3', 'R6C2', 'R7C1']],
  ['R5C1', ['R6C2', 'R7C3'], ['R8C4', 'R9C5']],
  ['R5C3', ['R6C4'], ['R7C5', 'R8C6', 'R9C7']],
  ['R6C5', ['R5C5', 'R5C6'], ['R5C7', 'R5C8', 'R5C9']],
  ['R7C5', ['R6C6'], ['R5C7', 'R4C8', 'R3C9']],
  ['R9C3', ['R8C4'], ['R7C5', 'R6C6', 'R5C7', 'R4C8', 'R3C9']],
  ['R8C8', ['R9C7', 'R9C6', 'R9C5', 'R8C6'], ['R7C7', 'R6C8', 'R5C9']],
  ['R5C7', ['R4C6'], ['R3C5', 'R2C4', 'R1C3']],
  ['R5C9', ['R4C8', 'R3C7'], ['R2C6', 'R1C5']],
];

const arrowConstraints = ARROWS.flatMap(([circle, sumCells, repeatCandidates]) => [
  new Arrow(circle, ...sumCells),
  repeatCells(circle, repeatCandidates),
]);

return [
  new Shape('9x9'),
  new Given('R2C8', 4),
  new Given('R9C1', 6),
  ...arrowConstraints,
];
