// Title: Red Light, Green Light
// Author: Hanks
// Video: https://www.youtube.com/watch?v=02ePdhC9Rzw
// Source: https://sudokupad.app/vriogscu49

// Normal sudoku rules. Red lines: all digits distinct, and every 3 (not
// necessarily adjacent) digits on the line satisfy the strict triangle
// inequality. Green lines: all digits distinct, and every 3 (not necessarily
// adjacent) digits on the line fail the triangle inequality (two smaller
// digits sum to at most the largest).
//
// Encoded as one NFA per line: state collects the set of values seen so far
// (duplicates dead-end the branch, enforcing all-distinct), and accept()
// checks every 3-subset of the final set against the (anti-)triangle rule.
// Cell order along each line does not matter since only the final value set
// is examined. Fog of war is solving UI, not a final-grid rule, and is not
// encoded.

const allTriplesSatisfy = (values, holds) => {
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      for (let k = j + 1; k < values.length; k++) {
        const [x, y, z] = [values[i], values[j], values[k]].sort((p, q) => p - q);
        if (!holds(x, y, z)) return false;
      }
    }
  }
  return true;
};

// State is wrapped in an object (not a bare array) because a bare-array
// startState is treated as multiple start states, not one compound state.
// The set of values seen so far is kept sorted so that different insertion
// orders of the same set collapse onto the same compiled state (order along
// the line is irrelevant to the rule; only the final value set matters).
const lineSpec = (holds) => ({
  startState: { values: [] },
  transition: ({ values }, value) => {
    if (values.includes(value)) return; // dead: not all-distinct
    return { values: [...values, value].sort((a, b) => a - b) };
  },
  accept: ({ values }) => allTriplesSatisfy(values, holds),
});

const triangleNFA = NFA.encodeSpec(
  lineSpec((x, y, z) => x + y > z), 9);
const antiTriangleNFA = NFA.encodeSpec(
  lineSpec((x, y, z) => x + y <= z), 9);

const RED_LINES = [
  ['R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1'],
  ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R3C6', 'R3C7', 'R3C8', 'R3C9'],
  ['R7C2', 'R6C2', 'R5C2', 'R4C2'],
  ['R7C5', 'R7C6', 'R8C6'],
  ['R8C5', 'R8C6', 'R7C6'],
  ['R5C7', 'R5C8', 'R5C9'],
  ['R9C3', 'R8C3', 'R7C3'],
  ['R8C3', 'R7C3', 'R6C3'],
  ['R7C3', 'R6C3', 'R5C3'],
  ['R6C3', 'R5C3', 'R4C3'],
];

const GREEN_LINES = [
  ['R3C1', 'R2C2', 'R1C3', 'R2C3', 'R2C4'],
  ['R3C4', 'R4C4', 'R5C4', 'R6C4'],
  ['R6C5', 'R5C5', 'R4C5'],
  ['R6C6', 'R5C6', 'R4C6'],
  ['R8C8', 'R9C8', 'R9C9', 'R8C9', 'R7C9'],
  ['R6C7', 'R5C7', 'R4C7', 'R4C8', 'R4C9'],
  ['R4C8', 'R5C8', 'R6C8'],
];

return [
  new Shape('9x9'),
  ...RED_LINES.map((cells, i) => new NFA(triangleNFA, `Red${i}`, ...cells)),
  ...GREEN_LINES.map((cells, i) => new NFA(antiTriangleNFA, `Green${i}`, ...cells)),
];
