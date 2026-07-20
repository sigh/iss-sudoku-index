// Title: (+10)-Yang
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=47tQAsDhC9g
// Source: https://sudokupad.app/3cm1bpm2jv

// Shade state is 1 for unshaded and 2 for shaded. Thus a cell's puzzle
// value is digit + 10 * (shade - 1), without needing a 1..19 Var domain.
const UNSHADED = 1;
const SHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every shade Var is either unshaded or shaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, UNSHADED, SHADED));

// No 2x2 block is monochrome.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(
    noMono2x2Machine,
    'no monochrome 2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

const lines = [
  [
    ['R5C6', 'R5C5', 'R5C4', 'R4C4'],
    ['R3C4', 'R3C5'],
    ['R4C5'],
  ],
  [
    ['R7C3'],
    ['R6C3', 'R5C3', 'R4C3'],
  ],
  [
    ['R3C3', 'R2C3', 'R1C3', 'R1C2', 'R2C2', 'R3C2'],
    ['R4C2', 'R5C2', 'R6C2'],
  ],
  [
    ['R9C8', 'R9C7'],
    ['R9C6', 'R9C5', 'R9C4'],
    ['R9C3', 'R9C2', 'R9C1', 'R8C1', 'R7C1'],
  ],
  [
    ['R3C7'],
    ['R4C7', 'R4C8', 'R5C8', 'R6C8'],
    ['R7C8', 'R8C8'],
  ],
  [
    ['R1C5', 'R2C5', 'R2C6'],
    ['R2C7', 'R2C8', 'R2C9'],
  ],
  [['R8C2', 'R8C3', 'R8C4']],
];

// Constrain one segment to a concrete sum of effective values. Expanding
// value = digit + 10 * (shade - 1) avoids materializing values above 9.
function effectiveSegmentSum(target, cells) {
  return new Sum(
    target + 10 * cells.length,
    ...cells,
    ...shade.at(cells).map(cell => [cell, 10]));
}

// Enumerating the shared target uses only positive-coefficient sums. The target
// range is the intersection of every segment's possible [length, 19*length]
// range. A one-segment line imposes no equality and therefore no constraint.
function regionSumLine(segments) {
  const lower = Math.max(...segments.map(segment => segment.length));
  const upper = Math.min(...segments.map(segment => 19 * segment.length));
  const targets = Array.from({ length: upper - lower + 1 }, (_, i) => lower + i);
  return new Or(targets.map(target => new And(
    segments.map(segment => effectiveSegmentSum(target, segment)))));
}

const regionSumLines = lines
  .filter(segments => segments.length > 1)
  .map(regionSumLine);

const ratioDots = [
  ['R4C4', 'R4C5'],
  ['R5C4', 'R6C4'],
  ['R6C5', 'R6C6'],
  ['R4C6', 'R5C6'],
  ['R3C4', 'R3C5'],
  ['R7C5', 'R7C6'],
  ['R5C3', 'R6C3'],
  ['R4C7', 'R5C7'],
];

// Read [shade A, digit A, shade B, digit B], then compare the two effective
// values. No negative ratio-dot rule is present.
const ratioMachine = NFA.encodeSpec({
  startState: { phase: 'shade-a' },
  transition: (state, value) => {
    if (state.phase === 'shade-a') {
      if (value !== UNSHADED && value !== SHADED) return undefined;
      return { phase: 'digit-a', shadeA: value };
    }
    if (state.phase === 'digit-a') {
      return {
        phase: 'shade-b',
        valueA: value + 10 * (state.shadeA - UNSHADED),
      };
    }
    if (state.phase === 'shade-b') {
      if (value !== UNSHADED && value !== SHADED) return undefined;
      return { phase: 'digit-b', valueA: state.valueA, shadeB: value };
    }
    if (state.phase === 'digit-b') {
      const valueB = value + 10 * (state.shadeB - UNSHADED);
      const ratio = Math.max(state.valueA, valueB) / Math.min(state.valueA, valueB);
      return ratio === 2 ? { phase: 'done' } : undefined;
    }
    return undefined;
  },
  accept: ({ phase }) => phase === 'done',
  maxDepth: 4,
}, geometry.numValues);

const ratioRules = ratioDots.map(([a, b]) => new NFA(
  ratioMachine,
  'effective-value ratio 1:2',
  shade.at(a), a, shade.at(b), b));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...regionSumLines,
  ...ratioRules,
];
