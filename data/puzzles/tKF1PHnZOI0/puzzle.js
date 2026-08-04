// Title: Vaulted Killers
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=tKF1PHnZOI0
// Source: https://app.crackingthecryptic.com/sudoku/4rmtQjDBFM

// Normal sudoku rules apply (rows, columns and the default 3x3 boxes).
// Digits in a cage may not repeat, and must sum to the small clue in the
// cage's top-left cell when one is printed; some cages carry no total and
// are all-different only ("if given" in the rules).
// Digits used in a cage may not appear in any cell orthogonally adjacent to
// that cage.

const graph = cellGraph('9x9');

// Cage cell lists transcribed from the drawn cage outlines; `total` is the
// small clue printed in the cage's top-left cell, or null where none is
// printed.
const cages = [
  { total: 6, cells: ['R1C6', 'R1C7'] },
  { total: 11, cells: ['R3C6', 'R4C6'] },
  { total: 18, cells: ['R3C3', 'R3C2', 'R3C1', 'R4C1'] },
  { total: null, cells: ['R2C4', 'R3C4', 'R4C4', 'R4C3', 'R4C5', 'R5C3'] },
  { total: null, cells: ['R5C4', 'R6C4'] },
  { total: 16, cells: ['R5C2', 'R5C1', 'R6C1', 'R7C1'] },
  { total: 14, cells: ['R8C3', 'R9C3'] },
  { total: null, cells: ['R6C5', 'R6C6', 'R6C7', 'R5C7', 'R7C6', 'R8C6'] },
  { total: null, cells: ['R6C8', 'R7C8', 'R7C9'] },
];

const sumCages = cages
  .filter(cage => cage.total !== null)
  .map(cage => new Cage(cage.total, ...cage.cells));

const noSumCages = cages
  .filter(cage => cage.total === null)
  .map(cage => new AllDifferent(...cage.cells));

// No-touch rule: for each cage, every in-grid cell orthogonally adjacent to
// the cage but outside it must differ from every cell of the cage. The
// neighbour set is derived from the transcribed cage cells via
// cellGraph().neighbours(), not hand-listed. One AllDifferent group per
// outside neighbour (never grouping two different neighbours together) keeps
// this to "neighbour != each cage cell" without adding a
// neighbour-to-neighbour relation the rule never states.
const noTouchGroups = cages.flatMap(cage => {
  const cageSet = new Set(cage.cells);
  const neighbours = new Set();
  for (const cell of cage.cells) {
    for (const n of graph.neighbours(cell)) {
      if (!cageSet.has(n)) neighbours.add(n);
    }
  }
  return [...neighbours].map(n => new AllDifferent(n, ...cage.cells));
});

return [
  new Shape('9x9'),
  ...sumCages,
  ...noSumCages,
  ...noTouchGroups,
];
