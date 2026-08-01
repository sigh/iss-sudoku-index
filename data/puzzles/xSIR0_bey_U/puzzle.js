// Title: Arvada
// Author: Philipp Blume, aka glum_hippo
// Video: https://www.youtube.com/watch?v=xSIR0_bey_U
// Source: https://sudokupad.app/6GhDq9bDFL

// Normal Sudoku rules apply. The drawn X sums its two adjacent digits to 10.
// A Beachcomber circle counts all smaller visible digits on its four orthogonal
// rays; a larger digit blocks the remainder of that ray.
const cid = (row, col) => makeCellId(row, col);
const circleCoords = [
  [1, 5], [1, 6], [1, 9], [2, 1], [2, 4], [2, 6], [3, 4],
  [3, 5], [4, 5], [7, 8], [8, 3], [9, 4], [9, 5],
]; // Drawn Beachcomber circles.

const rays = (row, col) => [
  Array.from({length: row - 1}, (_, i) => cid(row - i - 1, col)),
  Array.from({length: 9 - row}, (_, i) => cid(row + i + 1, col)),
  Array.from({length: col - 1}, (_, i) => cid(row, col - i - 1)),
  Array.from({length: 9 - col}, (_, i) => cid(row, col + i + 1)),
];

// State stores the circle digit, the total smaller digits seen, and whether the
// current ray has been blocked. Segment breaks reset only the current-ray block.
const beachcomberNfa = NFA.encodeSpec({
  startState: {target: null, count: 0, blocked: false},
  transition: ({target, count, blocked}, value) => {
    if (target === null) return {target: value, count: 0, blocked: false};
    if (value === SEGMENT_BREAK) return {target, count, blocked: false};
    if (blocked) return {target, count, blocked};
    if (value > target) return {target, count, blocked: true};
    return {target, count: Math.min(count + (value < target ? 1 : 0), target + 1), blocked: false};
  },
  accept: ({target, count}) => target !== null && count === target,
  maxDepth: 37,
}, 9, {multiSegment: true});

const beachcombers = circleCoords.map(([row, col]) =>
  new NFA(beachcomberNfa, 'Beachcomber', [cid(row, col)], ...rays(row, col)));

return [
  new Shape('9x9'),
  new Given('R2C5', 5),
  new Given('R3C2', 7),
  new Given('R5C6', 8),
  new X('R3C3', 'R4C3'), // The drawn X clue.
  ...beachcombers,
];
