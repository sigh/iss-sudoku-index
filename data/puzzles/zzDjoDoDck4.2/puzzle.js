// Title: 3 BLTs and a Dream
// Author: Cassinii
// Video: https://www.youtube.com/watch?v=zzDjoDoDck4
// Source: https://sudokupad.app/3bo6pr2r62

// 6x6 irregular sudoku with 1/6 sandwich clues and a directional V.
const constraints = [
  new Shape('6x6', '1-6'),
  new NoBoxes(),
];

const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C3', 'R3C3'],
  ['R2C1', 'R2C2', 'R3C1', 'R4C1', 'R5C1', 'R5C2'],
  ['R5C3', 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5'],
  ['R3C2', 'R4C2', 'R4C3', 'R4C4', 'R5C4', 'R5C5'],
  ['R3C4', 'R3C5', 'R4C5', 'R4C6', 'R5C6', 'R6C6'],
  ['R1C5', 'R1C6', 'R2C4', 'R2C5', 'R2C6', 'R3C6'],
];
for (const region of regions) constraints.push(new Jigsaw('6x6', ...region));

const sandwichNfa = (target) => NFA.encodeSpec({
  startState: { seenEnd: false, done: false, sum: 0 },
  transition: (state, value) => {
    const endpoint = value === 1 || value === 6;
    if (!state.seenEnd) {
      return endpoint ? { seenEnd: true, done: false, sum: 0 } : state;
    }
    if (!state.done) {
      if (endpoint) return { seenEnd: true, done: true, sum: state.sum };
      const sum = state.sum + value;
      if (sum <= target) return { seenEnd: true, done: false, sum };
      return undefined;
    }
    return endpoint ? undefined : state;
  },
  accept: (state) => state.done && state.sum === target,
}, 6);

const graph = cellGraph('6x6');
constraints.push(
  new NFA(sandwichNfa(5), '1/6 sandwich 5', ...graph.column('R1C5')),
  new NFA(sandwichNfa(6), '1/6 sandwich 6', ...graph.row('R3C1')),
  new NFA(sandwichNfa(4), '1/6 sandwich 4', ...graph.row('R5C1')),
  new GreaterThan('R1C2', 'R1C3'),
);

return constraints;
