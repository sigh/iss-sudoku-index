// Title: Kropki Drops
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=gEK_cN8I0F4
// Source: https://sudokupad.app/tn30l4epty

// Normal sudoku rules apply.
// A white drop indicates how many digits in the indicated direction differ
// from it by 1. A black drop indicates how many digits in the indicated
// direction are double or half its value.
//
// Each drop is drawn inside one grid cell with a small tail pointing in one
// of the 8 compass directions. "It"/"its value" is the digit in the drop's
// own cell; "the indicated direction" is a ray of cells from the drop cell
// to the edge of the grid, exclusive of the drop cell. So the drop cell's
// own digit D must equal the count of cells along that ray whose digit
// differs from D by exactly 1 (white) or is exactly double or half of D
// (black, i.e. equals 2*D or D is even and equals 2*that digit).
//
// Directions were recovered from the small arrowhead/tail marker drawn
// offset from each drop's centre: an axis-aligned square offset diagonally
// encodes a diagonal direction; a diamond (45-degree) offset orthogonally
// encodes an orthogonal direction. All 12 drops and directions were
// confirmed to reproduce the stored solution exactly cell-by-cell.

const graph = cellGraph('9x9');

// [cell, dRow, dCol] for each white ("differ by 1") drop.
const WHITE_DROPS = [
  ['R1C2', 1, 1],   // SE
  ['R1C6', 1, 1],   // SE
  ['R3C6', 1, 0],   // S
  ['R4C2', 0, 1],   // E
  ['R6C3', 1, 1],   // SE
  ['R7C2', 1, 1],   // SE
  ['R9C1', -1, 1],  // NE
  ['R9C7', -1, 0],  // N
  ['R8C4', -1, 0],  // N
];

// [cell, dRow, dCol] for each black ("double or half") drop.
const BLACK_DROPS = [
  ['R8C1', -1, 1],  // NE
  ['R6C5', -1, 1],  // NE
  ['R6C8', -1, -1], // NW
];

// Build an NFA that reads [dropCell, ...rayCells] and requires the count of
// ray cells satisfying `matches(rayValue, dropValue)` to equal dropValue.
function dropNFA(matches) {
  const spec = {
    startState: { target: null, count: 0 },
    transition: ({ target, count }, value) => {
      if (target === null) return { target: value, count: 0 };
      const next = count + (matches(value, target) ? 1 : 0);
      // Kill the branch once it can no longer reach `count === target`, so
      // the compiled state space stays bounded by `target` alone.
      if (next > target) return undefined;
      return { target, count: next };
    },
    accept: ({ target, count }) => target !== null && count === target,
  };
  return NFA.encodeSpec(spec, /* numValues= */ 9);
}

const whiteDiffersByOne = (value, target) => Math.abs(value - target) === 1;
const blackDoubleOrHalf = (value, target) =>
  value === target * 2 || target === value * 2;

const whiteEncoded = dropNFA(whiteDiffersByOne);
const blackEncoded = dropNFA(blackDoubleOrHalf);

const dropConstraints = [];
for (const [cell, dRow, dCol] of WHITE_DROPS) {
  dropConstraints.push(new NFA(whiteEncoded, 'WD', ...graph.ray(cell, dRow, dCol)));
}
for (const [cell, dRow, dCol] of BLACK_DROPS) {
  dropConstraints.push(new NFA(blackEncoded, 'BD', ...graph.ray(cell, dRow, dCol)));
}

return [
  new Shape('9x9'),
  ...dropConstraints,
];
