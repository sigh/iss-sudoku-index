// Title: The Goldilocks Zone
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=GLgYWoEfFY8
// Source: https://sudokupad.app/a6zbf6jui2

// Rules encoded here:
//   * Normal sudoku (digits 1-9).
//   * The grid is divided into 3 zones, each one orthogonally connected group,
//     and no 2x2 area lies entirely in one zone.
//   * A cell's VALUE is its digit +1 in the hot zone, -1 in the cold zone, and
//     equal to its digit in the Goldilocks zone.
//   * The 9 object cells hold 9 different digits; the three bowls share a
//     value, the three chairs share a value, the three beds share a value.
//   * Zone borders cut each blue line into segments of equal value-total, and a
//     blue line's two end cells lie in different zones.
// Nothing is omitted.
//
// Zone labels are carried on a 'VZ' overlay and cell values on a 'VV' overlay.
// The shape's value range is widened to 0-10 to hold the derived values (a cold
// 1 is 0, a hot 9 is 10); the playable grid cells are restricted back to 1-9.

const COLD = 1;
const RIGHT = 2;
const HOT = 3;
const MAX_VALUE = 10;  // a hot 9

const shape = new Shape('9x9', '0-10');
const graph = cellGraph(shape);
const gridCells = graph.cells();
const zone = graph.makeOverlay('VZ');
const value = graph.makeOverlay('VV');

const digitDomain = graph.makeReplicate(
  new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));
const zoneDomain = zone.makeReplicate(
  new Given(zone.cells()[0], COLD, RIGHT, HOT));

// value = digit + zone - 2, i.e. digit - 1 / digit / digit + 1.
const valueLinks = gridCells.map(cell =>
  new Sum(2, cell, zone.at(cell), [value.at(cell), -1]));

// Rejects a 2x2 whose four zone labels are all equal. State carries the first
// label seen and whether every later label has matched it.
const sameLabelMachine = NFA.encodeSpec({
  startState: { first: null, allSame: true },
  transition: ({ first, allSame }, label) =>
    first === null
      ? { first: label, allSame: true }
      : { first, allSame: allSame && label === first },
  accept: ({ allSame }) => !allSame,
}, shape);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = zone.makeReplicate(
  new NFA(sameLabelMachine, 'no monochrome 2x2',
    ...zone.at(graph.block(gridCells[0], 2, 2))),
  zone.at(blockOrigins));

// Object cells, from the bowl/chair/bed emoji overlays.
const bowls = ['R2C5', 'R4C5', 'R6C5'];
const chairs = ['R6C6', 'R9C4', 'R9C6'];
const beds = ['R1C9', 'R8C7', 'R9C1'];
const objectDigits = [...bowls, ...chairs, ...beds];

// Blue lines, one per sky-blue stroke. Two pairs of strokes end near the centre
// of a shared cell with a visible gap between them (inside R6C7 and inside
// R4C9), so each pair is two lines meeting in that cell rather than one line
// through it; every other stroke turns corners within a single stroke, so a
// bend is not what splits a stroke here. The sub-cell stubs bracketing a free
// stroke end are round caps and add no cells. Three steps run diagonally
// (R6C7-R7C6, R4C9-R3C8, R2C6-R3C7): the stroke passes through the shared
// lattice corner alone, so those two cells are consecutive on their line and
// nothing lies between them.
const blueLines = [
  ['R4C1', 'R5C1'],
  ['R9C9', 'R8C9', 'R8C8', 'R7C8', 'R6C8', 'R5C8', 'R4C8', 'R4C7', 'R4C6',
   'R3C6', 'R3C5'],
  ['R2C7', 'R1C7', 'R1C8'],
  ['R6C7', 'R7C6', 'R8C6'],
  ['R5C3', 'R5C4', 'R4C4'],
  ['R6C1', 'R6C2', 'R7C2', 'R7C3'],
  ['R5C7', 'R6C7'],
  ['R5C9', 'R4C9'],
  ['R4C9', 'R3C8'],
  ['R8C5', 'R8C4', 'R7C4'],
  ['R2C4', 'R3C4', 'R3C3', 'R2C3', 'R2C2'],
  ['R1C5', 'R1C4', 'R1C3'],
  ['R2C6', 'R3C7'],
];

