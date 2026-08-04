// Title: Whisper Doublers
// Author: yttrio
// Video: https://www.youtube.com/watch?v=XPiF-OljHkY
// Source: https://app.crackingthecryptic.com/sudoku/P44pbrqtfP

// Normal sudoku rules apply. Adjacent values along a line must differ by at
// least 5. Nine cells in the grid are 'doublers', which count as double their
// value for the purpose of the lines. There is exactly one doubler in each
// row, column, and box, and they form a set of the digits 1-9. No cell is
// marked as a doubler in the source: doubler placement is entirely
// solver-deduced, so every cell needs an unknown doubler flag alongside its
// digit.
//
// VD is a parallel flag layer: 1 means an ordinary cell, 2 means a Doubler.
// Every whisper line scans grid digit / VD flag pairs and uses digit * flag
// as each cell's effective value.

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const cells = graph.cells();
const flag = cell => flags.at(cell);
const interleave = clueCells => clueCells.flatMap(cell => [cell, flag(cell)]);

// Exactly one doubler (flag 2) among the nine flags of a row/column/box:
// 8 ones + 1 two sums to 10; any other split sums to a different total.
const ONE_DOUBLER_SUM = 10;

// Scans the whole grid as interleaved [digit, flag] pairs and accepts iff
// exactly one cell holds `digit` under a doubler flag (flag == 2). Applied
// once per digit 1-9 to encode "the doublers form a set of the digits 1-9".
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
}, 9);

// Scans a whisper line as interleaved [digit, flag] pairs, computing each
// cell's effective value (digit * flag) and requiring every pair of
// consecutive effective values along the line to differ by at least `diff`.
const whisperEffectiveSpec = diff => NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', prev: state.prev, digit: value };
    }
    if (value !== 1 && value !== 2) return undefined;
    const effective = state.digit * value;
    if (state.prev !== undefined && Math.abs(effective - state.prev) < diff) {
      return undefined;
    }
    return { phase: 'digit', prev: effective };
  },
  accept: state => state.phase === 'digit',
}, 9);
const whisperSpec = whisperEffectiveSpec(5);

// Whisper lines. Several drawn strokes share exact endpoints and colour and
// are one continuous line split into multiple polyline segments; each row
// below is one such joined line.
const whisperLines = [
  ['R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7',
    'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R4C1',
    'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R8C2'],
  ['R6C7', 'R7C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3'],
  ['R5C6', 'R6C6', 'R6C5'],
  ['R8C7', 'R9C7', 'R9C6'],
  ['R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3'],
];

return [
  new Shape('9x9'),

  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flag(cells[0]), 1, 2), flags.at(cells)),

  ...graph.rows().map(row => new Sum(ONE_DOUBLER_SUM, ...flags.at(row))),
  ...graph.columns().map(column => new Sum(ONE_DOUBLER_SUM, ...flags.at(column))),
  ...graph.boxes().map(box => new Sum(ONE_DOUBLER_SUM, ...flags.at(box))),

  ...Array.from({ length: 9 }, (_, i) => new NFA(
    doubledDigitSpec(i + 1), `doubled digit ${i + 1}`, ...interleave(cells))),

  ...whisperLines.map(line => new NFA(
    whisperSpec, 'whisper effective values', ...interleave(line))),
];
