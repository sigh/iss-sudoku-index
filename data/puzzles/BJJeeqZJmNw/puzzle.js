// Title: Clashing Chameleons
// Author: the_cogito
// Video: https://www.youtube.com/watch?v=BJJeeqZJmNw
// Source: https://sudokupad.app/d21nrto778

// Normal sudoku rules apply; the puzzle's 9 regions are the default 3x3 boxes.
//
// Parity-boundary rule: the boundary between two orthogonally adjacent cells
// is "shaded" iff their two digits sum to an even number (share parity).
// Arrow rule: a digit in a cell carrying one or more arrows equals the total
// number of shaded boundaries counted along the ray from that cell to the
// grid edge in each arrow's direction, summed over all of that cell's
// arrows. Both rules are encoded below via ARROW_CLUES and arrowSpec.
//
// Omitted: "shaded boundaries must divide the grid into exactly 2 regions"
// (with extra non-dividing shaded boundaries allowed). The shading itself is
// fully determined by digit parity, so this is a global connected-component
// *count* over a derived cut of the grid graph -- component counts over an
// unknown/derived partition are not representable in this solver.

// Arrow cell -> compass directions, hand-read from the drawn arrowhead
// glyphs (2-4 per cell, clustered by location). Each glyph is a short
// shaft+head polyline; the tip is its waypoint farthest from the cell's
// centre, and that tip's dominant axis/sign gives the direction. No
// direction ever points off the grid, which cross-checks the reading (an
// off-grid arrow would count zero boundaries and have no reason to be
// drawn).
const ARROW_CLUES = {
  R1C4: ['E', 'S', 'W'],
  R1C9: ['S', 'W'],
  R2C6: ['E', 'N', 'S', 'W'],
  R3C4: ['E', 'N', 'S', 'W'],
  R3C6: ['E', 'N', 'S', 'W'],
  R4C1: ['E', 'N', 'S'],
  R4C3: ['E', 'N', 'S', 'W'],
  R4C4: ['E', 'N', 'S', 'W'],
  R5C5: ['N', 'S'],
  R5C7: ['E', 'N', 'S'],
  R6C2: ['E', 'N', 'S', 'W'],
  R6C3: ['E', 'N', 'S', 'W'],
  R7C5: ['E', 'S', 'W'],
  R9C1: ['E', 'N'],
};
const STEP = { N: [-1, 0], S: [1, 0], E: [0, 1], W: [0, -1] };

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// The ray of cells from `cell` (exclusive) out to the grid edge in `dir`.
const rayCells = (cell, dir) => {
  const [dRow, dCol] = STEP[dir];
  return graph.ray(cell, dRow, dCol).slice(1);
};

// Sums shaded (same-parity) boundaries along however many rays are passed as
// segments, and checks the total against the origin's own digit. The origin
// is segment 0 (sets `target` and the initial parity reference); each ray is
// its own following segment. `multiSegment` inserts SEGMENT_BREAK between
// segments, and on a break we reset the parity reference back to the origin
// digit -- every ray's first boundary is against the origin cell, never
// against the previous ray's far end.
const arrowSpec = NFA.encodeSpec({
  startState: { target: null, prevParity: null, count: 0 },
  transition: ({ target, prevParity, count }, value) => {
    if (target === null) {
      return { target: value, prevParity: value % 2, count: 0 };
    }
    if (value === SEGMENT_BREAK) {
      return { target, prevParity: target % 2, count };
    }
    const match = (value % 2 === prevParity) ? 1 : 0;
    // Clamp at target + 1: once the count overshoots it can only stay wrong,
    // so pin it at one dead sink instead of climbing with the ray length.
    return { target, prevParity: value % 2, count: Math.min(count + match, target + 1) };
  },
  accept: ({ target, count }) => target !== null && count === target,
  maxDepth: 20,
}, geometry.numValues, { multiSegment: true });

const arrowRules = Object.entries(ARROW_CLUES).map(([cell, dirs]) =>
  new NFA(arrowSpec, `arrow-${cell}`, [cell], ...dirs.map(dir => rayCells(cell, dir))));

return [
  new Shape('9x9'),
  ...arrowRules,
];
