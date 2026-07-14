// Title: Six Hit Wonder
// Author: ChinStrap and Marty Sears
// Video: https://www.youtube.com/watch?v=yOLBEs7SmYc
// Source: https://sudokupad.app/hqa07qdm2h?setting-nogrid=true

// The 11x11 source canvas frames a 9x9 Sudoku. Each outside hit circle is a
// Var: its digit is both its ray's distance-match count and a counting-circle
// value across all outside circles.
const hit = new Var('HC', 'outside hit circles', 10);
const hitCells = Array.from({ length: 10 }, (_, i) => hit.cell(i + 1));

// Each tuple is the nearest grid cell and the inward (row, column) direction.
const hitClues = [
  ['R1C4', 1, 0], ['R9C4', -1, 0], ['R2C9', 0, -1],
  ['R9C9', -1, 0], ['R1C7', 1, 0], ['R1C1', 1, 0],
  ['R1C1', 0, 1], ['R7C1', 0, 1], ['R3C9', 0, -1],
  ['R9C9', 0, -1],
];
const graph = cellGraph('9x9');
const rays = hitClues.map(([cell, dRow, dCol]) => graph.ray(cell, dRow, dCol));

const hitSpec = NFA.encodeSpec({
  startState: { phase: 'circle', target: 0, count: 0, distance: 1 },
  transition: ({ phase, target, count, distance }, value) => {
    if (phase === 'circle') return { phase: 'ray', target: value, count: 0, distance: 1 };
    const next = count + (value === distance ? 1 : 0);
    return next > target ? undefined : { phase: 'ray', target, count: next, distance: distance + 1 };
  },
  accept: ({ phase, target, count }) => phase === 'ray' && count === target,
  maxDepth: 10,
}, 9);

const hitConstraints = rays.map((ray, i) =>
  new NFA(hitSpec, `hit ${i + 1}`, hitCells[i], ...ray));

return [
  new Shape('9x9'),
  hit,
  ...hitConstraints,
  new CountingCircles(...hitCells),
  new Whisper(5, 'R4C5', 'R4C4', 'R5C4', 'R6C4', 'R6C5', 'R6C6', 'R5C6'),
  new Whisper(5, 'R1C9', 'R2C8', 'R3C9'),
  new Entropic('R3C4', 'R2C4', 'R1C4'),
  new Entropic('R4C9', 'R4C8', 'R4C7'),
  new EqualSum(['R8C6', 'R7C6', 'R7C5'], ['R7C4', 'R8C4'], ['R9C4']),
  new EqualSum(['R7C2', 'R8C2', 'R9C2'], ['R9C3', 'R8C3', 'R7C3']),
  new BlackDot('R3C3', 'R3C4'),
];
