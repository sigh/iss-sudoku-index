// Title: Would you like that toasted?
// Author: Justin Vitanza
// Video: https://www.youtube.com/watch?v=jUNwo6BlFfU
// Source: https://sudokupad.app/46bismbam8

// Normal Sudoku rules apply. Each Crunchy Sandwich clue compares its number
// with the sum of digits strictly between 1 and 9 in its row or column. Each
// grey stroke is a bulbless thermometer: choose one leaf as its bulb, then
// digits increase along every edge away from it.

const sandwichSpec = (comparison, target, isLess) => NFA.encodeSpec({
  // phase 0 is before either endpoint; phase 1 is between 1 and 9; phase 2 is after both.
  startState: { phase: 0, sum: 0 },
  transition({ phase, sum }, value) {
    if (phase === 0) {
      return value === 1 || value === 9 ? { phase: 1, sum: 0 } : { phase, sum };
    }
    if (phase === 1) {
      if (value === 1 || value === 9) return { phase: 2, sum };
      // Values beyond the comparison boundary are equivalent final states.
      const cap = isLess ? target : target + 1;
      return { phase, sum: Math.min(sum + value, cap) };
    }
    return { phase, sum };
  },
  accept: ({ phase, sum }) => phase === 2 && comparison(sum, target),
}, 9);

const lessThan10 = sandwichSpec((sum, target) => sum < target, 10, true);
const greaterThan15 = sandwichSpec((sum, target) => sum > target, 15, false);
const lessThan4 = sandwichSpec((sum, target) => sum < target, 4, true);
const greaterThan2 = sandwichSpec((sum, target) => sum > target, 2, false);
// This Pair key reads each edge as child then parent, requiring child > parent.
const increasing = Pair.fnToKey((higher, lower) => higher > lower, 9);

// The edge tables transcribe the connected grey strokes. A rooted traversal
// turns each possible leaf-bulb reading into increasing parent-to-child edges.
const thermoStrokes = [
  [['R6C3', 'R5C2'], ['R5C2', 'R6C1'], ['R6C1', 'R7C2'], ['R7C2', 'R8C3'], ['R8C3', 'R9C2'], ['R9C2', 'R8C1']],
  [['R7C4', 'R8C4'], ['R8C4', 'R9C4'], ['R9C4', 'R9C5'], ['R9C5', 'R9C6'], ['R9C6', 'R8C6'], ['R8C6', 'R7C6']],
  [['R5C7', 'R5C8'], ['R5C8', 'R6C9'], ['R6C9', 'R7C8'], ['R7C8', 'R8C9'], ['R8C9', 'R9C8'], ['R9C8', 'R9C7']],
  [['R8C7', 'R7C7'], ['R7C7', 'R6C7']],
  [['R1C1', 'R2C1'], ['R2C1', 'R3C1'], ['R2C1', 'R2C2'], ['R2C2', 'R2C3'], ['R2C3', 'R3C3'], ['R2C3', 'R1C3']],
  [['R2C6', 'R1C6'], ['R1C6', 'R1C5'], ['R1C5', 'R1C4'], ['R1C4', 'R2C4'], ['R2C4', 'R3C4'], ['R3C4', 'R3C5'], ['R3C5', 'R3C6']],
  [['R3C8', 'R2C8'], ['R2C8', 'R1C8'], ['R1C8', 'R1C9'], ['R1C8', 'R1C7']],
];

const orientFromBulb = (edges, bulb) => {
  const neighbours = new Map();
  for (const [a, b] of edges) {
    neighbours.set(a, [...(neighbours.get(a) || []), b]);
    neighbours.set(b, [...(neighbours.get(b) || []), a]);
  }
  const directed = [];
  const queue = [[bulb, null]];
  while (queue.length) {
    const [cell, parent] = queue.shift();
    for (const next of neighbours.get(cell)) {
      if (next !== parent) {
        directed.push([cell, next]);
        queue.push([next, cell]);
      }
    }
  }
  return directed;
};

const bulblessThermo = (edges) => {
  const degree = new Map();
  for (const [a, b] of edges) {
    degree.set(a, (degree.get(a) || 0) + 1);
    degree.set(b, (degree.get(b) || 0) + 1);
  }
  const bulbs = [...degree].filter(([, count]) => count === 1).map(([cell]) => cell);
  return new Or(bulbs.map(bulb => new And(
    orientFromBulb(edges, bulb).map(([parent, child]) => new Pair(increasing, 'increase', child, parent)),
  )));
};

return [
  new Shape('9x9'),
  new NFA(lessThan10, 'R1 < 10', ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9']),
  new NFA(greaterThan15, 'R3 > 15', ['R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9']),
  new NFA(lessThan4, 'R7 < 4', ['R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9']),
  new NFA(greaterThan2, 'C4 > 2', ['R1C4', 'R2C4', 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4']),
  ...thermoStrokes.map(bulblessThermo),
];
