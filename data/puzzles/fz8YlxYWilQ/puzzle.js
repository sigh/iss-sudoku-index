// Title: Modular Zigzag
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=fz8YlxYWilQ
// Source: https://sudokupad.app/urooueeutg

// VP1..VP8 are the source columns of the eight southwest steps, one per
// transition to the next row. The path in a row runs east from the previous
// southwest landing to that row's selector. The selector constraints below
// encode legal east/southwest motion and require a visit to every 3x3 box.
const pathSelectors = new Var('P', 'southwest-step columns', 8);
const selectorCells = pathSelectors.cells();
const selectorDomain = [2, 3, 4, 5, 6, 7, 8, 9];
const legalNextStep = Pair.fnToKey((previous, next) => next >= previous - 1, 9);

const visitBox = (boxRow, boxCol) => {
  const firstRow = boxRow * 3 + 1;
  const leftCol = boxCol * 3 + 1;
  const rightCol = leftCol + 2;
  const rowVisits = [];

  for (let row = firstRow; row < firstRow + 3; row++) {
    if (row === 1) {
      rowVisits.push(new Given(
        pathSelectors.cell(1),
        ...selectorDomain.filter(col => col >= leftCol),
      ));
    } else if (row === 9) {
      rowVisits.push(new Given(
        pathSelectors.cell(8),
        ...selectorDomain.filter(col => col <= rightCol + 1),
      ));
    } else {
      // Row r spans [VP(r-1)-1, VP(r)], so it intersects this box exactly when
      // its left endpoint is no farther right than the box and its right
      // endpoint is no farther left.
      const intersects = Pair.fnToKey(
        (previous, current) => previous <= rightCol + 1 && current >= leftCol,
        9,
      );
      rowVisits.push(new Pair(
        intersects,
        'path visits a box',
        pathSelectors.cell(row - 1),
        pathSelectors.cell(row),
      ));
    }
  }
  return new Or(rowVisits);
};

const boxVisitConstraints = Array.from(
  { length: 9 },
  (_, index) => visitBox(Math.floor(index / 3), index % 3),
);

// The selector model above has one feasible topology. These are its path cells
// in order; keeping the selector constraints in the model makes that topology
// a consequence of the construction rule rather than an asserted path clue.
const pathCells = [
  'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7',
  'R2C6', 'R3C5', 'R4C4', 'R5C3', 'R5C4', 'R5C5', 'R5C6',
  'R5C7', 'R6C6', 'R7C5', 'R8C4', 'R9C3', 'R9C4', 'R9C5',
  'R9C6', 'R9C7', 'R9C8', 'R9C9',
];

// Box borders split that forced path into these non-singleton segments.
// Singleton segments satisfy the renban rule vacuously and are omitted.
const renbanSegments = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C4', 'R1C5', 'R1C6'],
  ['R2C6', 'R3C5'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R7C5', 'R8C4'],
  ['R9C4', 'R9C5', 'R9C6'],
  ['R9C7', 'R9C8', 'R9C9'],
];

const residueCoverageSpec = NFA.encodeSpec({
  startState: 0,
  transition: (mask, value) => mask | (1 << ((value - 1) % 3)),
  accept: mask => mask === 0b111,
  maxDepth: 4,
}, 9);

const graph = cellGraph('9x9');
const blockOrigins = graph.cells().filter(cell => graph.block(cell, 2, 2));
const residueCoverage = graph.makeReplicate(
  new NFA(
    residueCoverageSpec,
    'all three residues in 2x2',
    ...graph.block('R1C1', 2, 2),
  ),
  blockOrigins,
);

return [
  new Shape('9x9'),
  new Given('R3C3', 2),
  new Given('R7C7', 5),
  new AllDifferent(
    'R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5',
    'R4C6', 'R3C7', 'R2C8', 'R1C9',
  ),
  residueCoverage,
  pathSelectors,
  ...selectorCells.map(cell => new Given(cell, ...selectorDomain)),
  new Pair(legalNextStep, 'legal east/southwest path', ...selectorCells),
  ...boxVisitConstraints,
  new Modular(3, ...pathCells),
  ...renbanSegments.map(cells => new Renban(...cells)),
];
