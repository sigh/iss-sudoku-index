// Title: By Gum
// Author: Christoph Seeliger
// Video: https://www.youtube.com/watch?v=V3up9tMESq4
// Source: https://app.crackingthecryptic.com/sudoku/4bPt8LRpRb

// Normal sudoku rules apply.
// Each of the 19 outside-clue lanes below is a row or column read from one
// named side. The clue is the sum of the first X digits read from that side,
// where X is the first digit read (so it counts itself among the X summed
// digits) -- an X-Sum. Unlike a plain X-Sum, the target total isn't given
// directly: every digit of it has been replaced with "E" if that digit is
// even (0 counts as even), and a multi-digit total never starts with "0".
// Lanes/patterns are transcribed from the drawn overlays; row/column numbers
// are 1-indexed. Not every row/column end carries a clue.

// One NFA per pattern ("E" = single even digit, "EE" = two even digits, the
// first necessarily nonzero since a real total >= 10 already has a nonzero
// tens digit). It mirrors X-Sum's own running total: `x` latches to the
// first digit read, `remaining` counts cells still owed to the sum, and
// `sum` stops growing once `remaining` reaches 0 -- the total is then fixed
// for the rest of the lane. Accept checks only the final sum's digit parity.
const laneSpec = (pattern) => NFA.encodeSpec({
  startState: { x: null, remaining: 0, sum: 0 },
  transition: ({ x, remaining, sum }, value) => {
    if (x === null) return { x: value, remaining: value - 1, sum: value };
    if (remaining > 0) return { x, remaining: remaining - 1, sum: sum + value };
    return { x, remaining, sum };
  },
  accept: ({ sum }) => pattern === 'E'
    ? (sum >= 1 && sum <= 9 && sum % 2 === 0)
    : (sum >= 10 && sum <= 99 &&
      Math.floor(sum / 10) % 2 === 0 && sum % 10 % 2 === 0),
  maxDepth: 9,
}, 9);

const eSpec = laneSpec('E');
const eeSpec = laneSpec('EE');

const graph = cellGraph('9x9');

// [side, row-or-column index, pattern] transcribed from the drawn overlays.
const lanes = [
  ['top', 2, 'EE'], ['top', 3, 'EE'], ['top', 5, 'EE'], ['top', 7, 'EE'],
  ['top', 8, 'E'],
  ['bottom', 2, 'E'], ['bottom', 4, 'EE'], ['bottom', 7, 'EE'],
  ['bottom', 8, 'EE'],
  ['left', 2, 'EE'], ['left', 3, 'E'], ['left', 4, 'EE'], ['left', 8, 'EE'],
  ['left', 9, 'E'],
  ['right', 2, 'E'], ['right', 3, 'EE'], ['right', 5, 'EE'], ['right', 6, 'EE'],
  ['right', 8, 'E'],
];

// Order each lane's cells starting from its clue side.
const laneCells = ([side, n]) => {
  switch (side) {
    case 'top': return graph.column(n);
    case 'bottom': return graph.column(n).slice().reverse();
    case 'left': return graph.row(n);
    case 'right': return graph.row(n).slice().reverse();
  }
};

const laneConstraints = lanes.map(([side, n, pattern]) =>
  new NFA(pattern === 'E' ? eSpec : eeSpec, `${side}${n}`, laneCells([side, n])));

return [
  new Shape('9x9'),
  ...laneConstraints,
];
