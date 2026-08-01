// Title: Intersections
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=RSzXdJJ3FAE
// Source: https://sudokupad.app/9g93q6jrmB

// Every row, column, and 3x3 box has either zero or exactly d copies of each
// digit d. The outlined cages contain no repeated digit.
const graph = cellGraph('9x9');
const answer = graph.makeOverlay('VA');
const unitCells = [
  ...graph.rows(),
  ...graph.columns(),
  ...graph.boxes(),
];

// Each machine scans one unit for one target digit; count d is allowed only as
// zero (absent) or d (present), with d + 1 rejected immediately.
const countMachine = (target) => NFA.encodeSpec({
  startState: 0,
  transition: (count, value) => {
    const next = count + (value === target ? 1 : 0);
    return next <= target ? next : undefined;
  },
  accept: (count) => count === 0 || count === target,
  maxDepth: 9,
}, 9);
const selfCounts = unitCells.flatMap(cells =>
  Array.from({ length: 9 }, (_, i) =>
    new NFA(countMachine(i + 1), `count ${i + 1}`, ...answer.at(cells))));

// These no-total cage cell lists are transcribed from the drawn cage outlines.
const cages = [
  ['R3C4', 'R4C4', 'R5C2', 'R5C3', 'R5C4'],
  ['R4C6', 'R4C7', 'R5C7'],
  ['R3C2', 'R4C2'],
  ['R7C4', 'R7C5'],
  ['R8C2', 'R9C2'],
  ['R2C6', 'R2C7'],
  ['R2C9', 'R3C9'],
  ['R8C8', 'R8C9'],
].map(cells => new AllDifferent(...answer.at(cells)));

// ISS requires a main grid even though the answer has repeated row/column values.
// This fixed ordinary Sudoku is inert host state; VA is the published answer grid.
const hostGivens = Array.from({ length: 9 }, (_, r) =>
  Array.from({ length: 9 }, (_, c) =>
    new Given(makeCellId(r + 1, c + 1), (r * 3 + Math.floor(r / 3) + c) % 9 + 1),
  ),
).flat();

return [
  new Shape('9x9'),
  answer.toVar('answer grid'),
  ...hostGivens,
  ...selfCounts,
  ...cages,
];
