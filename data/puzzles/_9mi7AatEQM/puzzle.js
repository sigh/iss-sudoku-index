// Title: 40 Corners
// Author: the_cogito
// Video: https://www.youtube.com/watch?v=_9mi7AatEQM
// Source: https://app.crackingthecryptic.com/sudoku/99JFmbth6r

// Normal Sudoku applies. Every row, column, and box has exactly one doubler
// cell; a digit in a doubler cell contributes twice its value to any cage sum
// it belongs to. The nine doubler digits form the set 1-9. Cage digits are
// distinct (raw digit, not doubled value): a cage may hold a doubled 2 and a
// regular 4, but not a doubled 2 and a regular 2. Every cage here totals 40.
// A grey circle cell holds an odd digit; a grey square cell holds an even one.
const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const flag = cell => flags.at(cell);
const stream = cells => cells.flatMap(cell => [cell, flag(cell)]);
const rows = graph.rows();
const columns = graph.columns();
const boxes = graph.boxes();

// The source's drawn totalled cages.
const cages = [
  [40, ['R1C3', 'R1C2', 'R1C1', 'R2C1', 'R2C2', 'R2C3', 'R3C2', 'R3C1']],
  [40, ['R3C4', 'R3C3', 'R4C3']],
  [40, ['R1C7', 'R1C8', 'R1C9', 'R2C8', 'R2C9', 'R3C9']],
  [40, ['R2C7', 'R2C6', 'R3C6', 'R4C6', 'R4C7', 'R3C7', 'R3C8', 'R4C8']],
  [40, ['R4C5', 'R4C4', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R7C5']],
  [40, ['R6C7', 'R6C6', 'R7C6', 'R7C7']],
  [40, ['R7C9', 'R7C8', 'R8C8', 'R8C7', 'R9C7', 'R9C8', 'R9C9', 'R8C9']],
  [40, ['R7C1', 'R8C1', 'R9C1', 'R8C2', 'R9C2', 'R9C3']],
  [40, ['R6C2', 'R7C2', 'R6C3', 'R7C3', 'R8C3', 'R8C4', 'R7C4', 'R6C4']],
];

// Reads digit, flag pairs. Flag 1 leaves the digit unchanged and flag 2
// doubles it; the running total is rejected as soon as it exceeds the clue.
const weightedCage = (total, cells) => {
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

// Each row's Var stores the digit at its sole doubler cell. The NFA matches
// that Var to the flagged grid digit; AllDifferent then forces the nine
// stored digits to be the set 1-9.
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
  new Given('R2C2', 4),
  new Given('R6C6', 5),
  // Grey rounded circle (R6C4): odd digit. Grey square (R4C6): even digit.
  new Given('R6C4', 1, 3, 5, 7, 9),
  new Given('R4C6', 2, 4, 6, 8),
  flags.toVar('doubler flags'),
  new Var('X', 'doubled digits by row', 9),
  flags.makeReplicate(new Given(flags.cells()[0], 1, 2)),
  ...cages.map(([, cells]) => new AllDifferent(...cells)),
  ...cages.map(([total, cells]) => weightedCage(total, cells)),
  // Exactly one doubler (flag 2) per row/column/box: nine 1-or-2 flags sum to
  // 10 only when eight are 1 and one is 2.
  ...rows.map(cells => new Sum(10, ...flag(cells))),
  ...columns.map(cells => new Sum(10, ...flag(cells))),
  ...boxes.map(cells => new Sum(10, ...flag(cells))),
  new AllDifferent('VX1', 'VX2', 'VX3', 'VX4', 'VX5', 'VX6', 'VX7', 'VX8', 'VX9'),
  ...rows.map((cells, row) =>
    new NFA(doubledDigit, 'row doubler digit', ['VX' + (row + 1), ...stream(cells)])),
];
