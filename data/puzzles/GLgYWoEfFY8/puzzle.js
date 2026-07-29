// Title: The Goldilocks Zone
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=GLgYWoEfFY8
// Source: https://sudokupad.app/a6zbf6jui2

// Normal Sudoku uses digits 1-9. The three connected zones are cold (1),
// just right (2), and hot (3); their cell values are respectively digit-1,
// digit, and digit+1. The widened 0-10 alphabet holds those derived values.
// A blue line is divided wherever adjacent zone labels differ: all resulting
// segment value-sums agree, and the two endpoints have different zone labels.

const COLD = 1;
const RIGHT = 2;
const HOT = 3;
const shape = new Shape('9x9', '0-10');
const graph = cellGraph(shape);
const gridCells = graph.cells();
const zone = graph.makeOverlay('VZ');
const value = graph.makeOverlay('VV');

const digitDomain = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));
const zoneDomain = zone.makeReplicate(
  new Given(zone.cells()[0], COLD, RIGHT, HOT));

// value = digit + zone - 2.
const valueLinks = gridCells.map(cell =>
  new Sum(2, cell, zone.at(cell), [value.at(cell), -1]));

const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, label) => {
    if (done) return { done: true };
    const next = [...seen, label];
    if (next.length < 4) return { seen: next };
    return next.every(value => value === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, shape);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = zone.makeReplicate(
  new NFA(noMono2x2Machine, 'no monochrome 2x2',
    ...zone.at(graph.block(gridCells[0], 2, 2))),
  zone.at(blockOrigins));

const bowls = ['R2C5', 'R4C5', 'R6C5'];
const chairs = ['R6C6', 'R9C4', 'R9C6'];
const beds = ['R1C9', 'R8C7', 'R9C1'];
const objectDigits = [...bowls, ...chairs, ...beds];

return [
  shape,
  zone.toVar('zone'),
  value.toVar('cell value'),
  digitDomain,
  zoneDomain,
  ...valueLinks,
  new ConnectedValues('VZ', COLD),
  new ConnectedValues('VZ', RIGHT),
  new ConnectedValues('VZ', HOT),
  noMono2x2,
  new AllDifferent(...objectDigits),
  new SameValues(bowls.length, ...value.at(bowls)),
  new SameValues(chairs.length, ...value.at(chairs)),
  new SameValues(beds.length, ...value.at(beds)),
  // Omitted: the local drawing does not resolve the joined blue paths safely.
];
