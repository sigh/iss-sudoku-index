// Title: Spectral Distortions
// Author: Amin Khalek
// Video: https://www.youtube.com/watch?v=yUtXW3qAl-M
// Source: https://app.crackingthecryptic.com/Gf8p33BmMb

// Normal sudoku rules apply. Nine doubler cells sit in the grid, one in every
// row, column and box; each digit 1-9 appears in a doubler cell exactly once; a
// doubler cell's value is twice its digit and every other cell's value is its
// digit. Along a green line neighbouring values differ by at least 5. Values
// across an 'x' sum to 10, across a white dot are consecutive, across a black
// dot are in ratio 2, and across a grey dot are in ratio 3. Every clause is
// encoded; nothing is omitted.

// VD is a parallel flag layer over the grid: 1 marks an ordinary cell and 2
// marks a doubler. Which cells are doublers is what the solver discovers, so
// every value-sensitive rule scans grid digits interleaved with their flags and
// uses digit * flag as the cell's value.

const shape = new Shape('9x9');
const graph = cellGraph('9x9');
const cells = graph.cells();
const flags = graph.makeOverlay('VD');
const flag = cell => flags.at(cell);
const interleave = path => path.flatMap(cell => [cell, flag(cell)]);

// Exactly one doubler in the scan carries this digit. The machine alternates
// digit and flag symbols; `digit` holds the digit awaiting its flag.
const doubledDigitSpec = digit => NFA.encodeSpec({
  startState: {phase: 'digit', digit: 0, count: 0},
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return {phase: 'flag', digit: value, count: state.count};
    }
    const count = state.count + (state.digit === digit && value === 2 ? 1 : 0);
    if (count > 1) return undefined;   // a second one can never be undone
    return {phase: 'digit', digit: 0, count};
  },
  accept: state => state.phase === 'digit' && state.count === 1,
}, shape);

// `predicate` must hold between the values of every consecutive pair of cells
// in the scan. `prev` is the previous cell's value, 0 before the first cell.
const valuePathSpec = predicate => NFA.encodeSpec({
  startState: {phase: 'digit', digit: 0, prev: 0},
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return {phase: 'flag', digit: value, prev: state.prev};
    }
    const current = state.digit * value;
    if (state.prev !== 0 && !predicate(state.prev, current)) return undefined;
    return {phase: 'digit', digit: 0, prev: current};
  },
  accept: state => state.phase === 'digit' && state.prev !== 0,
}, shape);

const greenSpec = valuePathSpec((a, b) => Math.abs(a - b) >= 5);
const dominoSpecs = {
  x: valuePathSpec((a, b) => a + b === 10),
  white: valuePathSpec((a, b) => Math.abs(a - b) === 1),
  black: valuePathSpec((a, b) => a === 2 * b || b === 2 * a),
  grey: valuePathSpec((a, b) => a === 3 * b || b === 3 * a),
};

// Green lines: five horizontal strokes drawn along R1C1-R1C8, R3C1-R3C7,
// R5C1-R5C8, R7C1-R7C7 and R9C1-R9C8, given here as [row, length].
const greenLines = [[1, 8], [3, 7], [5, 8], [7, 7], [9, 8]].map(
  ([row, length]) => graph.row(row).slice(0, length));

// Edge marks, read off the drawn overlays: an 'x' glyph, a white dot (white
// fill, black border), a black dot (black fill), and grey dots (grey fill).
const dominoes = [
  ['x', ['R5C9', 'R6C9']],
  ['x', ['R8C2', 'R9C2']],
  ['white', ['R3C6', 'R4C6']],
  ['black', ['R1C9', 'R2C9']],
  ['grey', ['R1C2', 'R2C2']],
  ['grey', ['R6C4', 'R7C4']],
  ['grey', ['R8C9', 'R9C9']],
];

return [
  shape,
  new Given('R2C1', 9),

  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flag(cells[0]), 1, 2)),
  ...graph.rowsColumnsBoxes().map(
    unit => new ContainExact('2', ...flags.at(unit))),
  ...Array.from({length: 9}, (_, i) => new NFA(
    doubledDigitSpec(i + 1), `doubler digit ${i + 1}`, ...interleave(cells))),

  ...greenLines.map(
    line => new NFA(greenSpec, 'green line values', ...interleave(line))),
  ...dominoes.map(([kind, pair]) => new NFA(
    dominoSpecs[kind], `${kind} values`, ...interleave(pair))),
];
