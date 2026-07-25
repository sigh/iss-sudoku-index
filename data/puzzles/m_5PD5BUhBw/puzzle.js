// Title: Thermoregulators
// Author: SSG
// Video: https://www.youtube.com/watch?v=m_5PD5BUhBw
// Source: https://sudokupad.app/b0toeo9gzp

// Normal sudoku rules apply.
//
// Thermometers: digits along a thermometer must strictly increase starting
// at the bulb end -- one Thermo() per path below.
//
// Consecutive Count: the digit in a bulb counts the number of pairs of
// consecutive digits (differing by exactly 1) appearing anywhere on its own
// thermometer, including the bulb's pair with its neighbour. One NFA per
// thermometer scans the path bulb-to-tip: the first digit read sets the
// required target count (it is the bulb, not itself counted), then each
// later digit adds 1 to a running count when it is exactly one more than the
// previous digit -- thermometers are already forced strictly increasing, so
// "consecutive" here reduces to a difference of exactly 1. The machine
// accepts only when the final count equals the target.

// Thermometer cell paths, bulb first, transcribed from the drawn lines.
const thermoPaths = [
  ['R4C4', 'R3C3', 'R3C2', 'R2C3', 'R2C2'],
  ['R4C6', 'R3C7', 'R3C8', 'R2C7', 'R2C8'],
  ['R6C6', 'R7C7', 'R7C8', 'R8C7', 'R8C8'],
  ['R6C4', 'R7C3', 'R7C2', 'R8C3', 'R8C2'],
  ['R5C1', 'R6C2', 'R5C2', 'R4C2', 'R5C3'],
  ['R9C4', 'R9C5', 'R8C6', 'R7C6', 'R7C5'],
  ['R5C7', 'R4C8', 'R5C9'],
];

const consecutiveCountSpec = NFA.encodeSpec({
  startState: { target: null, prev: null, count: 0 },
  transition: ({ target, prev, count }, value) => {
    if (target === null) return { target: value, prev: value, count: 0 };
    const hit = (value - prev === 1) ? 1 : 0;
    // Clamp: once count exceeds target the branch can only ever reject, so
    // collapse it to one sink value instead of counting higher.
    return { target, prev: value, count: Math.min(count + hit, target + 1) };
  },
  accept: ({ target, count }) => target !== null && count === target,
  maxDepth: 5, // longest thermometer here has 5 cells
}, 9);

return [
  new Shape('9x9'),
  ...thermoPaths.map(cells => new Thermo(...cells)),
  ...thermoPaths.map(
    (cells, i) => new NFA(consecutiveCountSpec, `ConsecutiveCount${i}`, cells)),
];
