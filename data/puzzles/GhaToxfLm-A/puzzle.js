// Title: Shima Yuteki
// Author: rockratzero
// Video: https://www.youtube.com/watch?v=GhaToxfLm-A
// Source: https://app.crackingthecryptic.com/xkbz6iw8mm

// Normal Sudoku applies. Each listed dashed cage has one non-empty connected
// shaded group. Across cage borders, two shaded cells cannot touch; touching
// cages have different shaded-cell counts. Circles are unshaded count clues.
// A numbered cage sums distinct shaded digits; the black dot is a 2:1 ratio.

const SHADED = 1;
const UNSHADED = 2;
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

// Cage cells and totals transcribed from the dashed cages and their small labels.
const cages = [
  { cells: ['R1C1', 'R1C2', 'R2C1'], total: 3 },
  { cells: ['R2C2', 'R3C1', 'R3C2', 'R3C3'], total: 13 },
  { cells: ['R8C9', 'R9C8', 'R9C9'], total: 7 },
  { cells: ['R7C7', 'R7C8', 'R7C9', 'R8C8'], total: 7 },
  { cells: ['R1C3', 'R2C3', 'R2C4', 'R3C4', 'R4C4'] },
  { cells: ['R6C6', 'R7C6', 'R8C6', 'R8C7', 'R9C7'], total: 27 },
  { cells: ['R4C3', 'R5C3', 'R5C4'], total: 9 },
  { cells: ['R4C1', 'R4C2', 'R5C1', 'R5C2', 'R6C1', 'R6C2'], total: 12 },
  { cells: ['R4C8', 'R4C9', 'R5C8', 'R5C9', 'R6C8', 'R6C9'], total: 15 },
  { cells: ['R4C7', 'R5C6', 'R5C7', 'R6C7'], total: 11 },
  { cells: ['R3C6', 'R4C5', 'R4C6', 'R5C5', 'R6C3', 'R6C4', 'R6C5'], total: 15 },
  { cells: ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R3C7'], total: 16 },
  { cells: ['R2C9', 'R3C8', 'R3C9'], total: 8 },
  { cells: ['R1C4', 'R1C5', 'R1C6', 'R2C5', 'R2C6', 'R3C5'], total: 9 },
  { cells: ['R7C1', 'R7C2', 'R7C3', 'R8C1', 'R9C1', 'R9C2', 'R9C3'], total: 19 },
  { cells: ['R7C4', 'R7C5', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R9C4', 'R9C5', 'R9C6'], total: 8 },
];

// A layout fixes a cage's shade membership and its count. Enumerating its
// connected subsets is the direct finite form of "a connected group within
// each dashed cage"; numbered layouts also impose that subset's digit rules.
function connectedSubsets(cells) {
  const locations = new Map(cells.map(cell => [cell, parseCellId(cell)]));
  const adjacent = (a, b) => {
    const aa = locations.get(a);
    const bb = locations.get(b);
    return Math.abs(aa.row - bb.row) + Math.abs(aa.col - bb.col) === 1;
  };
  return Array.from({ length: (1 << cells.length) - 1 }, (_, bits) =>
    cells.filter((_, index) => bits & (1 << index)))
    .filter(subset => {
      const seen = new Set([subset[0]]);
      const todo = [subset[0]];
      while (todo.length) {
        const cell = todo.pop();
        for (const other of subset) {
          if (adjacent(cell, other) && !seen.has(other)) {
            seen.add(other);
            todo.push(other);
          }
        }
      }
      return seen.size === subset.length;
    });
}

const counts = new Var('C', 'cage shaded-cell counts', cages.length);
const countCell = index => counts.cell(index + 1);
const cageRules = cages.map(({ cells, total }, index) => new Or(
  connectedSubsets(cells).map(subset => new And([
    ...shade.at(cells).map((cell, cellIndex) =>
      new Given(cell, subset.includes(cells[cellIndex]) ? SHADED : UNSHADED)),
    new Given(countCell(index), subset.length),
    ...(total === undefined ? [] : [
      new Sum(total, ...subset),
      new AllDifferent(...subset),
    ]),
  ]))));

// The circle table is transcribed from the eight circular underlays. Every
// circle is unshaded and its digit equals its cage's shaded-cell count.
const circles = [
  ['R1C2', 0], ['R3C3', 1], ['R1C3', 4], ['R5C5', 10],
  ['R1C9', 11], ['R7C2', 14], ['R4C8', 8], ['R7C5', 15],
];
const circleRules = circles.flatMap(([cell, cage]) => [
  new Given(shade.at(cell), UNSHADED),
  new SameValues(2, cell, countCell(cage)),
]);

// Derive cage-border adjacencies from the transcribed cage membership, then
// forbid equal counts only for orthogonally touching distinct cages.
const cageByCell = new Map(cages.flatMap(({ cells }, index) =>
  cells.map(cell => [cell, index])));
const adjacentCagePairs = graph.cells().flatMap(cell =>
  graph.neighbours(cell).filter(other => cell < other)
    .map(other => [cageByCell.get(cell), cageByCell.get(other)]))
  .filter(([a, b]) => a !== b);
const cageCountRules = adjacentCagePairs.map(([a, b]) =>
  new AllDifferent(countCell(a), countCell(b)));

// A shaded cell cannot touch another shaded cell across a dashed cage border.
const noShadedBorder = Pair.fnToKey((a, b) => a !== SHADED || b !== SHADED, 9);
const borderShadeRules = graph.cells().flatMap(cell =>
  graph.neighbours(cell).filter(other => cell < other)
    .filter(other => cageByCell.get(cell) !== cageByCell.get(other))
    .map(other => new Pair(noShadedBorder, 'no shaded cage-border pair',
      shade.at(cell), shade.at(other))));

return [
  new Shape('9x9'),
  shade.toVar('shading'),
  counts,
  shade.makeReplicate(new Given(shade.cells()[0], SHADED, UNSHADED)),
  ...cageRules,
  ...circleRules,
  ...cageCountRules,
  ...borderShadeRules,
  // The single black dot is the edge mark between R8C4 and R9C4.
  new BlackDot('R8C4', 'R9C4'),
];
