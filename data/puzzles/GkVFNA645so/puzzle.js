// Title: +-1
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=GkVFNA645so
// Source: https://app.crackingthecryptic.com/6guvv1za0z

// Normal sudoku rules apply. Purple lines are non-repeating consecutive sets
// of values; black dots join values in a 1:2 ratio. Exactly one cell in each
// row, column, and box is knapp daneben: its value is its digit minus or plus
// one. Each base digit is knapp daneben exactly once.

const shape = new Shape('9x9', '0-10');
const graph = cellGraph(shape);
const gridCells = graph.cells();
const flags = graph.makeOverlay('VK');
const values = graph.makeOverlay('VV');
const flag = cell => flags.at(cell);
const value = cell => values.at(cell);
const interleaveDigitFlag = cells => cells.flatMap(cell => [cell, flag(cell)]);

// A flag is 1 for value = digit - 1, 2 for an unmodified value, and 3 for
// value = digit + 1. This NFA ties every drawn digit to its value overlay.
const valueSpec = NFA.encodeSpec({
  startState: { phase: 'digit', digit: null, flag: null },
  transition: (state, seen) => {
    if (state.phase === 'digit') return { phase: 'flag', digit: seen, flag: null };
    if (state.phase === 'flag') {
      if (seen < 1 || seen > 3) return undefined;
      return { phase: 'value', digit: state.digit, flag: seen };
    }
    return seen === state.digit + state.flag - 2 ? 'accept' : undefined;
  },
  accept: state => state === 'accept',
}, shape);

// A house contains exactly one flag other than 2, hence exactly one knapp
// daneben cell. The NFA rejects immediately once it sees a second one.
const oneKnappSpec = NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, seen) => {
    if (seen < 1 || seen > 3) return undefined;
    const next = count + (seen === 2 ? 0 : 1);
    return next <= 1 ? { count: next } : undefined;
  },
  accept: ({ count }) => count === 1,
}, shape);

// For each base digit, scan digit/flag pairs and require exactly one modified
// occurrence. This is the rule that every digit appears in a knapp daneben cell.
const modifiedDigitSpec = digit => NFA.encodeSpec({
  startState: { phase: 'digit', base: null, count: 0 },
  transition: (state, seen) => {
    if (state.phase === 'digit') return { phase: 'flag', base: seen, count: state.count };
    if (seen < 1 || seen > 3) return undefined;
    const count = state.count + (state.base === digit && seen !== 2 ? 1 : 0);
    return count <= 1 ? { phase: 'digit', base: null, count } : undefined;
  },
  accept: state => state.phase === 'digit' && state.count === 1,
}, shape);

// On a widened 0-10 value range, use this rather than BlackDot so 0:0 is
// not treated as a 1:2 ratio.
const blackDotValueKey = Pair.fnToKey(
  (a, b) => a !== 0 && b !== 0 && (a === 2 * b || b === 2 * a), shape);

// Purple line cells, in drawn order, transcribed from the nine purple strokes.
// A returning waypoint closes a drawn loop and is not repeated in a Renban set.
const purpleLines = [
  ['R1C5', 'R2C6', 'R3C5', 'R4C6'],
  ['R4C7', 'R5C6', 'R6C7'],
  ['R1C8', 'R2C8', 'R1C7'],
  ['R6C8', 'R5C8', 'R4C8', 'R5C7'],
  ['R1C2', 'R2C1', 'R2C2'],
  ['R6C3', 'R7C3', 'R7C4', 'R7C5', 'R6C6', 'R6C5', 'R6C4'],
  ['R5C2', 'R5C3', 'R4C3', 'R4C2', 'R4C1'],
  ['R6C1', 'R7C1', 'R7C2', 'R6C2'],
  ['R9C8', 'R9C9', 'R8C8', 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
];

// Black-dot edges transcribed from the seven black circles in the drawing.
const blackDots = [
  ['R5C2', 'R6C2'], ['R3C2', 'R4C2'], ['R5C7', 'R6C7'],
  ['R3C9', 'R4C9'], ['R8C4', 'R9C4'], ['R7C1', 'R7C2'],
  ['R1C4', 'R1C5'],
];

return [
  shape,
  // The playable sudoku digits remain 1-9; the wider shape is only for the
  // value overlay, which may contain 0 or 10 after a +/-1 modification.
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  flags.toVar('knapp daneben flags'),
  values.toVar('cell values'),
  flags.makeReplicate(new Given(flag(gridCells[0]), 1, 2, 3)),
  ...gridCells.map(cell => new NFA(valueSpec, 'digit to value', cell, flag(cell), value(cell))),
  ...graph.rows().map(cells => new NFA(oneKnappSpec, 'one knapp daneben', ...flags.at(cells))),
  ...graph.columns().map(cells => new NFA(oneKnappSpec, 'one knapp daneben', ...flags.at(cells))),
  ...graph.boxes().map(cells => new NFA(oneKnappSpec, 'one knapp daneben', ...flags.at(cells))),
  ...Array.from({ length: 9 }, (_, i) => new NFA(
    modifiedDigitSpec(i + 1), `modified-digit-${i + 1}`, ...interleaveDigitFlag(gridCells))),
  ...purpleLines.map(cells => new Renban(...values.at(cells))),
  ...blackDots.map(cells => new Pair(blackDotValueKey, 'black dot values', ...values.at(cells))),
];
