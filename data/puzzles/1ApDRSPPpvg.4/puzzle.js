// Title: June 28, 2023: Kroopki Doots
// Author: clover!
// Video: https://www.youtube.com/watch?v=1ApDRSPPpvg
// Source: https://tinyurl.com/4vduzpns

// Normal sudoku rules: 9x9, digits 1-9 once each per row, column, and box
// (default boxes; none drawn otherwise).
//
// 14 "doot" ovals are drawn in the grid, each centred on a 2x2 block of
// cells. An oval's drawn width/height/angle (raw payload: width 1, height
// 0.3, angle 0 or 90) fixes which way it splits its block: undrawn angle
// (0) is a wide oval lying on the horizontal border between the block's two
// rows, splitting it into a top-row pair and a bottom-row pair -- this
// matches the rules text's own worked example (r1c34 vs r2c34, doot #6
// below, drawn with no angle). angle=90 rotates the oval 90 degrees
// clockwise so it lies on the vertical border between the block's two
// columns instead, splitting it into a left-column pair and a
// right-column pair. The sums of the two pairs an oval separates must
// differ by exactly 1 (either direction). Not all possible doots are
// necessarily given, so an unmarked 2x2 block carries no constraint.

// Doot ovals, transcribed from the source's drawn oval shapes (cells in
// drawn order, plus each oval's drawn rotation angle; undrawn angle is 0).
const doots = [
  [['R3C2', 'R3C1', 'R4C2', 'R4C1'], 90],
  [['R5C3', 'R5C2', 'R4C3', 'R4C2'], 90],
  [['R5C3', 'R5C4', 'R6C3', 'R6C4'], 90],
  [['R5C6', 'R5C7', 'R4C6', 'R4C7'], 90],
  [['R6C7', 'R6C8', 'R5C7', 'R5C8'], 90],
  [['R6C8', 'R6C9', 'R7C8', 'R7C9'], 90],
  [['R1C3', 'R1C4', 'R2C3', 'R2C4'], 0],
  [['R2C4', 'R2C5', 'R3C4', 'R3C5'], 0],
  [['R3C6', 'R3C5', 'R4C6', 'R4C5'], 0],
  [['R6C5', 'R6C4', 'R7C5', 'R7C4'], 0],
  [['R7C6', 'R7C5', 'R8C6', 'R8C5'], 0],
  [['R9C6', 'R9C7', 'R8C6', 'R8C7'], 0],
  [['R8C4', 'R8C3', 'R9C4', 'R9C3'], 0],
  [['R6C1', 'R6C2', 'R7C1', 'R7C2'], 0],
];

// Split a doot's 2x2 block into its two same-row (angle 0) or same-column
// (angle 90) pairs, independent of the cells' order in the source array.
const splitDoot = (cells, angle) => {
  const key = angle === 90 ? 'col' : 'row';
  const first = parseCellId(cells[0])[key];
  const pair1 = cells.filter(c => parseCellId(c)[key] === first);
  const pair2 = cells.filter(c => parseCellId(c)[key] !== first);
  return [pair1, pair2];
};

// pair1's sum and pair2's sum must differ by exactly 1: (pair1 - pair2) is
// +1 or -1.
const dootConstraint = ([cells, angle]) => {
  const [pair1, pair2] = splitDoot(cells, angle);
  const terms = [...pair1.map(c => [c, 1]), ...pair2.map(c => [c, -1])];
  return new Or([new Sum(1, ...terms), new Sum(-1, ...terms)]);
};

const givens = {
  R1C1: 7, R1C3: 1, R1C4: 2,
  R2C5: 6,
  R3C1: 4,
  R4C1: 1, R4C5: 3, R4C6: 8,
  R5C2: 3, R5C4: 6, R5C7: 8, R5C8: 9,
  R6C1: 9, R6C4: 5,
  R7C2: 9, R7C5: 2, R7C8: 5,
  R8C3: 7, R8C5: 1, R8C7: 6,
  R9C4: 7, R9C9: 2,
};

return [
  new Shape('9x9'),
  ...Object.entries(givens).map(([cell, value]) => new Given(cell, value)),
  ...doots.map(dootConstraint),
];
