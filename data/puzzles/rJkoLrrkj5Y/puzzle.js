// Title: Penumbra
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=rJkoLrrkj5Y
// Source: https://sudokupad.app/a1yiqbbfh2

// A shadow sum counts a digit exactly when it is smaller than its predecessor.
const machineCache = new Map();
const shadowSumMachine = (target) => {
  if (!machineCache.has(target)) machineCache.set(target, NFA.encodeSpec({
    startState: {previous: null, sum: 0},
    transition: ({previous, sum}, value) => {
      if (previous === null) return {previous: value, sum: 0};
      const nextSum = sum + (value < previous ? value : 0);
      if (nextSum > target) return undefined;
      return {previous: value, sum: nextSum};
    },
    accept: ({sum}) => sum === target,
    maxDepth: 9,
  }, 9));
  return machineCache.get(target);
};

const indexes = Array.from({length: 9}, (_, i) => i + 1);
const rows = indexes.map((row) => indexes.map((column) => makeCellId(row, column)));
const columns = Array.from({length: 9}, (_, c) => rows.map((row) => row[c]));
const shadowSum = (target, cells) =>
  new NFA(shadowSumMachine(target), `Shadow sum ${target}`, cells);

const topClues = [[2, 2], [3, 10], [6, 3], [7, 10], [9, 9]];
const leftClues = [[2, 11], [5, 10], [8, 10]];
const rightClues = [[2, 10], [5, 10], [8, 11]];
const bottomClues = [[1, 8], [3, 10], [4, 12], [7, 10], [8, 1]];

return [
  new Shape('9x9'),
  ...topClues.map(([column, target]) => shadowSum(target, columns[column - 1])),
  ...leftClues.map(([row, target]) => shadowSum(target, rows[row - 1])),
  ...rightClues.map(([row, target]) => shadowSum(target, [...rows[row - 1]].reverse())),
  ...bottomClues.map(([column, target]) => shadowSum(target, [...columns[column - 1]].reverse())),
];
