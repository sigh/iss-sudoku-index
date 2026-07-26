// Title: What an Odd Sight
// Author: damo_89
// Video: https://www.youtube.com/watch?v=UrkZI_uiuYE
// Source: https://sudokupad.app/7oe1c7nwpc

// Rules encoded:
// - Normal sudoku (default row/column/box AllDifferent).
// - Given: R6C4 = 1.
// - Circle cells hold an odd digit; square cells hold an even digit.
// - A circle's digit counts the odd digits visible from it along each of the
//   four orthogonal directions to the grid edge, including its own digit; an
//   even digit blocks everything further out on that direction (and is
//   itself not counted). A square's digit does the same for even digits,
//   blocked by odd digits.

const graph = cellGraph('9x9');

// Circle markers (drawn as rounded glyphs) -- odd-count clues.
const CIRCLES = [
  'R6C6', 'R7C4', 'R4C5', 'R6C7', 'R2C5', 'R4C1', 'R7C1', 'R1C9', 'R3C2',
];
// Square markers (drawn as non-rounded glyphs) -- even-count clues.
const SQUARES = [
  'R6C5', 'R5C5', 'R5C6', 'R4C9', 'R6C2', 'R7C9',
];

// Self-referential counting NFA, one per parity. Segment 0 is the marker
// cell itself: its value sets `target` and, since the marker is later
// restricted to the counted parity by a Given, always seeds count = 1.
// Each further segment is one ray to the grid edge (nearest cell first);
// `blocked` resets to false at each SEGMENT_BREAK so a block on one ray
// doesn't suppress the others. Once blocked, a ray's remaining cells leave
// count unchanged (unseen); an opposite-parity cell blocks without itself
// being counted. `count` is clamped at target + 1 once a branch can only
// fail, per the bounded-counting NFA pattern.
const makeSightSpec = (isCounted) => NFA.encodeSpec({
  startState: { target: null, count: 0, blocked: false },
  transition({ target, count, blocked }, value) {
    if (value === SEGMENT_BREAK) return { target, count, blocked: false };
    if (target === null) {
      return { target: value, count: isCounted(value) ? 1 : 0, blocked: false };
    }
    if (blocked) return { target, count, blocked: true };
    if (isCounted(value)) {
      return { target, count: Math.min(count + 1, target + 1), blocked: false };
    }
    return { target, count, blocked: true };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, 9, { multiSegment: true });

const oddSightSpec = makeSightSpec(v => v % 2 === 1);
const evenSightSpec = makeSightSpec(v => v % 2 === 0);

// The four orthogonal rays from a cell to the grid edge, origin excluded,
// dropping any ray that falls off the grid immediately (a marker on an
// edge/corner).
const raysFrom = (cell) => [[-1, 0], [1, 0], [0, -1], [0, 1]]
  .map(([dr, dc]) => graph.ray(cell, dr, dc).slice(1))
  .filter(ray => ray.length > 0);

const circleGivens = CIRCLES.map(cell => new Given(cell, 1, 3, 5, 7, 9));
const squareGivens = SQUARES.map(cell => new Given(cell, 2, 4, 6, 8));

const oddSights = CIRCLES.map(cell =>
  new NFA(oddSightSpec, 'OddSight', [cell], ...raysFrom(cell)));
const evenSights = SQUARES.map(cell =>
  new NFA(evenSightSpec, 'EvenSight', [cell], ...raysFrom(cell)));

return [
  new Shape('9x9'),
  new Given('R6C4', 1),

  ...circleGivens,
  ...squareGivens,
  ...oddSights,
  ...evenSights,
];
