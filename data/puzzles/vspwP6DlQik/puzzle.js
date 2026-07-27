// Title: Hit, Reveal, Solve
// Author: Nurator
// Video: https://www.youtube.com/watch?v=vspwP6DlQik
// Source: https://sudokupad.app/99c09jh573

// Normal Sudoku Rules: default Shape('9x9') below (rows, columns, boxes).
//
// Dynamic Fog and the single-cell "FOGLIGHT" marker at R3C7 are solving UI
// (progressive fog reveal), not encoded.
//
// Hitpoint Arrows: an arrow-cell's own digit equals the sum, over every
// drawn arrow direction on that cell, of the digits found along that ray
// whose value equals its own distance (1 = the adjacent cell) from the
// arrow cell.

// Arrow cells and their drawn directions (each a short in-cell arrowhead
// glyph pointing toward the grid edge).
const HITPOINT_ARROWS = [
  { cell: [1, 1], dirs: ['down'] },
  { cell: [1, 5], dirs: ['down'] },
  { cell: [1, 9], dirs: ['down'] },
  { cell: [2, 4], dirs: ['right'] },
  { cell: [2, 6], dirs: ['left'] },
  { cell: [3, 7], dirs: ['up', 'right'] },
  { cell: [4, 6], dirs: ['up', 'right', 'down', 'left'] },
  { cell: [5, 7], dirs: ['up', 'right'] },
  { cell: [6, 2], dirs: ['right'] },
  { cell: [6, 9], dirs: ['left'] },
  { cell: [7, 5], dirs: ['left'] },
  { cell: [7, 6], dirs: ['left'] },
];

const DIR_DELTA = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };

// Cells from the origin (exclusive) to the grid edge in one direction,
// nearest first -- position i (1-based) in the returned array is the
// "distance" the rule refers to.
function ray([row, col], dir) {
  const [dr, dc] = DIR_DELTA[dir];
  const cells = [];
  for (let r = row + dr, c = col + dc; r >= 1 && r <= 9 && c >= 1 && c <= 9; r += dr, c += dc) {
    cells.push(makeCellId(r, c));
  }
  return cells;
}

// One state machine shared by every Hitpoint Arrow cell. Segment 0 is the
// origin cell: its value becomes `target`. Each following segment is one
// ray, in nearest-to-farthest order; SEGMENT_BREAK resets `pos` (distance)
// to 0 so the next segment's first cell is again distance 1. A ray cell
// adds its own value to `sum` exactly when that value equals its distance.
// Accept iff the total across every ray equals `target`.
const HITPOINT_SPEC = NFA.encodeSpec({
  startState: { target: null, pos: 0, sum: 0 },
  transition: ({ target, pos, sum }, value) => {
    if (target === null) return { target: value, pos: 0, sum: 0 };
    if (value === SEGMENT_BREAK) return { target, pos: 0, sum };
    const dist = pos + 1;
    const hit = (value === dist) ? value : 0;
    // Clamp at target + 1: a sink meaning "already too many" -- target
    // (a grid digit) never exceeds 9, so this bounds the state space.
    return { target, pos: dist, sum: Math.min(sum + hit, target + 1) };
  },
  accept: ({ target, sum }) => sum === target,
  // Largest instance (R4C6): 1 origin + 16 ray cells + 4 segment breaks.
  maxDepth: 30,
}, 9, { multiSegment: true });

const hitpointArrows = HITPOINT_ARROWS.map(({ cell, dirs }) => new NFA(
  HITPOINT_SPEC, 'HitpointArrow',
  [makeCellId(...cell)], ...dirs.map(dir => ray(cell, dir))));

return [
  new Shape('9x9'),
  ...hitpointArrows,
];
