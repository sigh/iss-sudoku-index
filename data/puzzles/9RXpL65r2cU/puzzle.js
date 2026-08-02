// Title: Per: Zip
// Author: Anthony Anderson
// Video: https://www.youtube.com/watch?v=9RXpL65r2cU
// Source: https://app.crackingthecryptic.com/7Q693FQRNj

// Normal Sudoku applies. A VD flag of 2 marks one of the hidden doublers;
// flags otherwise equal 1. Each row, column, and box contains one doubler,
// and every digit is doubled once. Purple zipper pairs sum to their centre
// and black (1:2) / blue (2:3) dots use effective values (digit * VD).

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const cells = graph.cells();
const flag = cell => flags.at(cell);
const interleave = clueCells => clueCells.flatMap(cell => [cell, flag(cell)]);

// The interleaved scan is [digit, doubler flag]. For each target digit it
// accepts exactly one flag-2 occurrence across the whole grid.
const doubledDigitSpec = target => NFA.encodeSpec({
  startState: { phase: 'digit', count: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', digit: value, count: state.count };
    }
    if (value !== 1 && value !== 2) return undefined;
    const count = state.count + (state.digit === target && value === 2 ? 1 : 0);
    return count <= 1 ? { phase: 'digit', count } : undefined;
  },
  accept: state => state.phase === 'digit' && state.count === 1,
}, 9);

// This scans an effective-value domino and applies the supplied marked-dot rule.
const effectivePairSpec = predicate => NFA.encodeSpec({
  startState: { phase: 'first-digit' },
  transition: (state, value) => {
    if (state.phase === 'first-digit') return { phase: 'first-flag', digit: value };
    if (state.phase === 'first-flag') {
      if (value !== 1 && value !== 2) return undefined;
      return { phase: 'second-digit', first: state.digit * value };
    }
    if (state.phase === 'second-digit') {
      return { phase: 'second-flag', first: state.first, digit: value };
    }
    if (state.phase === 'second-flag') {
      if (value !== 1 && value !== 2) return undefined;
      return predicate(state.first, state.digit * value) ? { phase: 'done' } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 'done',
}, 9);

// This scan is [outer digit/flag, matching digit/flag, centre digit/flag].
// It accepts precisely when the two effective outer values sum to the centre.
const zipperPairSpec = NFA.encodeSpec({
  startState: { phase: 'first-digit' },
  transition: (state, value) => {
    if (state.phase === 'first-digit') return { phase: 'first-flag', digit: value };
    if (state.phase === 'first-flag') {
      if (value !== 1 && value !== 2) return undefined;
      return { phase: 'second-digit', first: state.digit * value };
    }
    if (state.phase === 'second-digit') {
      return { phase: 'second-flag', first: state.first, digit: value };
    }
    if (state.phase === 'second-flag') {
      if (value !== 1 && value !== 2) return undefined;
      return { phase: 'centre-digit', outerSum: state.first + state.digit * value };
    }
    if (state.phase === 'centre-digit') {
      return { phase: 'centre-flag', outerSum: state.outerSum, digit: value };
    }
    if (state.phase === 'centre-flag') {
      if (value !== 1 && value !== 2) return undefined;
      return state.outerSum === state.digit * value ? { phase: 'done' } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 'done',
}, 9);

// Purple paths, provenance: the eight medium-orchid line entries and their
// matching purple centre overlays in the source artwork.
const zippers = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R2C3', 'R2C4', 'R3C3'],
  ['R3C2', 'R4C3', 'R5C4'],
  ['R7C3', 'R7C2', 'R8C2', 'R9C2', 'R9C1'],
  ['R9C3', 'R9C4', 'R9C5', 'R8C6', 'R9C6'],
  ['R9C7', 'R9C8', 'R9C9'],
  ['R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8'],
  ['R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5'],
];

const zipperTriples = zippers.flatMap(path => {
  const centre = path[(path.length - 1) / 2];
  return Array.from({ length: (path.length - 1) / 2 }, (_, i) => [
    path[i], path[path.length - 1 - i], centre,
  ]);
});

// Dot pairs, provenance: three black and two blue edge-centred overlays.
const blackDots = [['R6C3', 'R6C4'], ['R6C3', 'R7C3'], ['R7C1', 'R8C1']];
const blueDots = [['R5C3', 'R5C4'], ['R1C7', 'R1C8']];
const blackDotSpec = effectivePairSpec((a, b) => a === 2 * b || b === 2 * a);
const blueDotSpec = effectivePairSpec((a, b) => a * 3 === b * 2 || b * 3 === a * 2);

return [
  new Shape('9x9'),
  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flag(cells[0]), 1, 2), flags.at(cells)),

  // Eight 1 flags and one 2 flag total 10 in every required placement group.
  ...graph.rowsColumnsBoxes().map(group => new Sum(10, ...flags.at(group))),
  ...Array.from({ length: 9 }, (_, i) =>
    new NFA(doubledDigitSpec(i + 1), `doubled digit ${i + 1}`, ...interleave(cells))),
  ...zipperTriples.map(triple =>
    new NFA(zipperPairSpec, 'zipper effective values', ...interleave(triple))),
  ...blackDots.map(pair => new NFA(blackDotSpec, 'black dot effective values', ...interleave(pair))),
  ...blueDots.map(pair => new NFA(blueDotSpec, 'blue dot effective values', ...interleave(pair))),
];
