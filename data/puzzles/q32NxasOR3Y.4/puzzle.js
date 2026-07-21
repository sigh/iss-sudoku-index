// Title: Zodiac Recap: Minefield Maneuvers
// Author: SamuPiano?
// Video: https://www.youtube.com/watch?v=q32NxasOR3Y
// Source: https://sudokupad.app/9nfwx5e53a

// Normal 6x6 sudoku. The six circles contain different digits. Each circle's
// digit counts the even digits along all of its indicated rays to the grid edge.

const circles = [
  {cell: 'R2C1', rays: [['R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6']]},
  {cell: 'R3C3', rays: [
    ['R2C4', 'R1C5'],
    ['R4C2', 'R5C1'],
  ]},
  {cell: 'R6C3', rays: [['R5C3', 'R4C3', 'R3C3', 'R2C3', 'R1C3']]},
  {cell: 'R5C6', rays: [
    ['R4C5', 'R3C4', 'R2C3', 'R1C2'],
    ['R6C5'],
  ]},
  {cell: 'R5C5', rays: [['R4C4', 'R3C3', 'R2C2', 'R1C1']]},
  {cell: 'R1C5', rays: [
    ['R2C4', 'R3C3', 'R4C2', 'R5C1'],
    ['R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5'],
  ]},
];

// Reads the circle first, then every cell in its ray or rays. Reject as soon as
// the even-digit count exceeds the target circle value.
const evenCountMachine = NFA.encodeSpec({
  startState: {target: null, count: 0},
  transition: ({target, count}, value) => {
    if (target === null) return {target: value, count: 0};
    const next = count + (value % 2 === 0 ? 1 : 0);
    return next > target ? undefined : {target, count: next};
  },
  accept: ({target, count}) => target !== null && count === target,
}, 6);

const arrowCounts = circles.map(({cell, rays}) =>
  new NFA(evenCountMachine, 'even-count', cell, ...rays.flat()));

return [
  new Shape('6x6'),
  new AllDifferent(...circles.map(({cell}) => cell)),
  ...arrowCounts,
];
