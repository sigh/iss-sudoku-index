// Title: Triskaidekophobia
// Author: Andrewsarchus
// Video: https://www.youtube.com/watch?v=HkJv-NvOQ7I
// Source: https://app.crackingthecryptic.com/sudoku/T62rN2nHnq

// Normal 9x9 Sudoku. Numbered cages are distinct and sum to their labels; the
// unnumbered cage is distinct but does not sum to 13. Orthogonal neighbours do
// not sum to 13 and are not 1 and 3 in either order.
const graph = cellGraph('9x9');
const rightStarts = graph.cells().filter(cell => graph.step(cell, 0, 1));
const downStarts = graph.cells().filter(cell => graph.step(cell, 1, 0));
const noThirteen = Pair.fnToKey((a, b) => a + b !== 13, 9);
const noOneThree = Pair.fnToKey((a, b) => !((a === 1 && b === 3) || (a === 3 && b === 1)), 9);
// This NFA's state is the running total of the three unnumbered-cage digits.
const unnumberedNotThirteen = NFA.encodeSpec({
  startState: { sum: 0 },
  transition: ({ sum }, value) => ({ sum: sum + value }),
  accept: ({ sum }) => sum !== 13,
  maxDepth: 3,
}, 9);

// Cage cells and totals transcribed from the drawn cage outlines and labels.
const cages = [
  [15, 'R1C1', 'R1C2', 'R1C3'],
  [15, 'R2C1', 'R2C2', 'R2C3'],
  [15, 'R3C1', 'R3C2', 'R3C3'],
  [15, 'R2C4', 'R3C4'],
  [15, 'R3C6', 'R4C6'],
  [7, 'R2C7', 'R2C8', 'R3C8'],
  [21, 'R4C9', 'R5C9', 'R6C9'],
  [10, 'R6C6', 'R6C7'],
  [15, 'R5C5', 'R5C6'],
  [9, 'R7C2', 'R8C2', 'R9C2'],
  [15, 'R9C3', 'R9C4'],
  [8, 'R8C7', 'R8C8', 'R8C9'],
];
const unnumberedCage = ['R1C5', 'R2C5', 'R3C5'];

return [
  new Shape('9x9'),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
  new AllDifferent(...unnumberedCage),
  new NFA(unnumberedNotThirteen, 'not-13', ...unnumberedCage),
  // The right/down templates cover every orthogonal edge exactly once.
  graph.makeReplicate(new Pair(noThirteen, '', 'R1C1', 'R1C2'), rightStarts),
  graph.makeReplicate(new Pair(noThirteen, '', 'R1C1', 'R2C1'), downStarts),
  graph.makeReplicate(new Pair(noOneThree, '', 'R1C1', 'R1C2'), rightStarts),
  graph.makeReplicate(new Pair(noOneThree, '', 'R1C1', 'R2C1'), downStarts),
];
