// Title: Cornered Colors
// Author: Leonhard Kohl-Lorting
// Video: https://www.youtube.com/watch?v=lGz8_HhoecU
// Source: https://sudokupad.app/bmh85ce33k

// Normal sudoku applies. Each cage has distinct digits and a signed total:
// shaded digits add and unshaded digits subtract. Shaded and unshaded cells
// each form one orthogonally connected area, and no 2x2 block is monochrome.

const SHADED = 1;
const UNSHADED = 2;
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

// The drawn cage cells and their printed signed totals.
const cages = [
  [14, ['R2C7', 'R2C8', 'R3C8', 'R4C8']],
  [7, ['R1C2', 'R2C1', 'R2C2']],
  [-7, ['R8C1', 'R8C2', 'R9C2']],
  [7, ['R8C8', 'R8C9', 'R9C8']],
  [16, ['R5C7', 'R6C7', 'R7C7']],
  [7, ['R4C6', 'R4C7']],
  [27, ['R5C5', 'R5C6', 'R6C5', 'R7C5', 'R8C5']],
  [7, ['R7C3', 'R7C4']],
  [7, ['R5C4', 'R6C4']],
  [5, ['R3C1', 'R3C2', 'R3C3']],
  [3, ['R3C4', 'R3C5']],
  [16, ['R4C2', 'R4C3', 'R4C4']],
  [5, ['R6C8', 'R6C9']],
  [5, ['R1C3', 'R2C3']],
  [4, ['R8C6', 'R8C7', 'R9C7']],
  [2, ['R5C3', 'R6C3']],
];

// Read each cage as digit, shade, digit, shade. The NFA's running total adds
// a digit for SHADED and subtracts it for UNSHADED.
function signedCage(total, cells) {
  const machine = NFA.encodeSpec({
    startState: { sum: 0, stage: 'digit' },
    transition: ({ sum, stage, digit }, value) => {
      if (stage === 'digit') return { sum, stage: 'shade', digit: value };
      const next = sum + (value === SHADED ? digit : -digit);
      return { sum: next, stage: 'digit' };
    },
    accept: ({ sum, stage }) => stage === 'digit' && sum === total,
    // Each cage stream has exactly two symbols per cage cell.
    maxDepth: cells.length * 2,
  }, 9);
  const stream = cells.flatMap(cell => [cell, shade.at(cell)]);
  return new NFA(machine, `signed ${total} cage`, ...stream);
}

// A 2x2 shade window is valid unless all four shade values agree.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, 9);
const blocks = graph.cells().filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-monochrome-2x2',
    ...shade.at(graph.block('R1C1', 2, 2))),
  shade.at(blocks));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shade.makeReplicate(new Given(shade.cells()[0], SHADED, UNSHADED)),
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...cages.flatMap(([total, cells]) => [
    new AllDifferent(...cells),
    signedCage(total, cells),
  ]),
];
