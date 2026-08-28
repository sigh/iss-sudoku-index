// Title: A 'Greater' Sudoku Idea
// Author: Felix Stueckmann
// Video: https://www.youtube.com/watch?v=VeW9Bjy40Qg
// Source: https://cracking-the-cryptic.web.app/sudoku/4bQDB3dpFT

// Normal sudoku (standard 3x3 boxes). Every arrow is a short stroke drawn
// entirely inside one cell, pointing in one of the 8 compass directions (not
// a bulb-and-path sum-arrow). The digit in an arrow's cell equals the count
// of cells strictly greater than it among the ray of cells running from that
// cell, in the pointed direction, to the edge of the grid; the arrow's own
// cell is excluded from its own ray. Two cells (R5C2, R6C8) carry two
// strokes (up and down) -- both counts are read from that one cell's digit.

const DIRS = {
  up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1],
  'up-left': [-1, -1], 'up-right': [-1, 1],
  'down-left': [1, -1], 'down-right': [1, 1],
};

// Arrow origin cell + pointed direction, one entry per drawn stroke.
// R5C2 and R6C8 each carry two strokes.
const ARROWS = [
  ['R7C2', 'down'], ['R7C1', 'up-right'], ['R9C2', 'up-right'],
  ['R9C3', 'up-right'], ['R5C2', 'up'], ['R5C2', 'down'],
  ['R6C3', 'down-left'], ['R3C2', 'right'], ['R1C2', 'down-right'],
  ['R1C4', 'down-right'], ['R3C6', 'up-left'], ['R6C6', 'left'],
  ['R8C5', 'up-right'], ['R9C7', 'up-right'], ['R8C8', 'left'],
  ['R8C9', 'up-left'], ['R6C9', 'down'], ['R6C8', 'up'],
  ['R6C8', 'down'], ['R4C8', 'up-left'], ['R3C9', 'down-left'],
  ['R3C7', 'up-left'], ['R1C7', 'down-left'],
];

// Ray of cells from `origin`, stepping by `dir` until leaving the 9x9 grid
// (diagonal rays stop at whichever edge, row or column, is nearer).
const rayFrom = (origin, dir) => {
  const { row, col } = parseCellId(origin);
  const [dr, dc] = DIRS[dir];
  const cells = [];
  let r = row + dr, c = col + dc;
  while (r >= 1 && r <= 9 && c >= 1 && c <= 9) {
    cells.push(makeCellId(r, c));
    r += dr; c += dc;
  }
  return cells;
};

// "This cell's digit == count of ray cells strictly greater than it".
// `target` latches the origin's own digit on the first symbol consumed
// (target === null identifies it); every following symbol is a ray cell
// compared against that latched target. No SEGMENT_BREAK is needed since
// each NFA below scans exactly one origin plus one ray.
const greaterCountSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const hit = value > target ? 1 : 0;
    // Clamp: target + 1 is a sink meaning "already too many".
    return { target, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ target, count }) => count === target,
  maxDepth: 10,
}, 9);

const arrowConstraints = ARROWS.map(
  ([origin, dir]) => new NFA(
    greaterCountSpec, 'greater-count', origin, ...rayFrom(origin, dir)));

return [
  new Shape('9x9'),
  new Given('R1C8', 7),
  new Given('R2C3', 9),
  new Given('R2C6', 5),
  new Given('R4C4', 6),
  new Given('R5C6', 8),
  new Given('R5C8', 6),
  new Given('R6C2', 8),
  new Given('R7C4', 9),
  new Given('R7C7', 3),
  new Given('R8C2', 5),
  new Given('R8C6', 7),
  ...arrowConstraints,
];
