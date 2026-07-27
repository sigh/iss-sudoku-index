// Title: Double Counting
// Author: Timotab
// Video: https://www.youtube.com/watch?v=LysspXinpwY
// Source: https://sudokupad.app/v1l5ri9ew3

// Normal sudoku (default row/column/box all-different) plus the 13 givens.
//
// Circle rule (per circle, local): a circle's neighbourhood is itself plus
// its up-to-8 king-move (edge/corner) neighbours. The circled digit equals
// the count of neighbourhood cells (including itself) sharing its own
// parity. Encoded as one NFA per circle over [circle, ...kingNeighbours]:
// the first symbol fixes the target digit and seeds count=1 (a cell always
// shares its own parity); each later symbol adds 1 to count when it shares
// the target's parity; accept iff the final count equals the target digit.
//
// Counting-circles rule (global): the digit in each circle also equals how
// many of the 15 circles hold that same digit. CountingCircles expresses
// exactly this ("the value in a circle counts the number of circles with
// the same value") over the full set of circles -- one set, since the
// puzzle draws only one kind of circle mark.

const graph = cellGraph('9x9');

const givens = {
  'R1C3': 4, 'R1C8': 2,
  'R2C4': 1, 'R2C7': 8,
  'R3C8': 4,
  'R5C3': 6, 'R5C8': 7,
  'R6C4': 9, 'R6C5': 7,
  'R7C6': 7,
  'R8C4': 6,
  'R9C1': 6, 'R9C5': 3,
};

// Circle underlay centers (drawn white/black circle marks); none coincide
// with a given cell.
const circles = [
  'R2C5', 'R8C5', 'R2C8', 'R8C2', 'R6C3', 'R3C2', 'R7C7', 'R4C9', 'R6C9',
  'R1C1', 'R2C9', 'R4C4', 'R3C3', 'R6C1', 'R9C3',
];

const parityNFASpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    // The circle cell itself sets the target digit and counts as its own
    // first same-parity match.
    if (target === null) return { target: value, count: 1 };
    const sameParity = (value % 2) === (target % 2);
    // Clamp at target+1: a "too many" sink that can never match again.
    return {
      target,
      count: Math.min(count + (sameParity ? 1 : 0), target + 1),
    };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, 9);

const parityConstraints = circles.map(
  c => new NFA(parityNFASpec, `parity-${c}`, c, ...graph.kingNeighbours(c)));

return [
  new Shape('9x9'),
  ...Object.entries(givens).map(([cell, v]) => new Given(cell, v)),
  ...parityConstraints,
  new CountingCircles(...circles),
];
