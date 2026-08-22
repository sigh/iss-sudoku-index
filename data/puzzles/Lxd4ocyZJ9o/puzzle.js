// Title: Archer Towers
// Author: Angelo
// Video: https://www.youtube.com/watch?v=Lxd4ocyZJ9o
// Source: https://app.crackingthecryptic.com/sudoku/Hrbb6dRLqp

// Rules encoded:
// - Normal sudoku (default 9x9 rows/columns/boxes -- the payload's `regions`
//   are the plain 3x3 tiling, so no explicit region constraint is needed).
// - Arrows: an arm's digits sum to its bulb's digit.
// - Watchtowers: a cell of digit X is a watchtower iff it sees exactly X
//   cells (itself plus every cell in its row and column reachable before the
//   first strictly-larger digit, which blocks it and everything past it) --
//   this is the structural definition the rules state for "watchtower", not
//   a separate labelled property, so it is checked directly against each
//   marked cell's own digit rather than through an extra Var:
//   - purple circles (given watchtowers) must see exactly X;
//   - purple squares (given non-watchtowers) must see some other count.
//   Every other cell's watchtower status is left open by "not all
//   watchtowers are given" and is not constrained elsewhere, so it is not
//   modelled.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// --- Arrows (bulb first, then arm cells; provenance: the drawn arrow paths,
// each bulb confirmed by a small grey circle drawn under it). ---
const ARROWS = [
  ['R1C4', 'R2C3'],
  ['R1C9', 'R1C8', 'R2C8', 'R2C9'],
  ['R6C9', 'R7C8'],
  ['R5C5', 'R4C5', 'R3C5', 'R2C5'],
  ['R5C5', 'R5C6', 'R5C7', 'R5C8'],
  ['R5C4', 'R6C3', 'R7C3'],
  ['R6C5', 'R7C4', 'R7C3'],
  ['R8C2', 'R7C2', 'R6C2', 'R5C2'],
  ['R8C2', 'R8C3', 'R8C4', 'R8C5'],
];
const arrows = ARROWS.map(cells => new Arrow(...cells));

// Purple-circle cells: confirmed watchtowers (the small purple circles --
// including one drawn as an underlay beneath an arrow bulb -- as opposed to
// the purple squares below; circle vs square is the drawn distinction the
// rules key off).
const WATCHTOWERS = [
  'R2C7', 'R3C8', 'R1C9', 'R5C5', 'R6C4', 'R2C1', 'R7C3',
];
// Purple-square cells: confirmed non-watchtowers.
const NON_WATCHTOWERS = [
  'R4C6', 'R9C8', 'R2C8',
];

// A watchtower-count machine reads the cell's own digit (the target) as one
// segment, then each of its 4 rays (nearest cell first) as its own segment so
// SEGMENT_BREAK resets the per-ray "already blocked by a bigger digit"
// state. `count` starts at 1 for the cell itself and is clamped at
// target+1 (a sink meaning "already too many") to bound the state space.
// `expectMatch` selects whether the machine accepts count===target (a real
// watchtower) or count!==target (a confirmed non-watchtower).
const makeVisibilityMachine = expectMatch => NFA.encodeSpec({
  startState: { target: null, count: 0, blocked: false },
  transition: ({ target, count, blocked }, value) => {
    if (value === SEGMENT_BREAK) return { target, count, blocked: false };
    if (target === null) return { target: value, count: 1, blocked: false };
    if (blocked || value > target) return { target, count, blocked: true };
    return { target, count: Math.min(count + 1, target + 1), blocked: false };
  },
  accept: ({ target, count }) =>
    target !== null && (expectMatch ? count === target : count !== target),
  // 1 (self) + up to 8 row cells + up to 8 column cells + 4 segment breaks
  // (origin, left, right, up) between the 5 segments.
  maxDepth: 21,
}, geometry.numValues, { multiSegment: true });
const watchtowerMachine = makeVisibilityMachine(true);
const nonWatchtowerMachine = makeVisibilityMachine(false);

const raysFrom = cell => ({
  left: graph.ray(cell, 0, -1).slice(1),
  right: graph.ray(cell, 0, 1).slice(1),
  up: graph.ray(cell, -1, 0).slice(1),
  down: graph.ray(cell, 1, 0).slice(1),
});

const watchtowerConstraints = WATCHTOWERS.map(cell => {
  const { left, right, up, down } = raysFrom(cell);
  return new NFA(watchtowerMachine, 'watchtower', [cell], left, right, up, down);
});
const nonWatchtowerConstraints = NON_WATCHTOWERS.map(cell => {
  const { left, right, up, down } = raysFrom(cell);
  return new NFA(
    nonWatchtowerMachine, 'not-watchtower', [cell], left, right, up, down);
});

return [
  new Shape('9x9'),
  ...arrows,
  ...watchtowerConstraints,
  ...nonWatchtowerConstraints,
];
