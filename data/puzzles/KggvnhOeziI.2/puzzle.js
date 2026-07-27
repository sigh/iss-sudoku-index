// Title: Differences Count - part 2
// Author: Sujoyku and Marty Sears
// Video: https://www.youtube.com/watch?v=KggvnhOeziI
// Source: https://sudokupad.app/h3s4tsknyl

// Normal 6x6 sudoku (rows/cols/2x3 boxes all-different) is the solver default.
// Black dot: digits are in a 1:2 ratio -- BlackDot(a,b) requires a=2b or b=2a.
// Coloured lines: for every adjacent pair on a line with |difference| d, the
// count of adjacent pairs *on that same line* with |difference| = d must equal
// d exactly. Implemented as one small NFA per (line, target difference d in
// 0..5), each checking that the running count of pairs with |difference| = d
// ends at 0 or d. d = 0 forbids any adjacent equal pair on the line (0 pairs
// of difference 0 is the only self-consistent count). Every possible target is
// checked, so a line with no pair of a given difference is unconstrained for
// it. Colour only distinguishes one line from another; it carries no separate
// rule.

const LINES = {
  // Drawn plum, top-left.
  lineA: ['R1C1', 'R1C2', 'R2C3'],
  // Drawn plum, bottom-right.
  lineB: ['R6C6', 'R5C6', 'R4C5', 'R3C5', 'R4C4'],
  // Drawn sky blue.
  lineC: ['R3C6', 'R2C6', 'R2C5', 'R2C4', 'R3C3'],
  // Drawn pale green.
  lineD: ['R3C2', 'R4C3', 'R5C4', 'R5C5', 'R4C6'],
  // Drawn burlywood/brown.
  lineE: ['R5C2', 'R4C2', 'R3C1'],
};

// One machine per target difference d: track the running count of adjacent
// pairs so far with |diff| = d, clamped at d+1 (a reject sink once the count
// can only fail), then accept only if the final count is 0 or exactly d.
const diffCountNFA = (target) => NFA.encodeSpec({
  startState: { prev: null, count: 0 },
  transition: ({ prev, count }, value) => {
    if (prev === null) return { prev: value, count };
    const hit = Math.abs(value - prev) === target ? 1 : 0;
    return { prev: value, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ count }) => count === 0 || count === target,
}, 6);

const differenceCountLines = Object.entries(LINES).flatMap(([name, cells]) =>
  // Digits range 1-6, so the maximum possible adjacent difference is 5.
  Array.from({ length: 6 }, (_, target) =>
    new NFA(diffCountNFA(target), `${name}-d${target}`, ...cells)));

return [
  new Shape('6x6'),
  new BlackDot('R2C3', 'R2C4'),
  ...differenceCountLines,
];
