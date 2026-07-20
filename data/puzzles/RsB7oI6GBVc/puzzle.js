// Title: Matryoshka Snova
// Author: Timotab
// Video: https://www.youtube.com/watch?v=RsB7oI6GBVc
// Source: https://sudokupad.app/7v1z5iuelo

// Each clue is one non-overlapping sandwich, in the listed order. Its two
// endpoints and its filling independently sum to the clue value.
const russianDollMachine = (targets) => NFA.encodeSpec({
  startState: { clue: 0, phase: 'before', first: 0, filling: 0 },
  transition({ clue, phase, first, filling }, value) {
    if (clue === targets.length) {
      return { clue, phase: 'before', first: 0, filling: 0 };
    }

    const target = targets[clue];
    if (phase === 'before') {
      return [
        { clue, phase, first: 0, filling: 0 },
        { clue, phase: 'filling', first: value, filling: 0 },
      ];
    }

    const next = [];
    if (filling + value <= target) {
      next.push({ clue, phase, first, filling: filling + value });
    }
    if (filling === target && first + value === target) {
      next.push({ clue: clue + 1, phase: 'before', first: 0, filling: 0 });
    }
    return next;
  },
  accept: ({ clue, phase }) => clue === targets.length && phase === 'before',
  maxDepth: 9,
}, 9);

const graph = cellGraph('9x9');
const clueLines = [
  { cells: graph.column(1), targets: [16, 6] },
  { cells: graph.column(4), targets: [3] },
  { cells: graph.column(5), targets: [15, 7] },
  { cells: graph.column(8), targets: [4, 16] },
  { cells: graph.column(9), targets: [11] },
  { cells: graph.row(1), targets: [10, 10] },
  { cells: graph.row(2), targets: [9] },
  { cells: graph.row(3), targets: [7] },
  { cells: graph.row(4), targets: [16] },
  { cells: graph.row(5), targets: [7, 12] },
];

const russianDollSums = clueLines.map(({ cells, targets }) =>
  new NFA(russianDollMachine(targets), `Russian Doll ${targets.join(', ')}`, ...cells)
);

return [
  new Shape('9x9'),
  ...russianDollSums,
];