// One flag per step along a blue line: 1 when a zone border falls between the
// two cells, 0 when it does not.
const stepCount = blueLines.reduce((n, cells) => n + cells.length - 1, 0);
const borderFlag = new Var('B', 'zone border on a blue line step', stepCount);
let flagIndex = 0;
const lineFlags = blueLines.map(
  cells => cells.slice(1).map(() => borderFlag.cell(++flagIndex)));

// Reads [zone of one cell, flag, zone of the next cell] and accepts only when
// the flag agrees with whether the two labels differ.
const borderFlagMachine = NFA.encodeSpec({
  startState: { step: 0 },
  transition: (state, v) => {
    if (state.step === 0) {
      return v >= COLD && v <= HOT ? { step: 1, zone: v } : undefined;
    }
    if (state.step === 1) {
      return v <= 1 ? { step: 2, zone: state.zone, flag: v } : undefined;
    }
    if (v < COLD || v > HOT) return undefined;
    return (state.flag === 1) === (v !== state.zone) ? { step: 3 } : undefined;
  },
  accept: state => state.step === 3,
}, shape);
const flagDomains = borderFlag.cells().map(cell => new Given(cell, 0, 1));
const flagLinks = blueLines.flatMap((cells, i) => cells.slice(1).map(
  (cell, j) => new NFA(borderFlagMachine, 'zone border flag',
    zone.at(cells[j]), lineFlags[i][j], zone.at(cell))));

// Reads a line as [value, flag, value, flag, ..., value] and accepts when every
// flag-delimited run of values has the same total. `target` is the first run's
// total, fixed when the first flag arrives; later runs must reach it exactly.
// A line has at least two runs (its ends are in different zones, below), so a
// run total is at most MAX_VALUE * floor(cells / 2) -- the bound that keeps the
// running total finite.
const equalSegmentMachine = cellCount => {
  const maxTotal = MAX_VALUE * Math.floor(cellCount / 2);
  return NFA.encodeSpec({
    startState: { target: null, total: 0, onValue: true },
    transition: ({ target, total, onValue }, v) => {
      if (onValue) {
        const next = total + v;
        if (next > (target === null ? maxTotal : target)) return undefined;
        return { target, total: next, onValue: false };
      }
      if (v > 1) return undefined;
      if (v === 0) return { target, total, onValue: true };
      if (target === null) return { target: total, total: 0, onValue: true };
      return total === target ? { target, total: 0, onValue: true } : undefined;
    },
    accept: ({ target, total }) => target !== null && total === target,
  }, shape);
};
const equalSegments = blueLines.map((cells, i) => {
  const interleaved = cells.flatMap(
    (cell, j) => j === 0 ? [value.at(cell)] : [lineFlags[i][j - 1], value.at(cell)]);
  return new NFA(equalSegmentMachine(cells.length),
    'equal blue-line segment totals', ...interleaved);
});
const lineEnds = blueLines.map(
  cells => new AllDifferent(zone.at(cells[0]), zone.at(cells[cells.length - 1])));

return [
  shape,
  zone.toVar('zone'),
  value.toVar('cell value'),
  borderFlag,
  digitDomain,
  zoneDomain,
  ...flagDomains,
  ...valueLinks,
  new ConnectedValues('VZ', COLD),
  new ConnectedValues('VZ', RIGHT),
  new ConnectedValues('VZ', HOT),
  noMono2x2,
  new AllDifferent(...objectDigits),
  new SameValues(bowls.length, ...value.at(bowls)),
  new SameValues(chairs.length, ...value.at(chairs)),
  new SameValues(beds.length, ...value.at(beds)),
  ...flagLinks,
  ...equalSegments,
  ...lineEnds,
];
