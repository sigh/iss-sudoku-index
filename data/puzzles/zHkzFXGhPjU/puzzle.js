// Title: Rotary Switches
// Author: Flora
// Video: https://www.youtube.com/watch?v=zHkzFXGhPjU
// Source: https://app.crackingthecryptic.com/sudoku/Pd3GDf6PTg

// Normal sudoku rules, standard boxes. Two variant rules, plus cages:
//
// 1. Each gray-rectangle cell holds a digit equal to its own row number,
//    column number, or box number (1-9, from the top left) -- a per-cell
//    candidate restriction, encoded as a multi-value Given.
// 2. Each green-circle cell's four orthogonal neighbours satisfy: either
//    (left, right both even AND up, down both odd) or (left, right both
//    odd AND up, down both even). The rule says nothing about the circle
//    cell's own digit, so the circle cell itself is left unconstrained.
// 3. Killer cages: distinct digits summing to the given total.

const EVEN = [2, 4, 6, 8];
const ODD = [1, 3, 5, 7, 9];

// Rule 1: gray-rectangle cells (drawn as light-gray boxes). Each cell's
// candidate set is {row, col, box} of its own position, deduplicated.
const grayCells = [
  'R1C1', 'R1C9', 'R5C9', 'R9C9', 'R9C1', 'R5C1', 'R5C5', 'R8C5',
];

function boxNumber(row, col) {
  return 3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 3) + 1;
}

const grayGivens = grayCells.map(id => {
  const { row, col } = parseCellId(id);
  const values = [...new Set([row, col, boxNumber(row, col)])];
  return new Given(id, ...values);
});

// Rule 2: green-circle cells (drawn as yellowgreen dots). All eight are
// interior cells, so all four orthogonal neighbours exist.
const greenCircleCells = [
  'R2C2', 'R2C8', 'R4C5', 'R5C4', 'R5C6', 'R6C5', 'R8C2', 'R8C8',
];

const graph = cellGraph('9x9');

function neighbours(id) {
  return {
    left: graph.step(id, 0, -1),
    right: graph.step(id, 0, 1),
    up: graph.step(id, -1, 0),
    down: graph.step(id, 1, 0),
  };
}

// Either the horizontal pair is even and the vertical pair is odd, or the
// horizontal pair is odd and the vertical pair is even.
const rotarySwitches = greenCircleCells.map(id => {
  const { left, right, up, down } = neighbours(id);
  return new Or([
    new And([
      new Given(left, ...EVEN), new Given(right, ...EVEN),
      new Given(up, ...ODD), new Given(down, ...ODD),
    ]),
    new And([
      new Given(left, ...ODD), new Given(right, ...ODD),
      new Given(up, ...EVEN), new Given(down, ...EVEN),
    ]),
  ]);
});

// Rule 3: killer cages.
const cages = [
  new Cage(25, 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Cage(16, 'R1C8', 'R1C9', 'R2C8', 'R2C9'),
  new Cage(15, 'R8C8', 'R8C9', 'R9C8', 'R9C9'),
  new Cage(14, 'R8C1', 'R8C2', 'R9C1', 'R9C2'),
  new Cage(21, 'R6C3', 'R6C4', 'R7C3', 'R7C4'),
  new Cage(13, 'R6C6', 'R7C6', 'R8C6'),
  new Cage(22, 'R2C5', 'R3C5', 'R4C5'),
];

return [
  new Shape('9x9'),
  ...grayGivens,
  ...rotarySwitches,
  ...cages,
];
