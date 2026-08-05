// Title: Bring Your Own Thermos
// Author: Wolff
// Video: https://www.youtube.com/watch?v=3nWuATfz1rU
// Source: https://app.crackingthecryptic.com/sudoku/BLHT4RmMFF

// Normal Sudoku and givens. Each cell's VT label records either unused (5) or
// the marked bulb (1-4) of the thermometer that uses it; values 5-9 mean unused.
// The four rules below
// encode the stated per-bulb cell counts and the rule that a non-bulb cell is
// not shared. The omitted path and ascending-digit requirements are noted.
const graph = cellGraph('9x9');
const thermoCells = graph.makeOverlay('VT');
const labels = thermoCells.cells();
const counts = [4, 10, 27, 5];

const countNfa = (label, total) => NFA.encodeSpec({
  startState: 0,
  transition: (seen, value) => {
    const next = seen + (value === label ? 1 : 0);
    return next <= total ? next : undefined;
  },
  accept: seen => seen === total,
  maxDepth: 81,
}, 9);

const countConstraints = counts.map((total, index) =>
  new NFA(countNfa(index + 1, total), `bulb ${index + 1} count`, labels));

return [
  new Shape('9x9'),
  new Given('R1C5', 7),
  new Given('R5C3', 8),
  new Given('R5C8', 6),
  new Given('R8C6', 4),
  thermoCells.toVar('thermometer bulbs'),
  // The four text corner marks, in the source's R3C2, R2C7, R5C5, R9C9 order.
  new Given('VT20', 1), new Given('VT15', 2),
  new Given('VT40', 3), new Given('VT80', 4),
  ...countConstraints,
];
