// Title: Dual Deli
// Author: Blocksy
// Video: https://www.youtube.com/watch?v=DBOFq2sWdPI
// Source: https://sudokupad.app/f6lfolekzi

// Each outside clue may use either the 1/9 crust pair or the 4/6 crust pair.
// One bounded NFA scans the line for each alternative; their Or implements the
// choice without resolving which delimiter pair is intended for any clue.
const geometry = cellGraph('9x9');

function sandwichMachine(target, low, high) {
  return NFA.encodeSpec({
    startState: { phase: 0, first: 0, sum: 0 },
    transition: (state, value) => {
      if (state.phase === 0) {
        if (value === low || value === high) {
          return { phase: 1, first: value, sum: 0 };
        }
        return state;
      }
      if (state.phase === 1) {
        if ((state.first === low && value === high) ||
            (state.first === high && value === low)) {
          return { ...state, phase: 2 };
        }
        const sum = state.sum + value;
        if (sum > target) return undefined;
        return { ...state, sum };
      }
      return state;
    },
    accept: state => state.phase === 2 && state.sum === target,
    maxDepth: 9,
  }, 9); // Standard 9x9 Sudoku digit alphabet.
}

function dualDeli(target, cells, label) {
  return new Or([
    new NFA(sandwichMachine(target, 1, 9), `${label}: 1/9 sandwich`, cells),
    new NFA(sandwichMachine(target, 4, 6), `${label}: 4/6 sandwich`, cells),
  ]);
}

const clues = [
  [26, geometry.row(1), 'R1 left clue'],
  [28, geometry.row(1), 'R1 right clue'],
  [23, geometry.row(3), 'R3 left clue'],
  [0, geometry.row(3), 'R3 right clue'],
  [18, geometry.row(4), 'R4 left clue'],
  [24, geometry.row(5), 'R5 right clue'],
  [12, geometry.row(7), 'R7 right clue'],
  [13, geometry.row(9), 'R9 left clue'],
  [6, geometry.row(9), 'R9 right clue'],
  [0, geometry.column(1), 'C1 top clue'],
  [7, geometry.column(1), 'C1 bottom clue'],
  [27, geometry.column(2), 'C2 top clue'],
  [5, geometry.column(2), 'C2 bottom clue'],
  [2, geometry.column(5), 'C5 top clue'],
  [7, geometry.column(5), 'C5 bottom clue'],
  [24, geometry.column(6), 'C6 top clue'],
  [13, geometry.column(6), 'C6 bottom clue'],
];

function minMax(cell) {
  const neighbours = geometry.neighbours(cell);
  return new Or([
    new And(neighbours.map(neighbour =>
      new GreaterThan(neighbour, cell))),
    new And(neighbours.map(neighbour =>
      new GreaterThan(cell, neighbour))),
  ]);
}

return [
  new Shape('9x9'),
  ...clues.map(([target, cells, label]) => dualDeli(target, cells, label)),
  ...['R1C4', 'R3C1', 'R3C9', 'R9C2'].map(minMax),
];
