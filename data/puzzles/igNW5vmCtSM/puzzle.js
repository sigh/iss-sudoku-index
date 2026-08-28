// Title: Chaos Construction
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=igNW5vmCtSM
// Source: https://cracking-the-cryptic.web.app/sudoku/Tt9mr4T46n

// Standard sudoku digits 1-9 once per row/column/region, but the regions are
// not drawn as boxes: ChaosConstruction has the solver discover nine
// orthogonally-connected, all-different 9-cell regions, replacing the
// default boxes (NoBoxes).
//
// Each arrow cell holds digit X. The uninterrupted run of X cells in the
// arrow's drawn direction, starting at the arrow cell itself, is one region;
// the next cell past that run (if any) is a different region. ChaosArrow's
// offset 0 counts the control cell itself as the first of the X run cells,
// matching "beginning at the cell with the arrow". Each arm is the ray of
// grid cells from the arrow to the grid edge in its drawn direction, mapped
// to their CC region-label cells, so the solver places the region boundary
// anywhere within the reachable cells; a shorter ray to the edge naturally
// caps which digits the arrow cell can hold.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

// Arrow cell, direction (dRow, dCol) -- transcribed from the drawn arrows
// (right=(0,1), left=(0,-1), up=(-1,0), down=(1,0)).
const ARROW_DEFS = [
  ['R1C2', 0, 1], ['R1C4', 0, -1],
  ['R2C4', 0, -1], ['R2C5', 0, 1], ['R2C7', 0, 1], ['R2C8', -1, 0],
  ['R3C2', 1, 0], ['R3C4', -1, 0], ['R3C7', -1, 0], ['R3C8', 1, 0],
  ['R4C6', 0, 1],
  ['R5C1', 0, 1], ['R5C5', -1, 0],
  ['R6C1', 0, 1], ['R6C2', 0, -1], ['R6C3', 1, 0], ['R6C8', 0, 1],
  ['R7C4', -1, 0],
  ['R8C4', 0, 1], ['R8C9', 0, -1],
  ['R9C2', -1, 0], ['R9C7', -1, 0], ['R9C9', -1, 0],
];

const chaosArrows = ARROW_DEFS.map(([origin, dRow, dCol]) =>
  new ChaosArrow(origin, 0, ...cc.at(graph.ray(origin, dRow, dCol)))
);

// Givens -- transcribed from the drawn cell digits.
const GIVENS = [
  ['R1C1', 8], ['R2C3', 9], ['R3C5', 9], ['R6C4', 9], ['R8C5', 7],
];

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  ...chaosArrows,
  ...GIVENS.map(([cell, v]) => new Given(cell, v)),
];
