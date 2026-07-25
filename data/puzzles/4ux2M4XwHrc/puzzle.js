// Title: KRIOS
// Author: ViKingPrime
// Video: https://www.youtube.com/watch?v=4ux2M4XwHrc
// Source: https://sudokupad.app/pg8oz26nis

// Doubler cells are unmarked: the solver must place exactly one Doubler in
// each row, column, and box, and the six Doublers must hold six different
// digits. A VD Var overlay records each cell's flag: 1 for ordinary, 2 for
// Doubler. Every value-sensitive constraint (here, the Renban lines) reads
// digit/flag pairs and uses digit * flag as the cell's effective value.

const graph = cellGraph('6x6');
const flags = graph.makeOverlay('VD');
const cells = graph.cells();
const flag = cell => flags.at(cell);
const interleave = clueCells => clueCells.flatMap(cell => [cell, flag(cell)]);

const doubledDigitSpec = digit => NFA.encodeSpec({
  startState: { phase: 'digit', count: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', digit: value, count: state.count };
    }
    if (value !== 1 && value !== 2) return undefined;
    const count = state.count + (state.digit === digit && value === 2 ? 1 : 0);
    if (count > 1) return undefined;
    return { phase: 'digit', count };
  },
  accept: state => state.phase === 'digit' && state.count === 1,
}, 6);

const renbanSpec = length => NFA.encodeSpec({
  startState: { phase: 'digit', values: [] },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      if (state.values.length >= length) return undefined;
      return { phase: 'flag', values: state.values, digit: value };
    }
    if (value !== 1 && value !== 2) return undefined;
    const effective = state.digit * value;
    if (state.values.includes(effective)) return undefined;
    const values = [...state.values, effective].sort((a, b) => a - b);
    if (values.at(-1) - values[0] >= length) return undefined;
    return { phase: 'digit', values };
  },
  accept: state => state.phase === 'digit'
    && state.values.length === length
    && state.values.at(-1) - state.values[0] === length - 1,
  maxDepth: 2 * length,
}, 6);

// Renban lines, read off the drawn red paths (source-assets not needed; the
// payload's own lines[].wayPoints give a direct cell path).
const renbans = [
  ['R1C3', 'R1C4', 'R1C5'],
  ['R2C4', 'R2C5', 'R2C6'],
  ['R1C2', 'R2C3', 'R2C2', 'R2C1', 'R3C1', 'R3C2'],
  ['R4C2', 'R3C3', 'R4C4', 'R4C5', 'R3C5'],
  ['R4C6', 'R5C6', 'R5C5', 'R5C4', 'R6C4', 'R6C5'],
  ['R4C1', 'R5C1', 'R5C2', 'R5C3', 'R6C3', 'R6C2'],
];

const flagTargets = flags.at(cells);

return [
  new Shape('6x6'),
  new Given('R1C6', 6),

  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flagTargets[0], 1, 2), flagTargets),

  // Six flags in a row/column/box sum to 7 only when five are 1 and one is 2
  // -- i.e. exactly one Doubler per group.
  ...graph.rows().map(row => new Sum(7, ...flags.at(row))),
  ...graph.columns().map(column => new Sum(7, ...flags.at(column))),
  ...graph.boxes().map(box => new Sum(7, ...flags.at(box))),

  // The six Doubler cells hold six different digits: each digit 1-6 sits
  // under a flag of 2 exactly once across the whole grid.
  ...Array.from({ length: 6 }, (_, i) => new NFA(
    doubledDigitSpec(i + 1), `doubled digit ${i + 1}`, ...interleave(cells))),

  ...renbans.map(line => new NFA(
    renbanSpec(line.length), 'renban values', ...interleave(line))),
];
