// Title: 3
// Author: Celestia
// Video: https://www.youtube.com/watch?v=cSwQblYGDSc
// Source: https://app.crackingthecryptic.com/sudoku/HLGPNp3NQd

// Normal sudoku rules (rows, columns, standard 3x3 boxes, from the payload's
// standard-tiling `regions`), plus:
// - 19 killer cages (digits distinct within a cage), every printed total 3.
// - A solver-discovered YinYang shading.
// - Cage totals are signed by shade: a shaded cell's digit counts as
//   written, an unshaded cell's digit counts as its negative.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');

// Cages: cell lists transcribed from the drawn cage outlines, top-left
// cell of each cage carrying the printed total. Every cage here totals 3.
const cages = [
  ['R1C3', 'R1C4'],
  ['R1C5', 'R1C6'],
  ['R2C5', 'R2C6', 'R2C7', 'R3C5', 'R3C6', 'R3C7'],
  ['R3C1', 'R3C2'],
  ['R3C3', 'R3C4'],
  ['R3C8', 'R3C9'],
  ['R4C1', 'R5C1'],
  ['R6C1', 'R7C1'],
  ['R8C1', 'R8C2', 'R9C1', 'R9C2'],
  ['R9C3', 'R9C4'],
  ['R8C6', 'R9C5', 'R9C6'],
  ['R7C7', 'R8C7', 'R9C7'],
  ['R4C8', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
  ['R4C4', 'R4C5'],
  ['R5C4', 'R6C4'],
  ['R5C5', 'R6C5'],
  ['R5C6', 'R6C6'],
  ['R4C2', 'R5C2', 'R6C2'],
  ['R6C3', 'R7C2', 'R7C3', 'R8C3'],
];
const CAGE_TOTAL = 3;

// Distinct digits within a cage (the killer-cage half of the rule).
const cageDistinct = cages.map(cells => new AllDifferent(...cells));

// Signed cage total (the other half): one NFA per cage, scanning its cells
// interleaved with their shade flag -- digit, shade, digit, shade, ... --
// and carrying the running signed sum in state ('pending' holds the digit
// just read until its shade decides its sign). maxDepth bounds each cage's
// own automaton to its own length (2 symbols per cell), which keeps the
// compiled state count small even for the largest (6-cell) cage.
function signedCageSum(cells, total) {
  const spec = NFA.encodeSpec({
    startState: { phase: 'digit', sum: 0, pending: null },
    transition: ({ phase, sum, pending }, value) => {
      if (phase === 'digit') return { phase: 'flag', sum, pending: value };
      const signed = value === SHADED ? pending : -pending;
      return { phase: 'digit', sum: sum + signed, pending: null };
    },
    accept: ({ phase, sum }) => phase === 'digit' && sum === total,
    maxDepth: 2 * cells.length,
  }, 9);
  return new NFA(
    spec, 'signed-cage-sum', ...cells.flatMap(cell => [cell, shade.at(cell)]));
}
const cageSums = cages.map(cells => signedCageSum(cells, CAGE_TOTAL));

return [
  new Shape('9x9'),
  new YinYang(),
  ...cageDistinct,
  ...cageSums,
];
