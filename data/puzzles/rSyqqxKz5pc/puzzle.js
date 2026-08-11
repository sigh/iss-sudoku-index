// Title: Vision
// Author: KNT
// Video: https://www.youtube.com/watch?v=rSyqqxKz5pc
// Source: https://app.crackingthecryptic.com/sudoku/8JtTJL3JPQ
//
// Chaos construction: divide the grid into nine 9-cell orthogonally
// connected regions (no fixed boxes); digits 1-9 once each in every row,
// column, and region. Fifteen cells hold a circle with a drawn arrow. A
// digit N in a circle means exactly the next N cells in the arrow's
// direction (and only those N cells) share that circle's region -- i.e. the
// circle's own cell plus its next N-1 arrow-direction cells form a run of N
// cells all in one region, and the cell right after the run is excluded.
//
// Encoding notes: ChaosConstruction is the native handler for the unknown
// region partition. ChaosArrow(cell, offset, arm) relates a control cell's
// displayed value to a region run length by "internal arm length = control
// value + offset" (chaos_handler.js). Here the arm's first cell is the
// circle's own region cell, so the full run (circle + following same-region
// arm cells) has internal length N+1 when the circle reads N ("the next N
// cells ... are in the same region as that circle", N itself excluded) --
// offset 1 supplies that +1. Each arm is the ray of region-label cells from
// the circle to the grid edge along its arrow direction -- longer than the
// circle could ever need, so the run length is naturally capped by the grid
// edge where the arrow is short.
//
// Circle -> direction [dRow, dCol] is decoded from the drawn art: each
// circle is paired by proximity with the one short arrow drawn starting at
// it, giving a fixed unit step. Cross-checked against the rules' own worked
// example: R6C5=2 -> R6C5, R5C6, R4C7, i.e. up-right (-1, +1) from R6C5 --
// matches the decoded direction below.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');   // chaos-construction region-label cell per grid cell

const CIRCLES = [
  ['R1C3', 1, 1],    // down-right
  ['R1C9', 0, -1],   // left
  ['R2C5', 0, 1],    // right
  ['R3C6', 0, -1],   // left
  ['R4C9', 1, 0],    // down
  ['R5C4', 1, 0],    // down
  ['R6C1', -1, 1],   // up-right
  ['R6C5', -1, 1],   // up-right
  ['R6C8', -1, -1],  // up-left
  ['R6C9', 1, 0],    // down
  ['R7C2', 0, 1],    // right
  ['R7C6', 1, 1],    // down-right
  ['R8C2', 0, 1],    // right
  ['R9C1', -1, 0],   // up
  ['R9C9', -1, 0],   // up
];

const circleArrows = CIRCLES.map(([cell, dRow, dCol]) =>
  new ChaosArrow(cell, 1, cc.ray(cc.at(cell), dRow, dCol))
);

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  new Given('R2C2', 8),
  new Given('R2C9', 1),
  new Given('R3C3', 7),
  new Given('R4C2', 6),
  ...circleArrows,
];
