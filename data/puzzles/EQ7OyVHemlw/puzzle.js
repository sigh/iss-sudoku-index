// Title: The Continental
// Author: Blobz
// Video: https://www.youtube.com/watch?v=EQ7OyVHemlw
// Source: https://sudokupad.app/blobz/the-continental
//
// Normal sudoku (9x9, standard boxes, no given digits).
//
// Digits in cages do not repeat, and sum to the total, if given: cages with a
// printed total use Cage, the totalless ones AllDifferent.
//
// Digits orthogonally adjacent to a cage may NOT be included in that cage.
// Read against the cage as a whole -- "included in that cage" names the cage,
// whose digits are all different, so a cage has a well-defined digit set and a
// neighbour's digit must lie outside it. Cages touch one another here, so a
// cell in one cage is often a neighbour of another and is constrained in that
// role too.
//
// Fog is solving UI: it lifts as correct digits go in (R6C4 is a foglight) and
// places no condition on the finished grid, so it is not encoded.

const graph = cellGraph('9x9');

// Drawn killer cages. Totals are the values printed in each cage's top-left
// cell; the second list is the cages drawn without a total.
const cagesWithTotal = [
  [1, ['R6C4']],
  [9, ['R6C3', 'R7C3', 'R7C4']],
  [10, ['R5C5', 'R6C5', 'R7C5']],
  [11, ['R5C3', 'R5C4']],
  [16, ['R7C6', 'R8C4', 'R8C5', 'R8C6']],
  [21, ['R8C7', 'R9C6', 'R9C7']],
];
const cagesNoTotal = [
  ['R8C2', 'R8C3', 'R9C3', 'R9C4'],
  ['R5C1', 'R6C1', 'R7C1', 'R7C2'],
  ['R6C6', 'R6C7', 'R7C7'],
  ['R6C8', 'R7C8', 'R8C8'],
  ['R4C5', 'R4C6', 'R4C7', 'R5C7'],
  ['R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'],
];

const cageCellLists = [
  ...cagesWithTotal.map(([, cells]) => cells),
  ...cagesNoTotal,
];
const cages = [
  ...cagesWithTotal.map(([total, cells]) => new Cage(total, ...cells)),
  ...cagesNoTotal.map(cells => new AllDifferent(...cells)),
];

// One constraint per (cage, neighbouring cell outside it), the neighbours
// derived from the drawn cage cells. Adding the neighbour to the cage's own
// all-different group says exactly "this digit is not one of the cage's
// digits": the cage members were already required to be distinct, so the only
// new content is neighbour != every cage cell.
const cageNeighbourExclusions = cageCellLists.flatMap(cells => {
  const inCage = new Set(cells);
  const neighbours = [...new Set(cells.flatMap(cell => graph.neighbours(cell)))]
    .filter(cell => !inCage.has(cell));
  return neighbours.map(cell => new AllDifferent(...cells, cell));
});

return [
  new Shape('9x9'),
  ...cages,
  ...cageNeighbourExclusions,
];
