// Title: Miracle Clones
// Author: Undar_Beyond
// Video: https://www.youtube.com/watch?v=qFLD2TFijJQ
// Source: https://app.crackingthecryptic.com/webapp/6MfbJmQ66B

// Normal sudoku rules apply (standard rows/columns/3x3 boxes; no jigsaw, no
// givens). Along thermometers, digits increase from the bulb end.
//
// Omitted: the rules also describe 8 identical (congruent, unrotated,
// unreflected), orthogonally connected 3-cell "clone" shapes, non-overlapping,
// with a knight's-move digit restriction between cells of a clone. No colour,
// shading or outline in the source payload marks which cells form these
// shapes or where they sit -- that placement is part of what the solver must
// find, not drawn geometry.

// Thermo(...cells): first cell is the bulb; values strictly increase from
// there. Paths interpolated from the drawn waypoints (grid cell centres at
// half-integers); each path's first cell matches a drawn grey circle
// underlay (the bulb).
const thermos = [
  new Thermo('R3C2', 'R3C1', 'R4C1'),
  new Thermo('R2C3', 'R1C3', 'R1C4'),
  new Thermo('R1C7', 'R1C8'),
  new Thermo('R2C6', 'R3C7', 'R4C8', 'R3C9'),
  new Thermo('R7C7', 'R6C6', 'R5C6', 'R6C5', 'R5C5'),
  new Thermo('R9C3', 'R8C4', 'R7C3', 'R6C2'),
  new Thermo('R7C1', 'R8C1', 'R9C1'),
];

return [
  new Shape('9x9'),
  ...thermos,
];
