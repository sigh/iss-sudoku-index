// Title: Ascending Starters Sudoku 10
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=jvFuuaYbfqk
// Source: https://sudokupad.app/oqn3ynpkm3

// Each outside clue sums the maximal strictly ascending prefix of its ray.
const makeAscendingStarter = (total) => NFA.encodeSpec({
  startState: {sum: 0, previous: 0, stopped: false},
  transition: ({sum, previous, stopped}, value) => {
    if (stopped) return {sum, previous: 0, stopped: true};
    if (previous !== 0 && value <= previous) {
      return {sum, previous: 0, stopped: true};
    }
    const nextSum = sum + value;
    if (nextSum > total) return undefined;
    return {sum: nextSum, previous: value, stopped: false};
  },
  accept: ({sum}) => sum === total,
  maxDepth: 9,
}, 9);

const row = (r) => Array.from({length: 9}, (_, i) => makeCellId(r, i + 1));
const column = (c) => Array.from({length: 9}, (_, i) => makeCellId(i + 1, c));
const reversed = (cells) => [...cells].reverse();

const ascendingStarters = [
  new NFA(makeAscendingStarter(10), 'Ascending starter 10', ...column(1)),
  new NFA(makeAscendingStarter(26), 'Ascending starter 26', ...column(9)),
  new NFA(makeAscendingStarter(10), 'Ascending starter 10', ...row(1)),
  new NFA(makeAscendingStarter(26), 'Ascending starter 26', ...reversed(row(1))),
  new NFA(makeAscendingStarter(20), 'Ascending starter 20', ...row(4)),
  new NFA(makeAscendingStarter(20), 'Ascending starter 20', ...reversed(row(6))),
  new NFA(makeAscendingStarter(14), 'Ascending starter 14', ...row(9)),
  new NFA(makeAscendingStarter(9), 'Ascending starter 9', ...reversed(row(9))),
  new NFA(makeAscendingStarter(14), 'Ascending starter 14', ...reversed(column(1))),
  new NFA(makeAscendingStarter(9), 'Ascending starter 9', ...reversed(column(9))),
];

return [
  new Shape('9x9'),
  new Given('R3C3', 7),
  new Given('R3C4', 6),
  new Given('R4C3', 8),
  new Given('R5C5', 2),
  new Given('R6C7', 5),
  new Given('R7C6', 3),
  new Given('R7C7', 9),
  ...ascendingStarters,
];
