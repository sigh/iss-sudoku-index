// Title: Balancing regions
// Author: Jonesy
// Video: https://www.youtube.com/watch?v=CAkYhG9w0VQ
// Source: https://sudokupad.app/d2kydms6ca

// The CC overlay holds the deduced region label for each grid cell. Since
// there are exactly 18 cages and every one of the nine regions has at least
// two cages, each region contains exactly two cages.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

const cages = [
  ['R1C4'],
  ['R1C8', 'R1C9'],
  ['R2C6'],
  ['R2C2', 'R2C3', 'R2C4', 'R2C5'],
  ['R2C7', 'R2C8', 'R3C6', 'R3C7'],
  ['R3C3', 'R3C4'],
  ['R4C9', 'R5C7', 'R5C8', 'R5C9'],
  ['R4C6'],
  ['R4C3', 'R4C4', 'R4C5'],
  ['R4C1', 'R4C2'],
  ['R6C9', 'R7C9'], // Y
  ['R6C4', 'R6C5'],
  ['R6C2', 'R7C2', 'R7C3'],
  ['R7C6', 'R7C7'], // X
  ['R8C8', 'R9C8', 'R9C9'],
  ['R8C5', 'R9C5', 'R9C6', 'R9C7'],
  ['R9C3'],
  ['R8C3', 'R8C4'],
];

const whiteDots = [
  ['R4C5', 'R4C6'],
  ['R8C2', 'R8C3'],
  ['R7C6', 'R8C6'],
  ['R3C7', 'R4C7'],
  ['R5C4', 'R5C5'],
];
const blackDots = [['R7C4', 'R7C5']];

const parityKey = Pair.fnToKey((a, b) => a % 2 === b % 2, 9);

// For a fixed region label, scan each cage as [representative CC label,
// cage digits]. Exactly two cages carry the label; their accumulated sums must
// match. Sums are clamped beyond the largest possible four-cell total so the
// compiled state space stays finite.
const MAX_CAGE_SUM = 30;
const equalCageTotalSpec = region => NFA.encodeSpec({
  startState: {
    atStart: true, active: false, found: 0, first: 0, sum: 0,
  },
  transition: ({ atStart, active, found, first, sum }, value) => {
    if (value === SEGMENT_BREAK) {
      if (active) {
        if (found === 0) {
          return { atStart: true, active: false, found: 1, first: sum, sum: 0 };
        }
        if (found === 1 && sum === first) {
          return { atStart: true, active: false, found: 2, first, sum: 0 };
        }
        return undefined;
      }
      return { atStart: true, active: false, found, first, sum: 0 };
    }
    if (atStart) {
      return {
        atStart: false,
        active: value === region,
        found,
        first,
        sum: 0,
      };
    }
    if (!active) return { atStart: false, active, found, first, sum: 0 };
    return {
      atStart: false,
      active,
      found,
      first,
      sum: Math.min(sum + value, MAX_CAGE_SUM + 1),
    };
  },
  accept: ({ active, found, first, sum }) => (
    (active && found === 1 && sum === first) || (!active && found === 2)
  ),
}, 9, { multiSegment: true });

const cageSegments = cages.map(cage => [cc.at(cage[0]), ...cage]);
const equalRegionTotals = Array.from({ length: 9 }, (_, i) => (
  new NFA(equalCageTotalSpec(i + 1), `region ${i + 1} cage totals`, ...cageSegments)
));

// Compare the two labelled cages directly, independent of their regions.
const unequalLabelledTotalsSpec = NFA.encodeSpec({
  startState: { segment: 0, x: 0, y: 0 },
  transition: ({ segment, x, y }, value) => {
    if (value === SEGMENT_BREAK) return { segment: 1, x, y };
    if (segment === 0) return { segment, x: Math.min(x + value, 19), y };
    return { segment, x, y: Math.min(y + value, 19) };
  },
  accept: ({ segment, x, y }) => segment === 1 && x !== y,
}, 9, { multiSegment: true });

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  new Given('R2C1', 9),

  // Every region label occurs on exactly two cage representatives.
  new ContainExact('1_1_2_2_3_3_4_4_5_5_6_6_7_7_8_8_9_9',
    ...cages.map(cage => cc.at(cage[0]))),

  // Cage membership, no repeats, and uniform parity.
  ...cages.filter(cage => cage.length > 1)
    .map(cage => new SameValues(cage.length, ...cc.at(cage))),
  ...cages.filter(cage => cage.length > 1)
    .map(cage => new AllDifferent(...cage)),
  ...cages.filter(cage => cage.length > 1)
    .map(cage => new Pair(parityKey, 'same parity', ...cage)),

  ...equalRegionTotals,
  new NFA(unequalLabelledTotalsSpec, 'X and Y totals differ', cages[13], cages[10]),

  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
