// Title: (+5)-Yang
// Author: SennyK
// Video: https://www.youtube.com/watch?v=7xyfTKUsFO4
// Source: https://sudokupad.app/fa86g835k3

// Normal Sudoku uses written digits 1-9. A full-grid shade overlay stores
// 1 = unshaded and 2 = shaded. A parallel effective-value overlay stores the
// written digit in an unshaded cell and digit + 5 in a shaded cell. The Shape
// is widened to 14 only so that this effective layer can hold values 10-14;
// every playable grid cell is restricted back to 1-9.

const UNSHADED = 1;
const SHADED = 2;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const shape = new Shape('9x9', 14);
const graph = cellGraph(shape);
const shade = graph.makeOverlay('VS');
const value = graph.makeOverlay('VV');
const shadeAt = cell => shade.at(cell);
const valueAt = cell => value.at(cell);
const cells = graph.cells();

// Restore the true domains after widening the Shape.
const digitDomain = graph.makeReplicate(new Given(cells[0], ...DIGITS));
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], UNSHADED, SHADED));

// value = digit + 5 * (shade - 1), or value - digit - 5*shade = -5.
const effectiveValues = cells.map(cell => new Sum(
  -5, valueAt(cell), [cell, -1], [shadeAt(cell), -5]));

// Reject a 2x2 block only when all four shade flags are identical. The state
// retains only the first shade and whether a different shade has appeared.
const noMono2x2Spec = NFA.encodeSpec({
  startState: { count: 0, first: null, mixed: false },
  transition: ({ count, first, mixed }, next) => {
    if (count >= 4) return undefined;
    return {
      count: count + 1,
      first: first === null ? next : first,
      mixed: mixed || (first !== null && next !== first),
    };
  },
  accept: ({ count, mixed }) => count === 4 && mixed,
  maxDepth: 4,
}, 14);
const blockOrigins = cells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Spec, 'no-monochrome-2x2',
    ...shade.at(graph.block(cells[0], 2, 2))),
  shade.at(blockOrigins));

// Each entry is one drawn blue line, already divided at box borders. All
// segments belonging to one entry must have equal effective-value sums.
const REGION_SUM_LINES = [
  [
    ['R5C6', 'R6C5'],
    ['R7C4'],
    ['R7C3', 'R7C2'],
    ['R6C2', 'R5C2', 'R4C2'],
    ['R3C3'],
    ['R3C4', 'R3C5'],
  ],
  [
    ['R5C5', 'R4C4'],
    ['R5C3'],
  ],
  [
    ['R6C7'],
    ['R7C8', 'R8C9', 'R9C8', 'R9C7'],
    ['R9C6', 'R8C5', 'R7C5'],
  ],
  [
    ['R4C5', 'R4C6'],
    ['R4C7', 'R4C8'],
    ['R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7'],
  ],
  [
    ['R1C5', 'R1C6'],
    ['R2C7', 'R3C8'],
  ],
  [
    ['R2C2', 'R1C3'],
    ['R1C4', 'R2C4'],
  ],
  [
    ['R1C1', 'R2C1', 'R3C2'],
    ['R4C1', 'R5C1'],
  ],
];
const regionSumLines = REGION_SUM_LINES.map(segments =>
  new EqualSum(...value.at(segments)));

const RENBAN_LINES = [
  ['R6C6', 'R6C5', 'R5C4'],
  ['R7C5', 'R7C6', 'R8C6'],
];
const renbans = RENBAN_LINES.map(line =>
  new Renban(...value.at(line)));

const EQUAL_DOTS = [
  ['R4C5', 'R4C6'],
  ['R5C6', 'R6C6'],
  ['R6C4', 'R6C5'],
  ['R4C4', 'R5C4'],
  ['R7C2', 'R7C3'],
  ['R9C2', 'R9C3'],
  ['R5C6', 'R5C7'],
  ['R2C1', 'R2C2'],
];
const equalDots = EQUAL_DOTS.map(([a, b]) =>
  new SameValues(2, valueAt(a), valueAt(b)));

const BLACK_DOTS = [
  ['R6C6', 'R6C7'],
  ['R6C6', 'R7C6'],
  ['R2C7', 'R3C7'],
];
const blackDots = BLACK_DOTS.map(([a, b]) =>
  new BlackDot(valueAt(a), valueAt(b)));

return [
  shape,
  digitDomain,
  shade.toVar('Yin-Yang shade'),
  shadeDomain,
  value.toVar('effective value'),
  ...effectiveValues,
  // Both shade classes must each form one orthogonally connected region.
  new ConnectedValues('VS', UNSHADED),
  new ConnectedValues('VS', SHADED),
  noMono2x2,
  ...regionSumLines,
  ...renbans,
  ...equalDots,
  ...blackDots,
];
