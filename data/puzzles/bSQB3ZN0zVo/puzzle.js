// Title: Mount Elbrus
// Author: Qodec
// Video: https://www.youtube.com/watch?v=bSQB3ZN0zVo
// Source: https://sudokupad.app/mfGtTnRHt7

// Normal Sudoku applies. Cage digits are distinct, and each displayed total is
// the sum of its digits after a doubled cell contributes twice its digit. There
// is one doubler in each row, column, and box; the nine doubled digits are 1-9.
const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const flag = cell => flags.at(cell);
const stream = cells => cells.flatMap(cell => [cell, flag(cell)]);
const rows = graph.rows();
const columns = graph.columns();
const boxes = graph.boxes();

// The source's drawn totalled cages, including the single-cell 8 cage.
const cages = [
  [39, ['R1C4', 'R2C4', 'R3C4', 'R4C1', 'R4C2', 'R4C3', 'R4C4']],
  [5, ['R9C5', 'R9C6']],
  [3, ['R5C9', 'R6C9']],
  [12, ['R7C5', 'R8C5']],
  [15, ['R5C7', 'R5C8']],
  [17, ['R5C5', 'R5C6', 'R6C5']],
  [26, ['R6C6', 'R6C7', 'R6C8', 'R7C6', 'R8C6']],
  [19, ['R5C1', 'R6C1']],
  [15, ['R7C2', 'R7C3', 'R8C2', 'R8C3']],
  [6, ['R1C1', 'R1C2', 'R2C1']],
  [30, ['R2C7', 'R2C8', 'R3C7', 'R3C8']],
  [17, ['R7C7', 'R7C8', 'R8C7']],
  [8, ['R1C6']],
];

// Each NFA reads digit, flag pairs. Flag 1 leaves the digit unchanged and flag
// 2 doubles it; the running total is rejected as soon as it exceeds the clue.
const weightedCage = (total, cells) => {
  if (cells.length === 1) {
    const key = Pair.fnToKey((digit, doubler) => digit * doubler === total, 9);
    return new Pair(key, `weighted ${total} cage`, ...stream(cells));
  }
  const machine = NFA.encodeSpec({
    startState: {stage: 'digit', sum: 0},
    transition: ({stage, sum, digit}, value) => {
      if (stage === 'digit') return {stage: 'flag', sum, digit: value};
      const next = sum + digit * value;
      return next <= total ? {stage: 'digit', sum: next} : undefined;
    },
    accept: ({stage, sum}) => stage === 'digit' && sum === total,
  }, 9);
  return new NFA(machine, `weighted ${total} cage`, ...stream(cells));
};

// Each row's first Var stores the digit at its sole doubler. The following NFA
// matches that Var to the flagged grid digit; AllDifferent then makes the nine
// stored digits the set 1-9.
const doubledDigit = NFA.encodeSpec({
  startState: {stage: 'target'},
  transition: ({stage, target, digit}, value) => {
    if (stage === 'target') return {stage: 'digit', target: value};
    if (stage === 'digit') return {stage: 'flag', target, digit: value};
    return value === 1 || digit === target ? {stage: 'digit', target} : undefined;
  },
  accept: ({stage}) => stage === 'digit',
}, 9);

return [
  new Shape('9x9'),
  flags.toVar('doubler flags'),
  new Var('X', 'doubled digits by row', 9),
  flags.makeReplicate(new Given(flags.cells()[0], 1, 2)),
  ...cages.map(([, cells]) => new AllDifferent(...cells)),
  ...cages.map(([total, cells]) => weightedCage(total, cells)),
  ...rows.map(cells => new Sum(10, ...flag(cells))),
  ...columns.map(cells => new Sum(10, ...flag(cells))),
  ...boxes.map(cells => new Sum(10, ...flag(cells))),
  new AllDifferent('VX1', 'VX2', 'VX3', 'VX4', 'VX5', 'VX6', 'VX7', 'VX8', 'VX9'),
  ...rows.map((cells, row) =>
    new NFA(doubledDigit, 'row doubler digit', ['VX' + (row + 1), ...stream(cells)])),
];
