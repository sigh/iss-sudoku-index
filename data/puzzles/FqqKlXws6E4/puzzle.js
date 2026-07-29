// Title: Project Africa
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=FqqKlXws6E4
// Source: https://app.crackingthecryptic.com/2hw7t4w2lm

// Normal sudoku rules apply.
//
// The red route is a German Whisper. On colored land, an orange cell is larger
// than each orthogonally adjacent yellow cell, and a yellow cell is larger than
// each orthogonally adjacent green cell.
//
// Read left to right, the four cages contain 352, 19, 16, and the total number
// of 1s and 2s on the route; the assignment of numbers to cages is determined
// by the solver. Every rule is encoded.

const graph = cellGraph('9x9');

// Drawn red route, interpolated through the cells in travel order.
const route = [
  'R1C5', 'R1C4', 'R2C3', 'R2C2', 'R3C1', 'R4C2', 'R4C3',
  'R4C4', 'R4C5', 'R5C6', 'R6C6', 'R6C5', 'R7C5', 'R8C5',
  'R8C6', 'R9C6',
];

// Colored land cells transcribed from the orange, yellow, and green underlays.
const orange = ['R2C4', 'R2C5', 'R3C4'];
const yellow = [
  'R1C3', 'R1C4', 'R1C5', 'R2C2', 'R2C3', 'R2C6', 'R2C7',
  'R3C1', 'R3C2', 'R3C3', 'R3C5', 'R3C6', 'R4C3', 'R4C4',
  'R4C5', 'R4C6', 'R4C8', 'R4C9', 'R5C8', 'R7C5', 'R8C5',
  'R8C6',
];
const green = [
  'R3C7', 'R3C8', 'R4C2', 'R4C7', 'R5C3', 'R5C4', 'R5C5',
  'R5C6', 'R5C7', 'R6C5', 'R6C6', 'R6C7', 'R7C6', 'R7C7',
  'R8C7', 'R9C6',
];

const colorRank = new Map([
  ...orange.map(cell => [cell, 3]),
  ...yellow.map(cell => [cell, 2]),
  ...green.map(cell => [cell, 1]),
]);

// Right/down enumeration covers every orthogonally adjacent land pair once.
// Different colors are ordered hotter first before applying the greater-than key.
const hotterPairs = [...colorRank].flatMap(([cell, rank]) =>
  [[0, 1], [1, 0]]
    .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
    .filter(other => other && colorRank.has(other) && colorRank.get(other) !== rank)
    .map(other => rank > colorRank.get(other) ? [cell, other] : [other, cell]));
const temperatureRules = hotterPairs.map(([hotter, cooler]) =>
  new GreaterThan(hotter, cooler));

// The three-cell cage reads 352. The two two-cell cages are 19 and 16 in either
// order, so both tens are 1 and the two ones are a permutation of 6 and 9.
const journeyNumbers = [
  new Given('R6C7', 3),
  new Given('R6C8', 5),
  new Given('R6C9', 2),
  new Given('R7C2', 1),
  new Given('R9C7', 1),
  new Given('R7C3', 6, 9),
  new Given('R9C8', 6, 9),
  new AllDifferent('R7C3', 'R9C8'),
];

// Reads the one-cell cage first as the target count, then counts route digits
// equal to 1 or 2. Counts beyond the target are rejected immediately.
const routeCountMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === 1 || value === 2 ? 1 : 0);
    return next <= target ? { target, count: next } : undefined;
  },
  accept: ({ target, count }) => target !== null && count === target,
}, 9);

return [
  new Shape('9x9'),
  new Whisper(5, ...route),
  ...temperatureRules,
  ...journeyNumbers,
  new NFA(routeCountMachine, 'route 1s and 2s', 'R7C9', ...route),
];
