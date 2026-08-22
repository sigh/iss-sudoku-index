// Title: Superfuzzy Arrows
// Author: Christoph Seeliger
// Video: https://www.youtube.com/watch?v=bK0YhNGZUvg
// Source: https://app.crackingthecryptic.com/sudoku/q8R69ndLt4

// Normal sudoku rules apply (standard boxes, no givens).
//
// Each drawn line hides an unmarked circle in exactly one of its cells: the
// digit there equals the sum of the digits toward each remaining end of the
// line. No circle position is drawn in the payload, so the circle cell is
// solver-discovered, not fixed geometry.
//
// Encode each line as an Or over every candidate circle position. A circle
// at an interior cell has two remaining ends, so both arm sums must hold
// (And of two Arrow constraints sharing that circle cell); a circle at
// either line end has only one remaining end (a single Arrow). Arrow's
// arm-cell order does not matter since it only sums them.
function lineConstraint(cells) {
  const positions = [];
  for (let i = 0; i < cells.length; i++) {
    const circle = cells[i];
    const backArm = cells.slice(0, i);       // toward the near end
    const fwdArm = cells.slice(i + 1);       // toward the far end
    const arrows = [];
    if (backArm.length > 0) arrows.push(new Arrow(circle, ...backArm));
    if (fwdArm.length > 0) arrows.push(new Arrow(circle, ...fwdArm));
    positions.push(arrows.length === 1 ? arrows[0] : new And(arrows));
  }
  return new Or(positions);
}

// Cell paths transcribed from the drawn lines (row-major, 1-indexed); one
// extra styled entry in the source has no coordinates, draws nothing, and
// is omitted.
const LINES = [
  ['R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8'],
  ['R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8'],
  ['R6C9', 'R7C9', 'R8C9', 'R8C8'],
  ['R9C3', 'R9C4', 'R9C5', 'R9C6'],
  ['R7C2', 'R7C3', 'R7C4', 'R7C5'],
  ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6'],
  ['R1C3', 'R1C4', 'R1C5'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9'],
];

return [
  new Shape('9x9'),
  ...LINES.map(lineConstraint),
];
