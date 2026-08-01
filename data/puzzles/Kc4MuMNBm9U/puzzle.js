// Title: Pseudoscience
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=Kc4MuMNBm9U
// Source: https://sudokupad.app/0ham0u0jtt

// Normal Sudoku and the pseudo-cell placement rules are encoded. The coloured
// line rules are omitted: their values replace a pseudo cell's digit with its
// row times column, which can be 81 and therefore cannot be held in this 1-9
// grid or its Var overlay without a per-line finite-state construction.
const graph = cellGraph('9x9');
const pseudo = graph.makeOverlay('VP');
const flag = cell => pseudo.at(cell);
const cells = graph.cells();
const interleaved = cells.flatMap(cell => [cell, flag(cell)]);

// A flag of 2 marks a pseudo cell; 1 marks an ordinary cell.
const pseudoFlags = [
  pseudo.toVar('pseudo-cell flags'),
  pseudo.makeReplicate(new Given(pseudo.cells()[0], 1, 2)),
  ...graph.rows().map(row => new ContainExact('2', ...pseudo.at(row))),
  ...graph.columns().map(column => new ContainExact('2', ...pseudo.at(column))),
  ...graph.boxes().map(box => new ContainExact('2', ...pseudo.at(box))),
];

// Scanning digit/flag pairs counts one selected occurrence of each Sudoku digit.
function pseudoDigitMachine(target) {
  return NFA.encodeSpec({
    startState: { pending: null, count: 0 },
    transition: ({ pending, count }, value) => {
      if (pending === null) return { pending: value, count };
      const nextCount = count + (pending === target && value === 2 ? 1 : 0);
      return nextCount <= 1 ? { pending: null, count: nextCount } : undefined;
    },
    accept: ({ pending, count }) => pending === null && count === 1,
    maxDepth: 162,
  }, 9);
}

const pseudoDigits = Array.from({ length: 9 }, (_, index) =>
  new NFA(pseudoDigitMachine(index + 1), `pseudo digit ${index + 1}`, interleaved)
);

return [
  new Shape('9x9'),
  ...pseudoFlags,
  ...pseudoDigits,
];
